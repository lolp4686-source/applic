const {
  Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField,
  REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder,
  ButtonStyle, ChannelType
} = require('discord.js');
const {
  joinVoiceChannel, createAudioPlayer, createAudioResource,
  AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection
} = require('@discordjs/voice');
const playdl = require('play-dl');

require('dotenv').config();
const TOKEN     = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
if (!TOKEN) { console.error('❌ DISCORD_TOKEN manquant dans .env !'); process.exit(1); }

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions,
  ]
});

// ════════════════════════════════════════════════════════════
//  STOCKAGE
// ════════════════════════════════════════════════════════════
const joinTracker    = new Map();
const spamTracker    = new Map();
const logChannels    = new Map();
const secureRoles    = new Map();
const activeSessions = new Map();
const sessionHistory = new Map();
const whitelistedBots= new Map();
const warnings       = new Map();
const automodConfig  = new Map();
const warnSanctions  = new Map();
const welcomeConfig  = new Map();
const xpData         = new Map();
const xpCooldown     = new Map();
const levelRoles     = new Map();
const xpChannels     = new Map();
const economy        = new Map();
const shopItems      = new Map();
const ticketConfig   = new Map();
const openTickets    = new Map();
const giveaways      = new Map();
const musicQueues    = new Map(); // MUSIQUE

const RAID_THRESHOLD = 10, RAID_WINDOW = 10000;
const SPAM_THRESHOLD = 7,  SPAM_WINDOW = 5000;
const XP_PER_MSG = 15, XP_COOLDOWN = 60000;

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════
function sendLog(guild, embed) { const ch=guild.channels.cache.get(logChannels.get(guild.id)); if(ch) ch.send({embeds:[embed]}).catch(()=>{}); }
function sKey(gId,uId) { return `${gId}:${uId}`; }
function fmt(ms) { const m=Math.floor(ms/60000); return m<60?`${m}min`:`${Math.floor(m/60)}h`; }
function defSanctions(gId) { if(!warnSanctions.has(gId)) warnSanctions.set(gId,{3:'mute10',5:'kick',7:'ban'}); return warnSanctions.get(gId); }
function getEco(gId,uId) { if(!economy.has(gId)) economy.set(gId,new Map()); const g=economy.get(gId); if(!g.has(uId)) g.set(uId,{balance:0,lastDaily:0,lastWork:0}); return g.get(uId); }
function getXP(gId,uId) { if(!xpData.has(gId)) xpData.set(gId,new Map()); const g=xpData.get(gId); if(!g.has(uId)) g.set(uId,{xp:0,level:0}); return g.get(uId); }
function xpForLevel(l) { return l*l*100; }
function getMQ(gId) {
  if (!musicQueues.has(gId)) musicQueues.set(gId,{queue:[],player:null,connection:null,loop:false,volume:100,current:null});
  return musicQueues.get(gId);
}

// ════════════════════════════════════════════════════════════
//  MUSIQUE — LECTURE
// ════════════════════════════════════════════════════════════
async function playNext(guild) {
  const q = getMQ(guild.id);
  if (!q.queue.length && !q.loop) {
    setTimeout(() => { const c=getVoiceConnection(guild.id); if(c) c.destroy(); musicQueues.delete(guild.id); }, 30000);
    return;
  }
  const track = q.loop ? q.current : q.queue.shift();
  if (!track) return;
  q.current = track;
  try {
    const stream = await playdl.stream(track.url, { quality: 2 });
    const resource = createAudioResource(stream.stream, { inputType: stream.type, inlineVolume: true });
    resource.volume?.setVolume(q.volume / 100);
    q.player.play(resource);
    const ch = guild.channels.cache.get(track.textChannelId);
    if (ch) ch.send({ embeds: [new EmbedBuilder().setColor('#7C6FFF').setTitle('🎵 En lecture')
      .setDescription(`**[${track.title}](${track.url})**`)
      .addFields({name:'⏱️ Durée',value:track.duration||'?',inline:true},{name:'👤 Par',value:track.requestedBy,inline:true},{name:'🔁 Loop',value:q.loop?'✅':'❌',inline:true})
      .setThumbnail(track.thumbnail).setTimestamp()] }).catch(()=>{});
  } catch(e) { console.error('Erreur lecture:', e.message); playNext(guild); }
}

