# PingPongJS
### PingPongJS est une librairie Javascript qui permet de gérer des templates écrits sous le format .pingpong

* [Installation](#installation)
* [Premiers pas](#premiers-pas)

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
