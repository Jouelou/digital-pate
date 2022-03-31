# Digital Pâté

Site web présentant l'expérience AR et le quiz créés pour représenter le Pâté Vaudois de l'EPM. Ce site a été conçu dans le cadre du LAB GR+ID au sein de l'Eracom. 

- [Pré-requis](#pré-requis)
- [Installation](#installation)
- [Vite](#vite)
- [Données du Quiz](#données-du-quiz)
- [Composants](#composants)
- [Ajouter des pages](#ajouter-des-pages)
- [CSS](#css)
- [Liens](#liens)
- [Déploiement](#déploiement)

## Pré-requis

- [VSCode](https://code.visualstudio.com)
- [Node.js](https://nodejs.org/en/)

## Installation

1. Faites un fork de ce répo et clonez le sur votre machine

2. Ouvrez le dossier téléchargé dans VSCode et ouvrez le terminal de VSCode

3. Lancez le programme avec les commandes suivantes:

```bash
npm install
npm run dev
```

4. Ouvrez votre navigateur sur [localhost:3000](http://localhost:3000)

## Vite

Ce projet utilise le bundler [Vite](https://vitejs.dev), dans l'optique d'optimiser notre code le plus possible.

Chaque page doit avoir un fichier JavaScript qui lui est associé. le fichier **index.html** est lié au fichier **index.js**. Le fichier **quiz/index.html** est lui associé à **quiz/quiz.js**.

```html
<!-- Dans index.html -->
<script type="module" src="./index.js"></script>

<!-- Dans about.js -->
<script type="module" src="./quiz.js"></script>
```

Le but de cette de démarche est d'éviter de charger du JavaScript inutile par page, connaissant les limitations de Tor en termes de vitesse de chargement.

## Composants

Du code qui serait partagé entre les pages peuvent être implémentés dans des fichiers séparés qui seraient ensuite importés là où c'est nécessaire. Référez-vous à la documentation de l'instruction [export](https://developer.mozilla.org/fr/docs/web/javascript/reference/statements/export). Ces composants réutilisables seront stockés dans le dossier **components**.

Pour pouvoir importer une fonction dans un autre fichier, il faut d'abord dire que celle-ci soit exportable, puis l'importer dans le fichier où vous souhaitez l'utiliser:

```javascript
// Dans un fichier components/truc.js
export const nom_de_la_fonction = function () {};

// Dans le fichier index.js (ou un autre directement lié au html)
import nom_de_la_fonction from "./components/truc.js";

nom_de_la_fonction();
```

## Ajouter des pages

Si vous souhaitez ajouter des pages à votre site, suivez la structure existante (vous pouvez aussi dupliquer le dossier "quiz" et modifier les noms de fichiers):

1. Créez un dossier qui correspond au nom de votre page.
2. Créez un fichier index.html dans ce dossier.
3. Créez un fichier javascript dans ce dossier et importez-y les feuilles de style.

```javascript
import "../css/reset.css";
import "../css/style.css";
```

4. Faites le lien entre le html et le javascript

```html
<script type="module" src="./nom-du-fichier.js"></script>
```

5. Informez Vite de l'existence de cette page en éditant le fichier **vite.config.js**

```javascript
module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "./index.html"),
        about: resolve(__dirname, "about/index.html"),
        // Ajoutez une page ici
        archives: resolve(__dirname, "archives/index.html")
      }
    }
  }
});
```

## Styles

Tous les fichiers CSS du projet sont stockés dans le dossier /css/. 

Ce template contient un fichier **reset.css**. Le but de ce document est de réécrire certains comportements par défaut de nos navigateurs. Il existe de nombreux types de reset. J'ai utilisé le suivant: [https://piccalil.li/blog/a-modern-css-reset/](https://piccalil.li/blog/a-modern-css-reset/)

Le fichier **global.css** regroupe des règles qui seraient appliquées à toutes le pages. 

Le fichier **quiz.css** ne s'applique qu'à la page du quiz et le fichier **home.css** ne s'applique qu'à la homepage. 

Attention! Avec Vite, les feuilles de style sont importées dans le fichier JavaScript de la page. 

## Liens
Les liens internes doivent **impérativement** être relatifs. Pas de liens absolus qui commencent par "/"

## Déploiement

Importez votre fork de ce répo dans Netlify. Lorsque vous ferez un push, Netlify mettra automatiquement les changements en ligne. 