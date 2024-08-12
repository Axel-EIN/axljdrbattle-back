import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function removeFile(publicFilePath) {
  fs.unlink(__dirname + '/../..' + '/public/' + publicFilePath, (err) => {
    if (err) {
      console.error(`Erreur lors de la tentative de suppression du fichier : ${err}`);
      return;
    }
    console.log(`Le fichier ${publicFilePath} a bien été supprimé du disque.`);
  });
}

export function checkAndCreateDir(publicDirPath) {
  const absoluteDirectoryPath = __dirname + '/../..' + '/public/' + publicDirPath;
  if ( !fs.existsSync(absoluteDirectoryPath) ) {
    fs.mkdirSync(absoluteDirectoryPath);
    console.log('Le dossier' + ' ' + publicDirPath + ' ' + 'a bien été crée !');
  }
}
