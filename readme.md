# AXL-JDR BATTLE MANAGER - BACK END - EXAMEN CDA

Back-End en NodeJS avec Base de données Sequelize du Projet AXL-JDR BATTLE MANAGER, projet de fin d'année pour l'obtention du diplôme CDA : Concépteur Développeur d'Application (Bac+3/4).

# Configuration du projet

Suivez ces étapes pour configurer le projet après l'avoir cloné :

## Étape 1 : Installation des dépendances

Exécutez la commande suivante dans votre terminal :

```bash
npm install

```

## Étape 2 : Création du fichier .env

Créez un fichier `.env` à la racine du projet.

## Étape 3 : Ajout des variables d'environnement

Ajoutez les variables d'environnement suivantes dans le fichier `.env` :

```
PORT=3001
TOKEN="votre_token"
DB_NAME="nom_bdd_sql"
DB_USER="nom_utilisateur_bdd"
DB_PASSWORD="mot_de_passe_utilisateur_bdd"
DB_HOST="adresse_host_base_données_ou_localhost"
```
- Remplacez `votre_token` par une chaîne de caractère de votre souhait pour servir à créer votre jeton secret pour Json Web Token.