// ════════════════════════════════════════════════════════════
//  SLASH COMMANDS
// ════════════════════════════════════════════════════════════
const commands = [
  // Modération
  new SlashCommandBuilder().setName('ban').setDescription('Bannir').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addStringOption(o=>o.setName('raison').setDescription('Raison')),
  new SlashCommandBuilder().setName('kick').setDescription('Expulser').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addStringOption(o=>o.setName('raison').setDescription('Raison')),
  new SlashCommandBuilder().setName('mute').setDescription('Muter').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addIntegerOption(o=>o.setName('duree').setDescription('Minutes').setRequired(true)).addStringOption(o=>o.setName('raison').setDescription('Raison')),
  new SlashCommandBuilder().setName('unmute').setDescription('Démuter').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)),
  new SlashCommandBuilder().setName('warn').setDescription('Avertir').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addStringOption(o=>o.setName('raison').setDescription('Raison').setRequired(true)),
  new SlashCommandBuilder().setName('warns').setDescription('Voir les warns').addUserOption(o=>o.setName('membre').setDescription('Membre')),
  new SlashCommandBuilder().setName('clearwarns').setDescription('Supprimer warns').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)),
  new SlashCommandBuilder().setName('clear').setDescription('Supprimer messages').addIntegerOption(o=>o.setName('nombre').setDescription('1-100').setRequired(true)),
  new SlashCommandBuilder().setName('slowmode').setDescription('Slowmode').addIntegerOption(o=>o.setName('secondes').setDescription('0=off').setRequired(true)),
  new SlashCommandBuilder().setName('setlog').setDescription('Salon de logs').addChannelOption(o=>o.setName('salon').setDescription('Salon').setRequired(true)),
  // AutoMod
  new SlashCommandBuilder().setName('automod').setDescription('AutoMod')
    .addSubcommand(s=>s.setName('status').setDescription('Config'))
    .addSubcommand(s=>s.setName('links').setDescription('Anti-liens'))
    .addSubcommand(s=>s.setName('caps').setDescription('Anti-caps'))
    .addSubcommand(s=>s.setName('mentions').setDescription('Anti-mentions').addIntegerOption(o=>o.setName('limite').setDescription('Limite')))
    .addSubcommand(s=>s.setName('addword').setDescription('Ajouter mot').addStringOption(o=>o.setName('mot').setDescription('Mot').setRequired(true)))
    .addSubcommand(s=>s.setName('removeword').setDescription('Retirer mot').addStringOption(o=>o.setName('mot').setDescription('Mot').setRequired(true))),
  // Sanctions
  new SlashCommandBuilder().setName('sanctions').setDescription('Sanctions auto')
    .addSubcommand(s=>s.setName('list').setDescription('Liste'))
    .addSubcommand(s=>s.setName('set').setDescription('Définir').addIntegerOption(o=>o.setName('warns').setDescription('Warns').setRequired(true)).addStringOption(o=>o.setName('action').setDescription('mute10/kick/ban').setRequired(true))),
  // Sécurisés
  new SlashCommandBuilder().setName('securesetup').setDescription('Rôles sécurisés 👑').addRoleOption(o=>o.setName('role_visible').setDescription('Rôle visible').setRequired(true)).addRoleOption(o=>o.setName('role_perms').setDescription('Rôle perms').setRequired(true)).addIntegerOption(o=>o.setName('duree').setDescription('Minutes').setRequired(true)).addStringOption(o=>o.setName('pin').setDescription('PIN')),
  new SlashCommandBuilder().setName('secure').setDescription('Activer session').addStringOption(o=>o.setName('pin').setDescription('PIN')),
  new SlashCommandBuilder().setName('secureend').setDescription('Terminer session'),
  new SlashCommandBuilder().setName('securestatus').setDescription('Sessions actives 👑'),
  new SlashCommandBuilder().setName('securehistory').setDescription('Historique 👑'),
  new SlashCommandBuilder().setName('securestaff').setDescription('Staff temporaire 👑').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addIntegerOption(o=>o.setName('duree').setDescription('Minutes').setRequired(true)),
  // Whitelist
  new SlashCommandBuilder().setName('wladd').setDescription('Whitelister bot 👑').addStringOption(o=>o.setName('botid').setDescription('ID').setRequired(true)),
  new SlashCommandBuilder().setName('wlremove').setDescription('Retirer bot 👑').addStringOption(o=>o.setName('botid').setDescription('ID').setRequired(true)),
  new SlashCommandBuilder().setName('wllist').setDescription('Liste whitelist'),
  // Bienvenue
  new SlashCommandBuilder().setName('welcome').setDescription('Bienvenue')
    .addSubcommand(s=>s.setName('setup').setDescription('Configurer').addChannelOption(o=>o.setName('salon').setDescription('Salon').setRequired(true)).addStringOption(o=>o.setName('message').setDescription('Message')).addRoleOption(o=>o.setName('role').setDescription('Rôle auto')))
    .addSubcommand(s=>s.setName('disable').setDescription('Désactiver')),
  // XP
  new SlashCommandBuilder().setName('level').setDescription('Voir niveau').addUserOption(o=>o.setName('membre').setDescription('Membre')),
  new SlashCommandBuilder().setName('top').setDescription('Classement XP'),
  new SlashCommandBuilder().setName('xpsetup').setDescription('Config XP 👑')
    .addSubcommand(s=>s.setName('channel').setDescription('Salon annonces').addChannelOption(o=>o.setName('salon').setDescription('Salon').setRequired(true)))
    .addSubcommand(s=>s.setName('rolereward').setDescription('Récompense rôle').addIntegerOption(o=>o.setName('niveau').setDescription('Niveau').setRequired(true)).addRoleOption(o=>o.setName('role').setDescription('Rôle').setRequired(true))),
  // Économie
  new SlashCommandBuilder().setName('balance').setDescription('Solde').addUserOption(o=>o.setName('membre').setDescription('Membre')),
  new SlashCommandBuilder().setName('daily').setDescription('Daily coins'),
  new SlashCommandBuilder().setName('work').setDescription('Travailler'),
  new SlashCommandBuilder().setName('pay').setDescription('Envoyer coins').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addIntegerOption(o=>o.setName('montant').setDescription('Montant').setRequired(true)),
  new SlashCommandBuilder().setName('shop').setDescription('Shop de rôles'),
  new SlashCommandBuilder().setName('buy').setDescription('Acheter').addStringOption(o=>o.setName('item').setDescription('Nom').setRequired(true)),
  new SlashCommandBuilder().setName('addshop').setDescription('Ajouter item 👑').addStringOption(o=>o.setName('nom').setDescription('Nom').setRequired(true)).addIntegerOption(o=>o.setName('prix').setDescription('Prix').setRequired(true)).addRoleOption(o=>o.setName('role').setDescription('Rôle').setRequired(true)),
  // Fun
  new SlashCommandBuilder().setName('8ball').setDescription('Boule magique').addStringOption(o=>o.setName('question').setDescription('Question').setRequired(true)),
  new SlashCommandBuilder().setName('dice').setDescription('Lancer dé').addIntegerOption(o=>o.setName('faces').setDescription('Faces')),
  new SlashCommandBuilder().setName('poll').setDescription('Sondage').addStringOption(o=>o.setName('question').setDescription('Question').setRequired(true)).addStringOption(o=>o.setName('choix1').setDescription('Choix 1').setRequired(true)).addStringOption(o=>o.setName('choix2').setDescription('Choix 2').setRequired(true)).addStringOption(o=>o.setName('choix3').setDescription('Choix 3')).addStringOption(o=>o.setName('choix4').setDescription('Choix 4')),
  new SlashCommandBuilder().setName('giveaway').setDescription('Giveaway 👑').addStringOption(o=>o.setName('lot').setDescription('Lot').setRequired(true)).addIntegerOption(o=>o.setName('duree').setDescription('Minutes').setRequired(true)).addIntegerOption(o=>o.setName('gagnants').setDescription('Gagnants').setRequired(true)),
  new SlashCommandBuilder().setName('blague').setDescription('Blague'),
  new SlashCommandBuilder().setName('rps').setDescription('Pierre-Feuille-Ciseaux').addStringOption(o=>o.setName('choix').setDescription('pierre/feuille/ciseaux').setRequired(true)),
  new SlashCommandBuilder().setName('avatar').setDescription('Avatar').addUserOption(o=>o.setName('membre').setDescription('Membre')),
  // Tickets
  new SlashCommandBuilder().setName('ticketsetup').setDescription('Config tickets 👑').addChannelOption(o=>o.setName('categorie').setDescription('Catégorie').setRequired(true)).addRoleOption(o=>o.setName('support').setDescription('Support').setRequired(true)).addChannelOption(o=>o.setName('logs').setDescription('Logs')),
  new SlashCommandBuilder().setName('ticket').setDescription('Créer ticket'),
  new SlashCommandBuilder().setName('closeticket').setDescription('Fermer ticket'),
  // Musique 🎵
  new SlashCommandBuilder().setName('play').setDescription('🎵 Jouer une musique').addStringOption(o=>o.setName('recherche').setDescription('Nom ou URL YouTube').setRequired(true)),
  new SlashCommandBuilder().setName('skip').setDescription('🎵 Passer la musique'),
  new SlashCommandBuilder().setName('stop').setDescription('🎵 Arrêter la musique'),
  new SlashCommandBuilder().setName('pause').setDescription('🎵 Pause'),
  new SlashCommandBuilder().setName('resume').setDescription('🎵 Reprendre'),
  new SlashCommandBuilder().setName('queue').setDescription('🎵 File d\'attente'),
  new SlashCommandBuilder().setName('nowplaying').setDescription('🎵 Musique en cours'),
  new SlashCommandBuilder().setName('volume').setDescription('🎵 Volume').addIntegerOption(o=>o.setName('niveau').setDescription('1-100').setRequired(true)),
  new SlashCommandBuilder().setName('shuffle').setDescription('🎵 Mélanger la file'),
  new SlashCommandBuilder().setName('loop').setDescription('🎵 Répéter la musique'),
  new SlashCommandBuilder().setName('leave').setDescription('🎵 Quitter le salon vocal'),
  // Info
  new SlashCommandBuilder().setName('ping').setDescription('Latence'),
  new SlashCommandBuilder().setName('serverinfo').setDescription('Infos serveur'),
  new SlashCommandBuilder().setName('userinfo').setDescription('Infos membre').addUserOption(o=>o.setName('membre').setDescription('Membre')),
].map(c=>c.toJSON());

