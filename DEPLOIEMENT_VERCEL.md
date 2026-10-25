# Déployer le dépôt frontend sur Vercel

Ce dossier est un dépôt Git autonome contenant le site React et ses fonctions API. Le backend Django reste à déployer sur PythonAnywhere depuis le projet complet, séparément de ce dépôt.

## Régler `vite: Permission denied` (code 126)

Le déploiement du commit `57a9961` contenait `node_modules/.bin/vite` avec le mode Git `100644`, sans droit d’exécution Linux. Des dépendances installées sous Windows avaient été ajoutées au dépôt. Le `.gitignore` placé au-dessus de `frontend` n’avait pas été inclus dans ce dépôt séparé.

Les corrections fournies sont :

- `.gitignore` directement à la racine de ce dépôt ;
- retrait de `node_modules`, `dist` et des résultats de tests du suivi Git, en conservant les fichiers locaux ;
- `installCommand: npm ci` dans `vercel.json`, pour une installation propre adaptée au serveur ;
- Node.js fixé à `24.x` dans `package.json` et `package-lock.json`.

Depuis le dossier contenant `.git` et `package.json`, vérifiez le suivi des fichiers :

```powershell
git ls-files node_modules dist test-results playwright-report
```

Cette commande ne doit plus afficher de fichiers. Si vous appliquez le correctif sur une autre copie du dépôt, retirez les fichiers générés du suivi :

```powershell
git rm -r --cached --ignore-unmatch node_modules dist test-results playwright-report
```

L’option `--cached` conserve ces dossiers sur votre disque. Ajouter un `.gitignore` seul ne retire pas les fichiers déjà suivis.

Pour enregistrer et envoyer les corrections :

```powershell
git add .gitignore package.json package-lock.json vercel.json DEPLOIEMENT_VERCEL.md
git commit -m "Corrige le deploiement Vercel et retire les fichiers generes"
git push origin main
```

Gardez `package-lock.json` dans Git : il est nécessaire à `npm ci`.

## Réglages Vercel

Pour ce dépôt contenant uniquement le contenu de `frontend` :

| Réglage | Valeur |
| --- | --- |
| Root Directory | `.` / racine du dépôt |
| Framework Preset | Vite |
| Node.js Version | 24.x |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Il ne faut pas sélectionner un sous-dossier `frontend` s’il n’existe pas dans ce dépôt GitHub. Un dépôt comprenant l’ensemble du projet Django utilise en revanche `frontend` comme Root Directory.

Dans **Settings → Build and Deployment**, vérifiez les éventuels réglages personnalisés pour l’installation et le build. `vercel.json` contient déjà les commandes attendues.

Poussez les corrections et vérifiez que Vercel déploie le **nouveau commit**. Si vous relancez manuellement le déploiement, désactivez **Use existing Build Cache** pour cette tentative. Relancer uniquement l’ancien commit conserve les anciens fichiers du dépôt.

Le warning `Unknown env config "cache-dir"` n’est pas l’erreur bloquante du journal fourni : le build échouait sur l’exécution de Vite. Le réglage `24.x` évite également l’avertissement concernant une mise à niveau automatique vers une future version majeure de Node.js.

## Connexion à PythonAnywhere

Ajoutez ces variables dans **Settings → Environment Variables** :

| Variable | Valeur |
| --- | --- |
| `PYTHONANYWHERE_API_URL` | `https://VOTRE_UTILISATEUR.pythonanywhere.com/api/inscriptions/` |
| `PYTHONANYWHERE_API_TOKEN` | La même valeur que `DJANGO_API_TOKEN` sur PythonAnywhere |

Choisissez le véritable domaine de votre compte PythonAnywhere. Les variables sont utilisées par les fonctions Vercel, pas par le navigateur : ne leur ajoutez pas le préfixe `VITE_`. Redéployez après leur modification.

La construction du frontend peut réussir avant que Django soit configuré. Les inscriptions et les actualités nécessitent ensuite une API PythonAnywhere fonctionnelle.

## Vérifications locales

Avec Node.js 24, depuis ce dossier :

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run build
```

Les tests navigateur `test:e2e` nécessitent également le projet Django complet et son environnement Python dans le dossier parent. Ils ne font pas partie du build Vercel.

## Références

- [Installation propre avec npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci)
- [Choix de la version de Node.js sur Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
