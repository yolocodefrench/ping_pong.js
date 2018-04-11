# PingPongJS
### PingPongJS est une librairie Javascript qui permet de gérer des templates écrits sous le format .pingpong

* [Installation](#installation)
* [Premiers pas](#premiers-pas)
* [Itération sur un tableau](#itération-sur-un-tableau)
* [Gestion des if/else](#gestion-des-ifelse)

## Installation

Pour installer la librairie, il faut inclure le fichier javascript ping_pong.js dans votre répertoire correspondant et appeler ce fichier dans le bas de votre page html.

```html
<script type="text/javascript" src="script.js" ></script>
```

Vous devez créer un fichier "routage.json" dans le même répertoire que la librairie ping_pong.js.
Ce fichier sera lu par la librairie pour charger les templates dans vos pages.

## Premiers pas

#### Le fichier "routage.json"

Ce fichier contient tous les renseignements sur les différents templates. 
Est appelé route, tout élément contenu dans l'attribut route du fichier "routage.json". Chaque élément contient l'id html de l'élément dans lequel il son template va être chargé, le chemin relatif vers le template, le fichier qui contient les données qui vont être testées et mises dans le template.
```json
{
    "routes": [
        {"HTML_ID": "routehtml1", "Template_File": "templateFile1.html", "Data_File": "dataFile1.php" },
        {"HTML_ID": "routehtml2", "Template_File": "templateFile2.html", "Data_File": "dataFile1.php" }
    ]
}
```

## Itération sur un tableau

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


## Gestion des if/else

Ping_pong.js inclue une gestion de la logique un peu plus poussée que certaines librairies  de template js. Ici, nous allons détailler
les if, elseif et else.

Ici nous alons tester les if/else en itérant sur un tableau :

```json
"tableau1":[
        1,2,3,"A4","B5"
],
```

Voici le code du template
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