async function registerCommands() {
  if (!CLIENT_ID) return;
  try {
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    console.log('📡 Enregistrement des slash commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log(`✅ ${commands.length} slash commands enregistrées !`);
  } catch(e) { console.error('❌ Erreur:', e.message); }
}

client.once('ready', async () => {
  console.log(`✅ Bot ${client.user.tag} en ligne !`);
  console.log(`📡 Serveurs : ${client.guilds.cache.size}`);
  client.user.setActivity('🛡️ Los Galactique Protect', { type: 3 });
  await registerCommands();
});

// ════════════════════════════════════════════════════════════
//  EVENTS
// ════════════════════════════════════════════════════════════
client.on('guildMemberAdd', async (member) => {
  const guild=member.guild; const gId=guild.id; const now=Date.now();
  if (member.user.bot) {
    const wl=whitelistedBots.get(gId);
    if (!wl||!wl.has(member.user.id)) { try{await member.ban({reason:'🤖 Bot non autorisé'});sendLog(guild,new EmbedBuilder().setColor('#FF4F6F').setTitle('🤖 Bot banni').setDescription(`**${member.user.tag}**`).setTimestamp());}catch(e){} }
    return;
  }
  if (!joinTracker.has(gId)) joinTracker.set(gId,[]);
  const joins=joinTracker.get(gId).filter(t=>now-t<RAID_WINDOW); joins.push(now); joinTracker.set(gId,joins);
  if (joins.length>=RAID_THRESHOLD) { sendLog(guild,new EmbedBuilder().setColor('#FF4F6F').setTitle('🚨 RAID').setDescription(`${joins.length} joins en 10s`).setTimestamp()); if(now-member.user.createdTimestamp<7*24*60*60*1000){try{await member.ban({reason:'🚨 Anti-raid'});}catch(e){}} }
  const wc=welcomeConfig.get(gId);
  if (wc?.channelId) {
    const ch=guild.channels.cache.get(wc.channelId);
    if (ch) { const msg=(wc.message||'Bienvenue {user} sur **{server}** ! 🎉').replace('{user}',member.toString()).replace('{server}',guild.name); ch.send({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle('👋 Nouveau membre !').setDescription(msg).setThumbnail(member.user.displayAvatarURL()).setTimestamp()]}).catch(()=>{}); }
    if (wc.roleId) { try{await member.roles.add(wc.roleId);}catch(e){} }
  }
  sendLog(guild,new EmbedBuilder().setColor('#4FFFB0').setTitle('✅ Nouveau membre').setDescription(`**${member.user.tag}**`).addFields({name:'Compte créé',value:`<t:${Math.floor(member.user.createdTimestamp/1000)}:R>`}).setTimestamp());
});

client.on('guildMemberRemove', async (member) => {
  const wc=welcomeConfig.get(member.guild.id);
  if (wc?.channelId) { const ch=member.guild.channels.cache.get(wc.channelId); if(ch) ch.send({embeds:[new EmbedBuilder().setColor('#FF4F6F').setTitle('👋 Départ').setDescription(`**${member.user.tag}** a quitté.`).setTimestamp()]}).catch(()=>{}); }
  sendLog(member.guild,new EmbedBuilder().setColor('#FF4F6F').setTitle('👋 Parti').setDescription(`**${member.user.tag}**`).setTimestamp());
});

client.on('guildBanAdd', b=>sendLog(b.guild,new EmbedBuilder().setColor('#FF4F6F').setTitle('🔨 Banni').setDescription(`**${b.user.tag}**`).addFields({name:'Raison',value:b.reason||'—'}).setTimestamp()));

client.on('messageCreate', async (msg) => {
  if (!msg.guild||msg.author.bot) return;
  const now=Date.now(); const ck=`${msg.guild.id}:${msg.author.id}`;
  if (!xpCooldown.has(ck)||now-xpCooldown.get(ck)>XP_COOLDOWN) {
    xpCooldown.set(ck,now); const d=getXP(msg.guild.id,msg.author.id); d.xp+=XP_PER_MSG+Math.floor(Math.random()*10);
    const xpN=xpForLevel(d.level+1);
    if (d.xp>=xpN) { d.level++; d.xp=0; const lCh=msg.guild.channels.cache.get(xpChannels.get(msg.guild.id))||msg.channel; lCh.send({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle('⬆️ Level Up !').setDescription(`🎉 **${msg.author.tag}** → niveau **${d.level}** !`).setThumbnail(msg.author.displayAvatarURL()).setTimestamp()]}).catch(()=>{}); const rw=(levelRoles.get(msg.guild.id)||[]).find(r=>r.level===d.level); if(rw){try{await msg.member.roles.add(rw.roleId);}catch(e){}} }
  }
  const cfg=automodConfig.get(msg.guild.id);
  if (cfg&&!msg.member?.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    let v=null; const c=msg.content;
    if(cfg.bannedWords?.length){const f=cfg.bannedWords.find(w=>c.toLowerCase().includes(w));if(f)v=`Mot interdit : \`${f}\``;}
    if(!v&&cfg.antiLinks&&/(https?:\/\/|discord\.gg\/|www\.)/i.test(c))v='Lien non autorisé';
    if(!v&&cfg.antiCaps&&c.length>10&&c.replace(/[^A-Z]/g,'').length/c.length>0.7)v='Trop de majuscules';
    if(!v&&cfg.antiMassMention&&msg.mentions.users.size>=(cfg.mentionLimit||5))v=`Mentions massives (${msg.mentions.users.size})`;
    if(v){try{await msg.delete();}catch(e){} const w=await msg.channel.send(`⚠️ **${msg.author.tag}** — ${v}`);setTimeout(()=>w.delete().catch(()=>{}),5000);sendLog(msg.guild,new EmbedBuilder().setColor('#FFB84F').setTitle('🤖 AutoMod').setDescription(`**${msg.author.tag}** — ${v}`).setTimestamp());}
  }
  if(!spamTracker.has(msg.author.id))spamTracker.set(msg.author.id,[]);
  const sm=spamTracker.get(msg.author.id).filter(t=>now-t<SPAM_WINDOW);sm.push(now);spamTracker.set(msg.author.id,sm);
  if(sm.length>=SPAM_THRESHOLD){try{await msg.member?.timeout(5*60*1000,'🚫 Anti-spam');sendLog(msg.guild,new EmbedBuilder().setColor('#FFB84F').setTitle('⚠️ Spam').setDescription(`**${msg.author.tag}**`).setTimestamp());spamTracker.set(msg.author.id,[]);}catch(e){}}
});

client.on('messageReactionAdd',(reaction,user)=>{ if(user.bot||reaction.emoji.name!=='🎉')return; const g=giveaways.get(reaction.message.id); if(g)g.entries.add(user.id); });
client.on('messageReactionRemove',(reaction,user)=>{ if(user.bot||reaction.emoji.name!=='🎉')return; const g=giveaways.get(reaction.message.id); if(g)g.entries.delete(user.id); });

