import multer from "multer";
import { checkAndCreateDir } from "../utils/managefiles.js";

const MIME_TYPES = { // association nom et extension de fichier d'images
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    checkAndCreateDir('images/' + file.fieldname + 's/') // Crée le dossier de destination s'il n'existe pas encore
    callback(null, "public/images/" + file.fieldname + 's' + '/'); // Avec file.fieldname + s on va uploader dans des dossiers spécifiques
  },
  filename: (req, file, callback) => { // Crée le nom du fichier
    const name = file.originalname.split(" ").join("_"); // remplace les espaces par des _
    const nameDotArray = name.split('.'); // transforme en tableau selon les points
    nameDotArray.pop(); // enlève la dernière partie du tableau
    const nameNoExtension = nameDotArray.join("."); // rejoint pour reformer une chaîne
    const extension = MIME_TYPES[file.mimetype];
    callback(null, nameNoExtension + '_' + Date.now() + "." + extension);
  },
});

// Execution de multer donc le resultat est stocké dans upload.
const upload = multer({ storage: storage }).any(); // Initialisation de multer avec le storage définit plus haut
// Puis utilisation de la methode .single qui va uploader un élément contenu dans le champ "avatar" des données formulaires

export default upload;
