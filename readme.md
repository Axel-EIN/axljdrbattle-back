# AXL-JDR battle - BACK-END - examen CDA
Projet de fin d'année pour l'obtention du diplôme CDA : Concépteur Développeur d'Application (Bac+3/4).

Technologies :
- NodeJS
- Sequelize SQL

## Installation (NodeJS doit être installé)
Créez un fichier `.env` à la racine et remplir avec vos informations de connection à votre BDD MySQL ainsi qu'une chaîne de caractères pour la génération d'un token secret
```
PORT=8080
DB_NAME="nom_bdd"
DB_USER="nom_utilisateur_bdd"
DB_PASSWORD="mot_de_passe_utilisateur_bdd"
DB_HOST="adresse_host_bdd" (par défaut localhost)
TOKEN="votre_token"
```
Démarrez votre serveur BDD via XAMP, WAMP etc..

Exécuter
```bash
npm install
```

Puis
```bash
node server.js
```
Lancez le front-end, voir : https://github.com/Axel-EIN/axljdr-battle-front
