# PingPongJS
### PingPongJS est une librairie Javascript qui permet de gérer des templates écrits sous le format .pingpong

* [Installation](#installation)
* [Premiers pas](#premiers-pas)

## Installation

Pour installer la librairie, il faut inclure le fichier javascript ping_pong.js dans votre répertoire correspondant et appeler ce fichier dans le bas de votre page html.

![chargement du script ping_pong](script.png) 

Vous devez créer un fichier "routage.json" dans le même répertoire que la librairie ping_pong.js.
Ce fichier sera lu par la librairie pour charger les templates dans vos pages.

## Premiers pas

#### Le fichier "routage.json"

{
    "routes": [
        {"HTML_ID": "routehtml1", "Template_File": "templateFile1.html", "Data_File": "dataFile1.php" },
        {"HTML_ID": "routehtml2", "Template_File": "templateFile2.html", "Data_File": "dataFile1.php" }
    ]
}
