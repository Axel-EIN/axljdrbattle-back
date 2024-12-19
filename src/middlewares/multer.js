import multer from "multer";
import { checkAndCreateDir } from "../utils/filemanager.js";

const MIME_TYPES = { // association nom et extension de fichier d'images
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
};

const storage = multer.diskStorage(
    {
        destination: (req, file, callback) => {
            const folderName =  file.fieldname + 's';
            console.log('Vérification et ou Creation du dossier public/');
            checkAndCreateDir('public/');
            console.log('Vérification et ou Creation du dossier public/images/');
            checkAndCreateDir('public/images/');
            console.log(`Vérification et ou Creation du dossier public/images/${folderName}/`);
            checkAndCreateDir('public/images/' + folderName + '/'); // Crée le dossier de destination s'il n'existe pas encore
            callback(null, "public/images/" + folderName + '/'); // Dossier de destination prêt 
        },

        filename: (req, file, callback) => {
            const extension = MIME_TYPES[file.mimetype];

            let nameNoExtension = '';
            switch(file.fieldname){
                case 'avatar':
                    nameNoExtension = req.body.login + '_' + 'avatar';
                    break;
                case 'portrait':
                    nameNoExtension = req.body.lastname + '_' + req.body.firstname + '_' + 'portrait';
                    break;
                case 'illustration':
                    nameNoExtension = req.body.lastname + '_' + req.body.firstname + '_' + 'illustration';
                    break;
                default:
                    const name = file.originalname.split(" ").join("_"); // remplace les espaces par des _
                    const nameDotArray = name.split('.'); // transforme le nome de fichier en tableau d'éléments séparé par des points
                    nameDotArray.pop(); // enlève la dernière partie du tableau donc la partie avec .extention du nom de fichier
                    nameNoExtension = nameDotArray.join("."); // rejoint pour reformer une chaîne mais sans l'extention
            }
           
            callback(null, nameNoExtension.toLowerCase() + '_' + Date.now() + "." + extension); // Fichier de destination prêt
        },
    }
);

// Execution de multer dont le resultat est stocké dans la variable upload
const upload = multer({ storage: storage }).any(); // Initialisation de multer avec le storage définit plus haut
// Puis utilisation de la methode .single qui va uploader un élément contenu dans le champ "avatar" des données formulaires

export default upload;
