---
icon: material/frequently-asked-questions
---

# FAQ

Les questions les plus fréquentes sur Nathan-Dash.

---

## Installation

??? question "Docker permission denied / Cannot connect to Docker daemon"

    Après l'installation de Docker, il faut ajouter ton utilisateur au groupe `docker` puis se reconnecter :

    ```bash
    sudo usermod -aG docker $USER
    exit
    # Reconnecte-toi
    ```

    Si le problème persiste, vérifie que Docker tourne :
    ```bash
    sudo systemctl status docker
    sudo systemctl start docker
    ```

??? question "Le port 3000 est déjà utilisé"

    Un autre service utilise le port 3000. Options :

    1. **Changer le port** dans `docker-compose.yml` :
        ```yaml
        ports:
          - "8080:80"
        ```
    2. **Trouver et arrêter** l'autre service :
        ```bash
        sudo lsof -i :3000
        ```

??? question "Le build Docker échoue"

    Essaie un build propre :

    ```bash
    docker compose build --no-cache
    ```

    Si ça échoue encore, vérifie que tu as assez d'espace disque :
    ```bash
    df -h
    docker system prune -f  # Nettoyer Docker
    ```

---

## Utilisation

??? question "Où sont stockées les données ?"

    Toutes les données (bots, logs) sont stockées **localement** dans le navigateur via **AsyncStorage** (localStorage sur le web).

    - Les données survivent aux rechargements de page
    - Les données sont propres à chaque navigateur/appareil
    - Si tu vides le cache du navigateur, les données sont perdues

??? question "Combien de bots je peux ajouter ?"

    Il n'y a **pas de limite** au nombre de bots. L'app est conçue pour gérer autant de bots que tu veux.

??? question "Les logs sont limités à combien d'entrées ?"

    **1 000 entrées** maximum. Les plus anciennes sont automatiquement supprimées quand la limite est atteinte.

??? question "L'app fonctionne-t-elle hors-ligne ?"

    **Oui !** L'app est servie comme un site statique. Une fois chargée, elle fonctionne même sans connexion internet. Les données sont stockées localement.

---

## Déploiement

??? question "L'auto-update ne fonctionne pas"

    Vérifie le timer systemd :

    ```bash
    # Statut du timer
    sudo systemctl status nathan-dash-updater.timer

    # Logs de la dernière exécution
    sudo journalctl -u nathan-dash-updater.service -n 20

    # Relancer
    sudo systemctl restart nathan-dash-updater.timer
    ```

    Si tu utilises cron :
    ```bash
    crontab -l  # Vérifie que la ligne est présente
    cat ~/Nathan-dash/deploy.log  # Logs
    ```

??? question "Comment accéder à l'app depuis l'extérieur ?"

    Par défaut, l'app écoute sur `localhost:3000`. Pour y accéder depuis l'extérieur :

    1. **Ouvre le port** dans ton firewall :
        ```bash
        sudo ufw allow 3000
        ```
    2. Accède via `http://IP_DU_SERVEUR:3000`
    3. Pour le HTTPS, utilise un [reverse proxy](installation/configuration.md#https-avec-un-reverse-proxy)

??? question "Comment mettre à jour manuellement ?"

    ```bash
    cd ~/Nathan-dash
    ./deploy.sh
    ```

??? question "Comment tout désinstaller ?"

    ```bash
    cd ~/Nathan-dash
    docker compose down
    sudo systemctl disable nathan-dash-updater.timer 2>/dev/null
    sudo rm /etc/systemd/system/nathan-dash-updater.*
    sudo systemctl daemon-reload
    rm -rf ~/Nathan-dash
    ```

---

## Autre

??? question "Je veux contribuer au projet"

    Le repo est sur GitHub : [Jefedi/Nathan-dash](https://github.com/Jefedi/Nathan-dash)

    1. Fork le repo
    2. Crée une branche
    3. Fais tes modifications
    4. Ouvre une Pull Request

??? question "J'ai trouvé un bug"

    Ouvre une [issue sur GitHub](https://github.com/Jefedi/Nathan-dash/issues/new) avec :

    - Description du problème
    - Étapes pour reproduire
    - Screenshots si possible
    - Navigateur et OS utilisé
