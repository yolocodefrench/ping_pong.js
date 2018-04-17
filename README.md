# PingPongJS

* [Installation](#installation)
* [Premiers pas](#premiers-pas)
   * [Le fichier de routage](#le-fichier-de-routage)
   * [Afficher des variables](#afficher-des-variables)
* [Prise en main de la librairie](#prise-en-main-de-la-librairie)
    * [Itération sur un tableau](#itération-sur-un-tableau)
    * [Gestion des if/else](#gestion-des-ifelse)
    * [Gestion des switch/case](#gestion-des-switchcase)

## Installation

Pour installer la librairie, il faut inclure le fichier javascript ping_pong.js dans votre répertoire correspondant et appeler ce fichier dans le bas de votre page html.

```html
<script type="text/javascript" src="ping_pong.js" ></script>
```

Vous devez créer un fichier "routage.json" dans le même répertoire que la librairie ping_pong.js.
Ce fichier sera lu par la librairie pour charger les templates dans vos pages.

## Premiers pas

### Le fichier "routage.json"

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

## Auteurs :
* Dany CORBINEAU 
* Pierre CHÉNÉ