// ════════════════════════════════════════════════════════════
//  INTERACTIONS
// ════════════════════════════════════════════════════════════
client.on('interactionCreate', async (interaction) => {
  // BOUTONS TICKETS
  if (interaction.isButton()) {
    if (interaction.customId==='create_ticket') {
      const guild=interaction.guild; const tc=ticketConfig.get(guild.id);
      if (!tc) return interaction.reply({content:'❌ Tickets non configurés.',ephemeral:true});
      const ex=[...openTickets.entries()].find(([,v])=>v.userId===interaction.user.id&&v.guildId===guild.id);
      if (ex) return interaction.reply({content:`❌ Ticket existant : <#${ex[0]}>`,ephemeral:true});
      try {
        const ch=await guild.channels.create({name:`ticket-${interaction.user.username}`,type:ChannelType.GuildText,parent:tc.categoryId,permissionOverwrites:[{id:guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},{id:interaction.user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]},{id:tc.supportRoleId,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]},{id:client.user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]}]});
        openTickets.set(ch.id,{userId:interaction.user.id,guildId:guild.id});
        const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('Fermer').setStyle(ButtonStyle.Danger).setEmoji('🔒'));
        await ch.send({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle('🎫 Ticket').setDescription(`Bonjour ${interaction.user} ! Décrivez votre problème.`).setTimestamp()],components:[row]});
        return interaction.reply({content:`✅ Ticket créé : ${ch}`,ephemeral:true});
      } catch(e){return interaction.reply({content:'❌ Impossible.',ephemeral:true});}
    }
    if (interaction.customId==='close_ticket') {
      if (!openTickets.has(interaction.channelId)) return interaction.reply({content:'❌ Pas un ticket.',ephemeral:true});
      openTickets.delete(interaction.channelId);
      await interaction.reply({embeds:[new EmbedBuilder().setColor('#FF4F6F').setTitle('🔒 Fermé').setDescription(`Par **${interaction.user.tag}**`).setTimestamp()]});
      setTimeout(()=>interaction.channel.delete().catch(()=>{}),5000); return;
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;
  const {commandName,guild,member}=interaction;
  const isAdmin=member.permissions.has(PermissionsBitField.Flags.Administrator);
  const isMod=member.permissions.has(PermissionsBitField.Flags.ManageMessages);
  const isOwner=interaction.user.id===guild.ownerId;

  await interaction.deferReply().catch(()=>{});

  try {
    // ── MODÉRATION ──
    if(commandName==='ping') return interaction.editReply(`🏓 **${client.ws.ping}ms**`);
    if(commandName==='setlog'){if(!isAdmin)return interaction.editReply('❌');const ch=interaction.options.getChannel('salon');logChannels.set(guild.id,ch.id);return interaction.editReply(`✅ Logs → <#${ch.id}>`);}
    if(commandName==='ban'){if(!isAdmin)return interaction.editReply('❌');const t=interaction.options.getMember('membre');const r=interaction.options.getString('raison')||'—';try{await t.ban({reason:r});sendLog(guild,new EmbedBuilder().setColor('#FF4F6F').setTitle('🔨 Banni').setDescription(`**${t.user.tag}**`).addFields({name:'Raison',value:r}).setTimestamp());return interaction.editReply(`✅ **${t.user.tag}** banni.`);}catch(e){return interaction.editReply('❌');}}
    if(commandName==='kick'){if(!isAdmin)return interaction.editReply('❌');const t=interaction.options.getMember('membre');const r=interaction.options.getString('raison')||'—';try{await t.kick(r);sendLog(guild,new EmbedBuilder().setColor('#FFB84F').setTitle('👢 Expulsé').setDescription(`**${t.user.tag}**`).setTimestamp());return interaction.editReply(`✅ **${t.user.tag}** expulsé.`);}catch(e){return interaction.editReply('❌');}}
    if(commandName==='mute'){if(!isMod)return interaction.editReply('❌');const t=interaction.options.getMember('membre');const dur=interaction.options.getInteger('duree')*60000;const r=interaction.options.getString('raison')||'—';try{await t.timeout(dur,r);sendLog(guild,new EmbedBuilder().setColor('#FFB84F').setTitle('🔇 Mute').setDescription(`**${t.user.tag}** ${fmt(dur)}`).setTimestamp());return interaction.editReply(`✅ Muté **${fmt(dur)}**.`);}catch(e){return interaction.editReply('❌');}}
    if(commandName==='unmute'){if(!isMod)return interaction.editReply('❌');const t=interaction.options.getMember('membre');try{await t.timeout(null);return interaction.editReply(`✅ **${t.user.tag}** démute.`);}catch(e){return interaction.editReply('❌');}}
    if(commandName==='warn'){if(!isMod)return interaction.editReply('❌');const t=interaction.options.getMember('membre');const r=interaction.options.getString('raison');if(!warnings.has(guild.id))warnings.set(guild.id,new Map());const gW=warnings.get(guild.id);if(!gW.has(t.id))gW.set(t.id,[]);gW.get(t.id).push({reason:r,date:Date.now(),modTag:interaction.user.tag});const count=gW.get(t.id).length;const embed=new EmbedBuilder().setColor('#FFB84F').setTitle(`⚠️ Warn #${count}`).setDescription(`**${t.user.tag}**`).addFields({name:'Raison',value:r}).setTimestamp();sendLog(guild,embed);interaction.editReply({embeds:[embed]});const s=defSanctions(guild.id);const sanc=s[count];if(sanc){if(sanc.startsWith('mute')){const m=parseInt(sanc.replace('mute',''))||10;try{await t.timeout(m*60000);}catch(e){}}else if(sanc==='kick'){try{await t.kick();}catch(e){}}else if(sanc==='ban'){try{await t.ban();}catch(e){}}}return;}
    if(commandName==='warns'){const t=interaction.options.getMember('membre')||member;const w=warnings.get(guild.id)?.get(t.id)||[];if(!w.length)return interaction.editReply(`✅ Aucun warn.`);return interaction.editReply({embeds:[new EmbedBuilder().setColor('#FFB84F').setTitle(`⚠️ Warns de ${t.user.tag}`).setDescription(w.map((x,i)=>`**#${i+1}** ${x.reason} *(${x.modTag})*`).join('\n')).setTimestamp()]});}
    if(commandName==='clearwarns'){if(!isAdmin)return interaction.editReply('❌');const t=interaction.options.getMember('membre');warnings.get(guild.id)?.delete(t.id);return interaction.editReply(`✅ Warns supprimés.`);}
    if(commandName==='clear'){if(!isMod)return interaction.editReply('❌');const n=interaction.options.getInteger('nombre');try{await interaction.channel.bulkDelete(n,true);return interaction.editReply(`✅ **${n}** messages supprimés.`);}catch(e){return interaction.editReply('❌ Messages > 14 jours.');}}
    if(commandName==='slowmode'){if(!isMod)return interaction.editReply('❌');const s=interaction.options.getInteger('secondes');try{await interaction.channel.setRateLimitPerUser(s);return interaction.editReply(s===0?'✅ Slowmode off.':`✅ Slowmode **${s}s**.`);}catch(e){return interaction.editReply('❌');}}

    // ── AUTOMOD ──
    if(commandName==='automod'){if(!isAdmin)return interaction.editReply('❌');if(!automodConfig.has(guild.id))automodConfig.set(guild.id,{});const cfg=automodConfig.get(guild.id);const sub=interaction.options.getSubcommand();if(sub==='status')return interaction.editReply({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle('🤖 AutoMod').addFields({name:'Anti-liens',value:cfg.antiLinks?'✅':'❌',inline:true},{name:'Anti-caps',value:cfg.antiCaps?'✅':'❌',inline:true},{name:'Anti-mentions',value:cfg.antiMassMention?`✅(>${cfg.mentionLimit||5})`:'❌',inline:true},{name:'Mots interdits',value:cfg.bannedWords?.join(', ')||'Aucun'}).setTimestamp()]});if(sub==='links'){cfg.antiLinks=!cfg.antiLinks;return interaction.editReply(`Anti-liens : ${cfg.antiLinks?'✅':'❌'}`);}if(sub==='caps'){cfg.antiCaps=!cfg.antiCaps;return interaction.editReply(`Anti-caps : ${cfg.antiCaps?'✅':'❌'}`);}if(sub==='mentions'){cfg.antiMassMention=!cfg.antiMassMention;cfg.mentionLimit=interaction.options.getInteger('limite')||5;return interaction.editReply(`Anti-mentions : ${cfg.antiMassMention?'✅':'❌'}(>${cfg.mentionLimit})`);}if(sub==='addword'){const w=interaction.options.getString('mot').toLowerCase();if(!cfg.bannedWords)cfg.bannedWords=[];cfg.bannedWords.push(w);return interaction.editReply(`✅ \`${w}\` ajouté.`);}if(sub==='removeword'){const w=interaction.options.getString('mot').toLowerCase();cfg.bannedWords=cfg.bannedWords?.filter(x=>x!==w)||[];return interaction.editReply(`✅ \`${w}\` retiré.`);}}

    // ── SANCTIONS ──
    if(commandName==='sanctions'){if(!isOwner)return interaction.editReply('👑');const s=defSanctions(guild.id);const sub=interaction.options.getSubcommand();if(sub==='set'){const n=interaction.options.getInteger('warns');const a=interaction.options.getString('action');s[n]=a;return interaction.editReply(`✅ **${n} warns** → \`${a}\``);}return interaction.editReply({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle('⚖️ Sanctions').setDescription(Object.entries(s).map(([k,v])=>`**${k} warns** → \`${v}\``).join('\n')).setTimestamp()]});}

    // ── RÔLES SÉCURISÉS ──
    if(commandName==='securesetup'){if(!isOwner)return interaction.editReply('👑');const dR=interaction.options.getRole('role_visible');const pR=interaction.options.getRole('role_perms');const dur=interaction.options.getInteger('duree')*60000;const pin=interaction.options.getString('pin')||null;secureRoles.set(guild.id,{displayRoleId:dR.id,permRoleId:pR.id,sessionDuration:dur,pin,autoGrant:true});return interaction.editReply({embeds:[new EmbedBuilder().setColor('#4FFFB0').setTitle('🔐 Configuré').addFields({name:'Visible',value:`<@&${dR.id}>`,inline:true},{name:'Perms',value:`<@&${pR.id}>`,inline:true},{name:'Durée',value:fmt(dur),inline:true}).setTimestamp()]});}
    if(commandName==='secure'){const sr=secureRoles.get(guild.id);if(!sr)return interaction.editReply('❌ Non configuré.');if(!member.roles.cache.has(sr.displayRoleId))return interaction.editReply('❌ Rôle insuffisant.');if(sr.pin&&interaction.options.getString('pin')!==sr.pin)return interaction.editReply('❌ PIN incorrect.');const key=sKey(guild.id,interaction.user.id);if(activeSessions.has(key)){const rem=Math.ceil((activeSessions.get(key).expiresAt-Date.now())/60000);return interaction.editReply(`⚠️ Session active ! ${rem}min restantes.`);}await startSession(member,guild,sr,'Slash');const s=activeSessions.get(key);return interaction.editReply({embeds:[new EmbedBuilder().setColor('#4FFFB0').setTitle('🔐 Session activée').addFields({name:'Expire',value:`<t:${Math.floor(s.expiresAt/1000)}:R>`}).setTimestamp()]});}
    if(commandName==='secureend'){const key=sKey(guild.id,interaction.user.id);if(!activeSessions.has(key))return interaction.editReply('❌ Aucune session.');await endSession(guild,member,'Manuelle');return interaction.editReply('✅ Session terminée.');}
    if(commandName==='securestatus'){if(!isOwner)return interaction.editReply('👑');const sessions=[...activeSessions.entries()].filter(([k])=>k.startsWith(guild.id));if(!sessions.length)return interaction.editReply('ℹ️ Aucune session.');const embed=new EmbedBuilder().setColor('#7C6FFF').setTitle('🔐 Sessions');sessions.forEach(([k,s])=>embed.addFields({name:`<@${k.split(':')[1]}>`,value:`Expire <t:${Math.floor(s.expiresAt/1000)}:R>`}));return interaction.editReply({embeds:[embed]});}
    if(commandName==='securehistory'){if(!isOwner)return interaction.editReply('👑');const h=sessionHistory.get(guild.id)||[];if(!h.length)return interaction.editReply('ℹ️ Aucun historique.');const embed=new EmbedBuilder().setColor('#7C6FFF').setTitle('📋 Historique');h.slice(0,5).forEach(s=>embed.addFields({name:s.username,value:`${fmt(s.end-s.start)} | ${s.actions.join(', ')||'—'}`}));return interaction.editReply({embeds:[embed]});}
    if(commandName==='securestaff'){if(!isOwner)return interaction.editReply('👑');const t=interaction.options.getMember('membre');const dur=interaction.options.getInteger('duree')*60000;const sr=secureRoles.get(guild.id);if(!sr)return interaction.editReply('❌ `/securesetup` d\'abord.');try{await t.roles.add(sr.permRoleId);setTimeout(async()=>{try{await t.roles.remove(sr.permRoleId);sendLog(guild,new EmbedBuilder().setColor('#FFB84F').setTitle('⏰ Staff expiré').setDescription(`**${t.user.tag}**`).setTimestamp());}catch(e){}},dur);return interaction.editReply({embeds:[new EmbedBuilder().setColor('#4FFFB0').setTitle('👮 Staff temporaire').setDescription(`**${t.user.tag}** — ${fmt(dur)}`).addFields({name:'Expire',value:`<t:${Math.floor((Date.now()+dur)/1000)}:R>`}).setTimestamp()]});}catch(e){return interaction.editReply('❌');}}

    // ── WHITELIST ──
    if(commandName==='wladd'){if(!isOwner)return interaction.editReply('👑');const id=interaction.options.getString('botid');if(!whitelistedBots.has(guild.id))whitelistedBots.set(guild.id,new Set());whitelistedBots.get(guild.id).add(id);return interaction.editReply(`✅ \`${id}\` whitelisté.`);}
    if(commandName==='wlremove'){if(!isOwner)return interaction.editReply('👑');whitelistedBots.get(guild.id)?.delete(interaction.options.getString('botid'));return interaction.editReply('✅ Retiré.');}
    if(commandName==='wllist'){const wl=whitelistedBots.get(guild.id);if(!wl?.size)return interaction.editReply('ℹ️ Vide.');return interaction.editReply({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle('🤖 Whitelist').setDescription([...wl].map(id=>`• \`${id}\``).join('\n')).setTimestamp()]});}

    // ── BIENVENUE ──
    if(commandName==='welcome'){if(!isAdmin)return interaction.editReply('❌');const sub=interaction.options.getSubcommand();if(sub==='disable'){welcomeConfig.delete(guild.id);return interaction.editReply('✅ Désactivé.');}const ch=interaction.options.getChannel('salon');const msg=interaction.options.getString('message');const role=interaction.options.getRole('role');welcomeConfig.set(guild.id,{channelId:ch.id,message:msg,roleId:role?.id});return interaction.editReply({embeds:[new EmbedBuilder().setColor('#4FFFB0').setTitle('👋 Bienvenue configuré').addFields({name:'Salon',value:`<#${ch.id}>`,inline:true},{name:'Rôle',value:role?`<@&${role.id}>`:'Aucun',inline:true}).setTimestamp()]})}

    // ── XP ──
    if(commandName==='level'){const t=interaction.options.getMember('membre')||member;const d=getXP(guild.id,t.id);const xpN=xpForLevel(d.level+1);const prog=Math.floor((d.xp/xpN)*20);const bar='█'.repeat(prog)+'░'.repeat(20-prog);return interaction.editReply({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle(`⭐ ${t.user.tag}`).addFields({name:'Niveau',value:`**${d.level}**`,inline:true},{name:'XP',value:`**${d.xp}/${xpN}**`,inline:true},{name:'Progression',value:`\`${bar}\``}).setThumbnail(t.user.displayAvatarURL()).setTimestamp()]});}
    if(commandName==='top'){const gX=xpData.get(guild.id);if(!gX?.size)return interaction.editReply('ℹ️ Aucune donnée.');const sorted=[...gX.entries()].sort((a,b)=>(b[1].level*10000+b[1].xp)-(a[1].level*10000+a[1].xp)).slice(0,10);return interaction.editReply({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle('🏆 Top XP').setDescription(sorted.map(([uid,d],i)=>`**${i+1}.** <@${uid}> — Niv.**${d.level}** (${d.xp}xp)`).join('\n')).setTimestamp()]});}
    if(commandName==='xpsetup'){if(!isOwner)return interaction.editReply('👑');const sub=interaction.options.getSubcommand();if(sub==='channel'){const ch=interaction.options.getChannel('salon');xpChannels.set(guild.id,ch.id);return interaction.editReply(`✅ Level up → <#${ch.id}>`);}if(sub==='rolereward'){const lvl=interaction.options.getInteger('niveau');const role=interaction.options.getRole('role');if(!levelRoles.has(guild.id))levelRoles.set(guild.id,[]);levelRoles.get(guild.id).push({level:lvl,roleId:role.id});return interaction.editReply(`✅ Niveau **${lvl}** → <@&${role.id}>`);}}

    // ── ÉCONOMIE ──
    if(commandName==='balance'){const t=interaction.options.getMember('membre')||member;const eco=getEco(guild.id,t.id);return interaction.editReply({embeds:[new EmbedBuilder().setColor('#FFB84F').setTitle(`💰 ${t.user.tag}`).setDescription(`**${eco.balance.toLocaleString()} 🪙**`).setThumbnail(t.user.displayAvatarURL()).setTimestamp()]})}
    if(commandName==='daily'){const eco=getEco(guild.id,interaction.user.id);const now2=Date.now();if(now2-eco.lastDaily<86400000){const rem=Math.ceil((86400000-(now2-eco.lastDaily))/3600000);return interaction.editReply(`⏰ Revenez dans **${rem}h** !`);}const gain=200+Math.floor(Math.random()*100);eco.balance+=gain;eco.lastDaily=now2;return interaction.editReply({embeds:[new EmbedBuilder().setColor('#FFB84F').setTitle('💰 Daily !').setDescription(`+**${gain} 🪙** | Solde : **${eco.balance} 🪙**`).setTimestamp()]})}
    if(commandName==='work'){const eco=getEco(guild.id,interaction.user.id);const now2=Date.now();if(now2-eco.lastWork<14400000){const rem=Math.ceil((14400000-(now2-eco.lastWork))/60000);return interaction.editReply(`⏰ Revenez dans **${rem}min** !`);}const gain=50+Math.floor(Math.random()*100);const jobs=['développeur','cuisinier','chauffeur','médecin','artiste','pompier'];eco.balance+=gain;eco.lastWork=now2;return interaction.editReply({embeds:[new EmbedBuilder().setColor('#4FFFB0').setTitle('💼 Travail !').setDescription(`Vous avez gagné **${gain} 🪙** comme **${jobs[Math.floor(Math.random()*jobs.length)]}** !\nSolde : **${eco.balance} 🪙**`).setTimestamp()]})}
    if(commandName==='pay'){const t=interaction.options.getMember('membre');const amount=interaction.options.getInteger('montant');if(amount<=0)return interaction.editReply('❌ Montant invalide.');const sEco=getEco(guild.id,interaction.user.id);if(sEco.balance<amount)return interaction.editReply(`❌ Solde insuffisant (${sEco.balance} 🪙)`);const rEco=getEco(guild.id,t.id);sEco.balance-=amount;rEco.balance+=amount;return interaction.editReply({embeds:[new EmbedBuilder().setColor('#4FFFB0').setTitle('💸 Transfert').addFields({name:'À',value:t.user.tag,inline:true},{name:'Montant',value:`**${amount} 🪙**`,inline:true},{name:'Solde',value:`**${sEco.balance} 🪙**`,inline:true}).setTimestamp()]})}
    if(commandName==='shop'){const items=shopItems.get(guild.id)||[];if(!items.length)return interaction.editReply('🛒 Shop vide. `/addshop`');return interaction.editReply({embeds:[new EmbedBuilder().setColor('#FFB84F').setTitle('🛒 Shop').setDescription(items.map((item,i)=>`**${i+1}.** ${item.name} — **${item.price} 🪙** → <@&${item.roleId}>`).join('\n')).setFooter({text:'/buy <nom>'}).setTimestamp()]})}
    if(commandName==='buy'){const name=interaction.options.getString('item').toLowerCase();const item=(shopItems.get(guild.id)||[]).find(i=>i.name.toLowerCase()===name);if(!item)return interaction.editReply('❌ Item introuvable.');const eco=getEco(guild.id,interaction.user.id);if(eco.balance<item.price)return interaction.editReply(`❌ Solde insuffisant (${eco.balance}/${item.price} 🪙)`);eco.balance-=item.price;try{await member.roles.add(item.roleId);return interaction.editReply({embeds:[new EmbedBuilder().setColor('#4FFFB0').setTitle('✅ Acheté !').setDescription(`**${item.name}** pour **${item.price} 🪙** !\nSolde : **${eco.balance} 🪙**`).setTimestamp()]});}catch(e){return interaction.editReply('❌ Impossible d\'ajouter le rôle.');}}
    if(commandName==='addshop'){if(!isOwner)return interaction.editReply('👑');const name=interaction.options.getString('nom');const price=interaction.options.getInteger('prix');const role=interaction.options.getRole('role');if(!shopItems.has(guild.id))shopItems.set(guild.id,[]);shopItems.get(guild.id).push({name,price,roleId:role.id});return interaction.editReply(`✅ **${name}** ajouté pour **${price} 🪙**`);}

    // ── FUN ──
    if(commandName==='8ball'){const q=interaction.options.getString('question');const rep=['Oui !','Non !','Peut-être...','Absolument !','Je ne pense pas.','Sans aucun doute !','Demandez plus tard.','Certainement !','Les signes disent non.','Très probable !'];return interaction.editReply({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle('🎱 Boule magique').addFields({name:'Question',value:q},{name:'Réponse',value:`**${rep[Math.floor(Math.random()*rep.length)]}**`}).setTimestamp()]})}
    if(commandName==='dice'){const f=interaction.options.getInteger('faces')||6;return interaction.editReply(`🎲 Dé **${f}** faces : **${Math.floor(Math.random()*f)+1}** !`);}
    if(commandName==='poll'){const q=interaction.options.getString('question');const choices=[interaction.options.getString('choix1'),interaction.options.getString('choix2'),interaction.options.getString('choix3'),interaction.options.getString('choix4')].filter(Boolean);const emojis=['1️⃣','2️⃣','3️⃣','4️⃣'];const msg=await interaction.editReply({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle(`📊 ${q}`).setDescription(choices.map((c,i)=>`${emojis[i]} ${c}`).join('\n')).setFooter({text:`Par ${interaction.user.tag}`}).setTimestamp()],fetchReply:true});for(let i=0;i<choices.length;i++)await msg.react(emojis[i]).catch(()=>{});return;}
    if(commandName==='giveaway'){if(!isAdmin)return interaction.editReply('❌');const prize=interaction.options.getString('lot');const dur=interaction.options.getInteger('duree')*60000;const winners=interaction.options.getInteger('gagnants');const endTime=Date.now()+dur;const msg=await interaction.editReply({embeds:[new EmbedBuilder().setColor('#FFB84F').setTitle('🎉 GIVEAWAY !').setDescription(`**Lot :** ${prize}\n**Gagnants :** ${winners}\n**Fin :** <t:${Math.floor(endTime/1000)}:R>\n\nRéagissez 🎉 pour participer !`).setFooter({text:`Par ${interaction.user.tag}`}).setTimestamp()],fetchReply:true});await msg.react('🎉');giveaways.set(msg.id,{channelId:interaction.channelId,prize,endTime,winnersCount:winners,entries:new Set()});setTimeout(async()=>{const g=giveaways.get(msg.id);if(!g)return;giveaways.delete(msg.id);if(!g.entries.size){interaction.channel.send('❌ Aucun participant.');return;}const entries=[...g.entries];const selected=[];for(let i=0;i<Math.min(g.winnersCount,entries.length);i++){const idx=Math.floor(Math.random()*entries.length);selected.push(entries.splice(idx,1)[0]);}interaction.channel.send({embeds:[new EmbedBuilder().setColor('#4FFFB0').setTitle('🎉 Giveaway terminé !').setDescription(`**Lot :** ${g.prize}\n**Gagnant(s) :** ${selected.map(id=>`<@${id}>`).join(', ')}`).setTimestamp()]});},dur);return;}
    if(commandName==='blague'){const b=['Pourquoi les plongeurs plongent en arrière ? Parce que sinon ils tomberaient dans le bateau !','Un homme entre dans une bibliothèque et demande un hamburger. Le bibliothécaire dit : Monsieur ! L\'homme chuchote : Pardon, un hamburger s\'il vous plaît.','Comment appelle-t-on un chat tombé dans un pot de peinture le jour de Noël ? Un chat-peint de Noël.','Pourquoi l\'épouvantail a reçu un prix ? Il était exceptionnel dans son domaine.'];return interaction.editReply({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle('😄 Blague').setDescription(b[Math.floor(Math.random()*b.length)]).setTimestamp()]})}
    if(commandName==='rps'){const choices=['pierre','feuille','ciseaux'];const uc=interaction.options.getString('choix').toLowerCase();if(!choices.includes(uc))return interaction.editReply('❌ pierre/feuille/ciseaux');const bc=choices[Math.floor(Math.random()*3)];const emojis={pierre:'🪨',feuille:'📄',ciseaux:'✂️'};let r='';if(uc===bc)r='🤝 Égalité !';else if((uc==='pierre'&&bc==='ciseaux')||(uc==='feuille'&&bc==='pierre')||(uc==='ciseaux'&&bc==='feuille'))r='🎉 Gagné !';else r='😢 Perdu !';return interaction.editReply({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle('🎮 RPS').addFields({name:'Vous',value:`${emojis[uc]} ${uc}`,inline:true},{name:'Moi',value:`${emojis[bc]} ${bc}`,inline:true},{name:'Résultat',value:r}).setTimestamp()]})}
    if(commandName==='avatar'){const t=interaction.options.getMember('membre')||member;return interaction.editReply({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle(`🖼️ ${t.user.tag}`).setImage(t.user.displayAvatarURL({size:512})).setTimestamp()]})}

    // ── TICKETS ──
    if(commandName==='ticketsetup'){if(!isAdmin)return interaction.editReply('❌');const cat=interaction.options.getChannel('categorie');const support=interaction.options.getRole('support');const logs=interaction.options.getChannel('logs');ticketConfig.set(guild.id,{categoryId:cat.id,supportRoleId:support.id,logChannelId:logs?.id});const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('create_ticket').setLabel('Ouvrir un ticket').setStyle(ButtonStyle.Primary).setEmoji('🎫'));await interaction.channel.send({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle('🎫 Support').setDescription('Cliquez pour ouvrir un ticket.').setTimestamp()],components:[row]});return interaction.editReply('✅ Tickets configurés !');}
    if(commandName==='ticket'){const tc=ticketConfig.get(guild.id);if(!tc)return interaction.editReply('❌ Non configuré.');const ex=[...openTickets.entries()].find(([,v])=>v.userId===interaction.user.id&&v.guildId===guild.id);if(ex)return interaction.editReply(`❌ Ticket existant : <#${ex[0]}>`);try{const ch=await guild.channels.create({name:`ticket-${interaction.user.username}`,type:ChannelType.GuildText,parent:tc.categoryId,permissionOverwrites:[{id:guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},{id:interaction.user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]},{id:tc.supportRoleId,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]},{id:client.user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]}]});openTickets.set(ch.id,{userId:interaction.user.id,guildId:guild.id});const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('Fermer').setStyle(ButtonStyle.Danger).setEmoji('🔒'));await ch.send({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle('🎫 Ticket').setDescription(`Bonjour ${interaction.user} ! Décrivez votre problème.`).setTimestamp()],components:[row]});return interaction.editReply({content:`✅ Ticket : ${ch}`,ephemeral:true});}catch(e){return interaction.editReply('❌ Impossible.');}}
    if(commandName==='closeticket'){if(!openTickets.has(interaction.channelId))return interaction.editReply('❌ Pas un ticket.');openTickets.delete(interaction.channelId);await interaction.editReply({embeds:[new EmbedBuilder().setColor('#FF4F6F').setTitle('🔒 Fermé').setDescription(`Par **${interaction.user.tag}**`).setTimestamp()]});setTimeout(()=>interaction.channel.delete().catch(()=>{}),5000);return;}

    // ── 🎵 MUSIQUE ──
    if (commandName === 'play') {
      const voiceChannel = member.voice?.channel;
      if (!voiceChannel) return interaction.editReply('❌ Rejoignez un salon vocal d\'abord !');
      const search = interaction.options.getString('recherche');
      await interaction.editReply(`🔍 Recherche de **${search}**...`);
      try {
        let trackInfo;
        if (search.includes('youtube.com') || search.includes('youtu.be')) {
          const info = await playdl.video_info(search);
          trackInfo = { title: info.video_details.title, url: info.video_details.url, duration: info.video_details.durationRaw, thumbnail: info.video_details.thumbnails[0]?.url, requestedBy: interaction.user.tag, textChannelId: interaction.channelId };
        } else {
          const results = await playdl.search(search, { limit: 1 });
          if (!results.length) return interaction.editReply('❌ Aucun résultat.');
          const v = results[0];
          trackInfo = { title: v.title, url: v.url, duration: v.durationRaw, thumbnail: v.thumbnails[0]?.url, requestedBy: interaction.user.tag, textChannelId: interaction.channelId };
        }
        const q = getMQ(guild.id);
        if (!q.connection || q.connection.state.status === VoiceConnectionStatus.Destroyed) {
          q.connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator });
          q.player = createAudioPlayer();
          q.connection.subscribe(q.player);
          q.player.on(AudioPlayerStatus.Idle, () => playNext(guild));
          q.player.on('error', (err) => { console.error('Player error:', err.message); playNext(guild); });
        }
        q.queue.push(trackInfo);
        if (q.player.state.status === AudioPlayerStatus.Idle && q.queue.length === 1) {
          await playNext(guild);
          return interaction.editReply({ embeds: [new EmbedBuilder().setColor('#7C6FFF').setTitle('▶️ Lecture').setDescription(`**[${trackInfo.title}](${trackInfo.url})**`).addFields({name:'⏱️',value:trackInfo.duration||'?',inline:true}).setThumbnail(trackInfo.thumbnail).setTimestamp()] });
        } else {
          return interaction.editReply({ embeds: [new EmbedBuilder().setColor('#4FFFB0').setTitle('➕ Ajouté').setDescription(`**[${trackInfo.title}](${trackInfo.url})**`).addFields({name:'Position',value:`#${q.queue.length}`,inline:true},{name:'Durée',value:trackInfo.duration||'?',inline:true}).setThumbnail(trackInfo.thumbnail).setTimestamp()] });
        }
      } catch(e) { console.error('Play error:', e.message); return interaction.editReply('❌ Impossible de lire cette musique.'); }
    }
    if (commandName === 'skip') { const q=getMQ(guild.id); if(!q.player)return interaction.editReply('❌ Rien en cours.'); q.player.stop(); return interaction.editReply('⏭️ Passé !'); }
    if (commandName === 'stop') { const q=getMQ(guild.id); if(!q.player)return interaction.editReply('❌ Rien en cours.'); q.queue=[];q.loop=false;q.player.stop();const c=getVoiceConnection(guild.id);if(c)c.destroy();musicQueues.delete(guild.id);return interaction.editReply('⏹️ Arrêté !'); }
    if (commandName === 'pause') { const q=getMQ(guild.id); if(!q.player)return interaction.editReply('❌ Rien en cours.'); q.player.pause(); return interaction.editReply('⏸️ En pause.'); }
    if (commandName === 'resume') { const q=getMQ(guild.id); if(!q.player)return interaction.editReply('❌ Rien en cours.'); q.player.unpause(); return interaction.editReply('▶️ Repris !'); }
    if (commandName === 'queue') { const q=getMQ(guild.id); if(!q.current&&!q.queue.length)return interaction.editReply('ℹ️ File vide.'); const embed=new EmbedBuilder().setColor('#7C6FFF').setTitle('📋 File'); if(q.current)embed.addFields({name:'▶️ En cours',value:`**[${q.current.title}](${q.current.url})**`}); if(q.queue.length)embed.addFields({name:`📋 File (${q.queue.length})`,value:q.queue.slice(0,10).map((t,i)=>`**${i+1}.** [${t.title}](${t.url})`).join('\n')}); embed.addFields({name:'🔁 Loop',value:q.loop?'✅':'❌',inline:true},{name:'🔊 Volume',value:`${q.volume}%`,inline:true}); return interaction.editReply({embeds:[embed]}); }
    if (commandName === 'nowplaying') { const q=getMQ(guild.id); if(!q.current)return interaction.editReply('❌ Rien en cours.'); return interaction.editReply({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle('🎵 En cours').setDescription(`**[${q.current.title}](${q.current.url})**`).addFields({name:'⏱️',value:q.current.duration||'?',inline:true},{name:'👤',value:q.current.requestedBy,inline:true},{name:'🔁',value:q.loop?'✅':'❌',inline:true},{name:'🔊',value:`${q.volume}%`,inline:true}).setThumbnail(q.current.thumbnail).setTimestamp()]}); }
    if (commandName === 'volume') { const q=getMQ(guild.id); const level=interaction.options.getInteger('niveau'); if(level<1||level>100)return interaction.editReply('❌ Entre 1 et 100.'); q.volume=level; if(q.player?.state?.resource?.volume)q.player.state.resource.volume.setVolume(level/100); return interaction.editReply(`🔊 Volume : **${level}%**`); }
    if (commandName === 'shuffle') { const q=getMQ(guild.id); if(!q.queue.length)return interaction.editReply('❌ File vide.'); for(let i=q.queue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[q.queue[i],q.queue[j]]=[q.queue[j],q.queue[i]];}return interaction.editReply('🔀 File mélangée !'); }
    if (commandName === 'loop') { const q=getMQ(guild.id); q.loop=!q.loop; return interaction.editReply(`🔁 Loop : **${q.loop?'activé':'désactivé'}**`); }
    if (commandName === 'leave') { const c=getVoiceConnection(guild.id); if(!c)return interaction.editReply('❌ Pas en vocal.'); c.destroy(); musicQueues.delete(guild.id); return interaction.editReply('👋 Au revoir !'); }

    // ── INFO ──
    if(commandName==='serverinfo')return interaction.editReply({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle(`📊 ${guild.name}`).addFields({name:'Membres',value:`${guild.memberCount}`,inline:true},{name:'Salons',value:`${guild.channels.cache.size}`,inline:true},{name:'Rôles',value:`${guild.roles.cache.size}`,inline:true}).setThumbnail(guild.iconURL()).setTimestamp()]});
    if(commandName==='userinfo'){const t=interaction.options.getMember('membre')||member;return interaction.editReply({embeds:[new EmbedBuilder().setColor('#7C6FFF').setTitle(`👤 ${t.user.tag}`).addFields({name:'ID',value:t.id,inline:true},{name:'Rejoint',value:`<t:${Math.floor(t.joinedTimestamp/1000)}:R>`,inline:true}).setThumbnail(t.user.displayAvatarURL()).setTimestamp()]})}

  } catch(err) { console.error(`Erreur /${commandName}:`, err.message); interaction.editReply('❌ Erreur.').catch(()=>{}); }
});

