const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildBans,
  ]
});

// ── Logs par serveur ──
const logsByGuild = {}; // { guildId: [...logs] }
function addLog(guildId, type, icon, title, detail) {
  if (!logsByGuild[guildId]) logsByGuild[guildId] = [];
  logsByGuild[guildId].unshift({ type, icon, title, detail, time: new Date().toLocaleTimeString('fr-FR') });
  if (logsByGuild[guildId].length > 50) logsByGuild[guildId].pop();
}

// ── Anti-raid par serveur ──
const joinTracker = {};
const RAID_THRESHOLD = 10;
const RAID_WINDOW = 10000;

// ── Anti-spam ──
const spamTracker = {};
const SPAM_THRESHOLD = 7;
const SPAM_WINDOW = 5000;

client.once('ready', () => {
  console.log(`✅ Bot ${client.user.tag} connecté !`);
  console.log(`📡 Serveurs connectés : ${client.guilds.cache.size}`);
  client.guilds.cache.forEach(g => {
    addLog(g.id, 'info', '🤖', 'Bot démarré', g.name);
    console.log(` - ${g.name} (${g.id})`);
  });
});

client.on('guildMemberAdd', async (member) => {
  const gid = member.guild.id;
  const now = Date.now();
  if (!joinTracker[gid]) joinTracker[gid] = [];
  const joins = joinTracker[gid].filter(t => now - t < RAID_WINDOW);
  joins.push(now);
  joinTracker[gid] = joins;
  if (joins.length >= RAID_THRESHOLD) {
    addLog(gid, 'raid', '🚨', 'RAID DÉTECTÉ', `${joins.length} joins en 10s`);
    const accountAge = now - member.user.createdTimestamp;
    if (accountAge < 7 * 24 * 60 * 60 * 1000) {
      try {
        await member.ban({ reason: '🚨 Anti-raid' });
        addLog(gid, 'ban', '🔨', `${member.user.tag} banni`, 'Anti-raid automatique');
      } catch(e) {}
    }
  }
  addLog(gid, 'join', '✅', `${member.user.tag} a rejoint`, member.guild.name);
});

client.on('guildMemberRemove', member => {
  addLog(member.guild.id, 'leave', '👋', `${member.user.tag} a quitté`, member.guild.name);
});

client.on('guildBanAdd', ban => {
  addLog(ban.guild.id, 'ban', '🔨', `${ban.user.tag} banni`, ban.reason || 'Aucune raison');
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  const uid = message.author.id;
  const now = Date.now();
  if (!spamTracker[uid]) spamTracker[uid] = [];
  const msgs = spamTracker[uid].filter(t => now - t < SPAM_WINDOW);
  msgs.push(now);
  spamTracker[uid] = msgs;
  if (msgs.length >= SPAM_THRESHOLD) {
    try {
      await message.member?.timeout(5 * 60 * 1000, 'Anti-spam');
      addLog(message.guild.id, 'spam', '⚠️', `${message.author.tag} en timeout`, 'Spam détecté');
      spamTracker[uid] = [];
    } catch(e) {}
  }
});

// ── ROUTES ──

// Statut bot
app.get('/api/status', (req, res) => {
  res.json({
    online: client.isReady(),
    username: client.user?.tag || 'Non connecté',
    ping: client.ws.ping,
    guilds: client.guilds.cache.size,
    uptime: Math.floor(process.uptime()),
  });
});

// Liste de tous les serveurs
app.get('/api/guilds', async (req, res) => {
  try {
    const guilds = client.guilds.cache.map(g => ({
      id: g.id,
      name: g.name,
      icon: g.iconURL(),
      memberCount: g.memberCount,
    }));
    res.json(guilds);
  } catch(e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Stats d'un serveur
app.get('/api/stats/:guildId', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(req.params.guildId);
    await guild.members.fetch();
    res.json({
      name: guild.name,
      icon: guild.iconURL(),
      memberCount: guild.memberCount,
      channelCount: guild.channels.cache.size,
      roleCount: guild.roles.cache.size,
      online: guild.members.cache.filter(m => m.presence?.status === 'online').size,
      createdAt: guild.createdAt,
    });
  } catch(e) {
    res.status(400).json({ error: 'Serveur introuvable.' });
  }
});

// Membres d'un serveur
app.get('/api/members/:guildId', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(req.params.guildId);
    await guild.members.fetch();
    const members = guild.members.cache.filter(m => !m.user.bot).first(20).map(m => ({
      id: m.id,
      username: m.user.username,
      displayName: m.displayName,
      avatar: m.user.displayAvatarURL(),
      roles: m.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name).slice(0, 2),
      status: m.presence?.status || 'offline',
    }));
    res.json(members);
  } catch(e) {
    res.status(400).json({ error: 'Impossible de récupérer les membres.' });
  }
});

// Logs d'un serveur
app.get('/api/logs/:guildId', (req, res) => {
  res.json(logsByGuild[req.params.guildId] || []);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend démarré sur http://localhost:${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
