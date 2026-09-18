# Pour toi — version locale avec ngrok

Le questionnaire conserve les trois tentatives sur NON. Après OUI, 54 cœurs roses s’envolent, puis « Je t’aime mon Sous-Chef » apparaît après six secondes.

## Lancer le site

Avec Node.js 22.12+ ou 24 :
    
    npm install
    npm run build
    npm start

Ouvrir http://127.0.0.1:3000. Dans un deuxième terminal, avec ngrok installé et connecté à votre compte :

    ngrok http 3000

Partager l’URL HTTPS donnée par ngrok. Garder l’ordinateur allumé et les deux terminaux ouverts. Aucun service e-mail ni clé API nécessaire.

## Lire les réponses

Le fichier data/reponses.jsonl est créé au premier enregistrement réussi. Chaque ligne JSON contient les sept réponses, le texte « Autre » éventuel, les tentatives et les dates. Ouvrir ce fichier avec un éditeur de texte et en conserver une copie de sauvegarde.

Les données persistent après redémarrage. Les essais répétés avec le même identifiant ne créent pas de doublon. Une seule instance du serveur doit utiliser ce dossier. Le succès est annoncé uniquement après écriture et synchronisation du fichier sur disque.

Le serveur du port 3000 expose seulement le dossier dist : data et les sources ne sont pas accessibles aux visiteurs. Le dossier data est également exclu de Git. Ne pas le déplacer dans public ou dist. Aucune adresse IP ou autre information personnelle supplémentaire n’est enregistrée.

## Développement

npm run dev sert l’aperçu local au port 5173 et utilise la même API. Pour partager avec ngrok, utiliser le serveur compilé du port 3000. Après une modification, relancer npm run build puis npm start.

npm test vérifie validation, stockage, erreurs, doublons et positions du bouton. Les tests utilisent un fichier temporaire séparé des vraies réponses.

Le serveur accepte les requêtes provenant de l’origine du site, en tenant compte des en-têtes ngrok. La variable d’environnement APP_ORIGIN est facultative et peut restreindre cette origine à une URL précise. Le serveur écoute seulement sur 127.0.0.1.

Les réponses non enregistrées restent dans la mémoire du navigateur jusqu’à une nouvelle tentative ou un rechargement. Cette version nécessite un disque local persistant et remplace le déploiement Netlify/Vercel.

Documentation ngrok : https://ngrok.com/docs/getting-started/