// ════════════════════════════════════════════════════════════
//  SESSIONS SÉCURISÉES
// ════════════════════════════════════════════════════════════
async function startSession(member,guild,sr,method){const key=sKey(guild.id,member.id);try{await member.roles.add(sr.permRoleId);const expiresAt=Date.now()+sr.sessionDuration;const timer=setTimeout(()=>endSession(guild,member,'Expiration'),sr.sessionDuration);activeSessions.set(key,{expiresAt,permRoleId:sr.permRoleId,timer,startedAt:Date.now(),actions:[]});sendLog(guild,new EmbedBuilder().setColor('#4FFFB0').setTitle('🔐 Session ouverte').setDescription(`**${member.user.tag}**`).addFields({name:'Méthode',value:method},{name:'Durée',value:fmt(sr.sessionDuration)}).setTimestamp());}catch(e){}}
async function endSession(guild,member,reason){const key=sKey(guild.id,member.id);const s=activeSessions.get(key);if(!s)return;clearTimeout(s.timer);activeSessions.delete(key);try{await member.roles.remove(s.permRoleId);}catch(e){}if(!sessionHistory.has(guild.id))sessionHistory.set(guild.id,[]);const h=sessionHistory.get(guild.id);h.unshift({userId:member.id,username:member.user.tag,start:s.startedAt,end:Date.now(),actions:s.actions||[]});if(h.length>50)h.pop();sendLog(guild,new EmbedBuilder().setColor('#FFB84F').setTitle('🔐 Session terminée').setDescription(`**${member.user.tag}**`).addFields({name:'Raison',value:reason}).setTimestamp());}

// ════════════════════════════════════════════════════════════
//  DÉMARRAGE
// ════════════════════════════════════════════════════════════
client.login(TOKEN);
