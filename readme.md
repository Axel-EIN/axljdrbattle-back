# AXL-JDR BATTLE - BACK END - EXAMEN CDA
Back-End en NodeJS avec Base de données Sequelize du Projet AXL-JDR BATTLE MANAGER, projet de fin d'année pour l'obtention du diplôme CDA : Concépteur Développeur d'Application (Bac+3/4).


## Étape 1 : Installation dépendances
Exécutez la commande suivante dans votre terminal :
```bash
npm install

```

## Étape 2 : Création fichier .env
Créez un fichier `.env` à la racine du projet et ajoutez les variables d'environnement pour votre base de données MySQL ainsi qu'une chaîne de caractères pour la génération d'un token Json Web Token pour la sécurisation de la connexion des utilisateurs.
```
PORT=8080
DB_NAME="nom_bdd"
DB_USER="nom_utilisateur_bdd"
DB_PASSWORD="mot_de_passe_utilisateur_bdd"
DB_HOST="adresse_host_bdd" (par défaut localhost)
TOKEN="votre_token"
```


## Étape 3 : Lancement back-end
Vérifiez que votre base de données est lancée (Vous pouvez installer et utiliser XAMP, WAMP etc..)
Puis exécutez la commande suivante dans votre terminal (NodeJS doit être installé) :
```bash
node server.js

```


## Étape 4 : Lancement du front-end
Pour tester l'application après avoir lancé le back-end, clonez l'application front-end et lancez-la.
Voir : https://github.com/Axel-EIN/axljdr-battle-front