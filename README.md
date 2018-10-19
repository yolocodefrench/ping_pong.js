# PingPongJS

* [Installation](#installation)
* [Premiers pas](#premiers-pas)
   * [Utiliser le rendu de PingPong](#utiliser-le-rendu-de-pingpong)
   * [Utilisation static](#utilisation-statique)
   * [Afficher des variables](#afficher-des-variables)
* [Prise en main de la librairie](#prise-en-main-de-la-librairie)
    * [Itération sur un tableau](#itération-sur-un-tableau)
    * [Gestion des if/else](#gestion-des-ifelse)
    * [Gestion des switch/case](#gestion-des-switchcase)
    * [Le fichier de routage](#le-fichier-de-routage)
* [Auteurs](#auteurs)
## Installation

Pour utiliser la librairie vous n'avez besoin que du fichier ping_pong.js. Ce fichier est à ajouter à votre projet.
Il vous faudra ensuite appeler ce fichier dans votre html 

```html
<script type="text/javascript" src="ping_pong.js" ></script>
```

## Premiers pas
Vous avez ensuite 2 façons d'utiliser la librairie.

### Utiliser le rendu de PingPong
PingPong est un objet javascript qui hérite de la fonction render(). Cette fonction permet de remplir et de d'intégrer un template dans la page web avec le javascript lié à la page web.
Example : 
```javascript
PingPong.render("template-id-html", "template.html", {"datas":{prenom:"corentin", age: 81}});
```
Par exemple lors d'un clique sur un bouton, la librairie va charger le template à l'url "template.html", utiliser les données  {"datas":{prenom:"corentin", age: 81}} pour le remplir, et l'injecter dans la balise d'attribut template-id="template-id-html".

Pou utiliser PingPong.render, il vous faudra au préalable suivre la procédure d'installation, puis ajouter une balise avec l'attribut  template-id dans votre HTML.

### Utilisation statique
Pour utiliser le template de façon statique il vous faudra suivre la procédure d'installation.
Puis, vous devez créer un fichier "routage.json" dans le même répertoire que la librairie ping_pong.js.
Ce fichier sera lu par la librairie pour charger les templates dans vos pages.
```json
{
    "routes": [
        {"HTML_ID": "routehtml1", "Template_File": "templateFile.html", "Data_File": "dataFile.php" },
    ]
}
```
Enfin, il vous faut ajouter l'attribut template-id à l'une de vos balises en html.
```html
<div template-id="routehtml1"></div>
```
Lors du chargement de la page, la librairie va lire le fichier routage.json.
Elle va ensuite charger les données de l'url "Data_File" dans le template de l'url "Template_File" puis les incorporer dans la balise "HTML_ID".

### Afficher des variables

ping_pong.js traite des données json, puis les met dans les templates. 

Les données en json doivent être contenu dans un objet json ayant pour clé "datas".
```json
{
    "datas": {"objet_json_contenant_des_valeurs":"valeur",
              "autre_objet_json_contenant_des_valeurs":"autre_valeur"}
}
```

Pour les afficher, on appelle la clé de la valeur qu'on veut afficher

Dans le fichier de template appelé :
```html
<p>((objet_json_contenant_des_valeurs))</p>
```
Dans la page affiché à l'utilisateur, le code suivant sera présent :
```html
<p>valeur</p>
```

## Prise en main de la librairie


### Itération sur un tableau

Dans le fichier de données, vous devez retrourner un tableau, par exemple :
```json
"tableauObjet":[
    {"id": 1, "valeur": "A"},
    {"id": 2, "valeur": "B"},
    {"id": 3, "valeur": "C"},
    {"id": 4, "valeur": "D"}
]
```

Dans le fichier de template, l'itération sur un tableau se commence par un ((#variable)) et se fini par un "((/))", par exemple ici, on se base sur le tableau json juste au dessus : 
```html
<p>
    tableau objet :
    ((#tableauObjet))
    <p>
        ID : ((tableauObjet.id)), Valeur : ((tableauObjet.valeur))
    </p>
    ((/))
</p>
```

Si le tableau ne comporte pas de clé mais que des valeurs, on peut directement appeler la valeur ((tableau))


### Gestion des if/else

Ping_pong.js inclue une gestion de la logique un peu plus poussée que certaines librairies  de template js. Ici, nous allons détailler
les if, elseif et else.

Ici nous alons tester les if/else en itérant sur un tableau :

```json
"tableau1":[
        1,2,3,"A4","B5"
]
```

Dans le template, les conditions doivent être mises entre accolades. Tous les opérateurs logiques tels que les &, ||, >, etc... peuvent être utilisés dans le test à la seule condition qu'ils doivent être dans les accolades.
```html
((#tableau1))
    ((if { tableau1 < "2" } ))
        <p>Nombre trop faible ((tableau1))</p>
    ((elseif { tableau1 == 3 } ))
        <p>Nombre parfait ((tableau1))</p>
    ((else))
        <p>Nombre invalide ((tableau1))</p>
    ((endif)) 
((/))
```

### Gestion des switch/case

ping_pong.js comprend aussi une gestion de switch/case.
Ici, nous allons tester avec un exemple très simple.
Nous allons itérer sur le même tableau que précédemment

```json
"tableau1":[
        1,2,3,"A4","B5"
]
```

En fonction de la valeur contenu dans le tableau, on affichera un paragraphe différent :
```html
((#tableau1))
    ((switch tableau1))
        ((case 1))
            <p>Valeur #1#</p>
        ((endcase))
        ((case 2))
            <p>Valeur #2##</p>
        ((endcase))
        ((case 3))
            <p>Valeur #3##</p>
            ((endcase))
        ((case A4))
            <p>Valeur #4(A)##</p>
        ((endcase))
        ((case B5))
            <p>Valeur #5(B)##</p>
        ((endcase))

    ((endswitch))
((/))
```

### Le fichier "routage.json"

PingPong.js permet d'inclure des templates et de les remplir en appelant un genre de routeur qui va faire la liaison entre les données, le template et l'élément html dans lequel le template rempli devra être affiché.
Ce fichier contient tous les renseignements sur les différents templates. 
Est appelé route, tout élément contenu dans l'attribut route du fichier "routage.json". Chaque élément contient l'id html de l'élément dans lequel son template va être chargé, le chemin relatif vers le template, le fichier qui contient les données qui vont être testées et mises dans le template.
```json
{
    "routes": [
        {"HTML_ID": "routehtml1", "Template_File": "templateFile1.html", "Data_File": "dataFile1.php" },
        {"HTML_ID": "routehtml2", "Template_File": "templateFile2.html", "Data_File": "dataFile1.php" }
    ]
}
```

## Auteurs :
* Dany CORBINEAU 
* Pierre CHÉNÉ
