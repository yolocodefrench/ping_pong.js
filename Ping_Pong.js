/**
 * Ajout de l'event lors du load
 */
window.addEventListener("load", ()=>{
    // 1: parse document to find templateId
    // 2: request to find routes
    // 3: request route pages
    // 4: fill template page with datas
    // 5: fill document with full template

    // 1
    var templateId=findIds();

    // 2.1
    getRoutes((routesStream)=>{
        templateId.forEach(routesId => {
            // 2
            var routeFiles=getRouteById(routesId,routesStream);
            if(routeFiles!==null){
                // 3
                pp_requestWebPage(routeFiles[0],null,(dataHtml)=>{
                    pp_requestJSON(routeFiles[1],null,(dataJson)=>{
                        // 4
                        var template=fillTemplateWithDatas(dataHtml, dataJson);
                        // 5
                        fillDocumentWithTemplate(routesId,template);
                    });
                });
            }
            else{
                console.log("La route "+routesId+" n'existe pas!");
            }
            
        });
    });
});


/**
 * Remplit la page web avec les templates
 * @param {String de l'id du template} templateId l'id du template
 * @param {String html du template} template le template
 */
function fillDocumentWithTemplate(templateId, template)
{
    var templatesDiv=document.querySelectorAll('[template-id]');
    templatesDiv.forEach(element => {
        if(element.getAttribute("template-id")===templateId)
            element.innerHTML=template;
    });
}


/**
 * Remplie le template avec les données json
 * @param {html stream} htmlStream  le fichier html
 * @param {json object} jsonData  l'objet json
 */
function fillTemplateWithDatas(htmlStream, jsonData)
{
    var request;
    var comptTemp=0;
    while(true)
    {
        request = getNextRequest(htmlStream,0);
        if(request==null)
            break;
        htmlStream=execRequest(request,htmlStream,jsonData);

        comptTemp++;
        if(comptTemp>20){
            break;
        }
    }
    return htmlStream;
}

/**
 * findIds, permet de récupérer la valeur de tous les template-id dans le document
 * retourne un tableau de string de toutes les valeurs d'id
 */
function findIds()
{
    var ret=[];
    var templatesDiv=document.querySelectorAll('[template-id]');
    templatesDiv.forEach(element => {
        ret.push(element.getAttribute("template-id"));
    });
    return ret;
}


/**
 *  getRoute, permet d'obtenir la route des fichiers ciblés par templateId
 *  templateId : un string contenant l'id du template
 *  callback : la fonction qui sera appelée après la récupération des routes 
 *  retourne un tableau de 2 elements, le fichier de route du template et le fichier de route des datas
 */
function getRoutes(callback)
{
    pp_requestJSON("routage.json",null,callback);
}

/**
 * Retourne un tableau de 2 case avec le chemin du template et le chemin des datas.
 * @param {l'id du template} templateId 
 * @param {l'objet json des routes} jsonObject 
 */
function getRouteById(templateId,jsonObject)
{
    var ret=null;
    var routeArray=jsonObject.routes;
    routeArray.forEach(element => {
        if(element.HTML_ID===templateId){
            ret= [element.Template_File,element.Data_File];
        }
    });
    return ret;
}



/**
 * Teste le type de requete et execute l'action en conséquence
 * @param {*} requestObject la requete
 * @param {*} htmlStream le flux html
 * @param {*} jsonData les object json
 */
function execRequest(requestObject,htmlStream,jsonData){

    if(testRequestValue(requestObject.text,"#")){ // array start
        htmlStream=arrayReplace(requestObject,htmlStream,jsonData);
    }
    else if(testRequestValue(requestObject.text,"/")){// array end 
        htmlStream=removeRequest(requestObject,0,htmlStream);
    }
    else if(testRequestValue(requestObject.text,"if ")){// if start 
        htmlStream= ifReplace(requestObject,htmlStream,jsonData);
    }
    else if(testRequestValue(requestObject.text,"endif")){// if end
        htmlStream=removeRequest(requestObject,0,htmlStream);
    }
    else if(testRequestValue(requestObject.text,"elseif ")){// else if 
        htmlStream=removeRequest(requestObject,0,htmlStream);
    }
    else if(testRequestValue(requestObject.text,"else ")){// else
        htmlStream=removeRequest(requestObject,0,htmlStream);
    }
    else if(testRequestValue(requestObject.text,"switch ")){// switch
        htmlStream= caseReplace(requestObject,htmlStream,jsonData);
    }
    else if(testRequestValue(requestObject.text,"endswitch")){   
        htmlStream=removeRequest(requestObject,0,htmlStream);
    }
    else if(testRequestValue(requestObject.text,"endcase")){ 
        htmlStream=removeRequest(requestObject,0,htmlStream);  
    }
    else if(testRequestValue(requestObject.text,"case")){ 
        htmlStream=removeRequest(requestObject,0,htmlStream); 
    }
    else{ // print variable
        if( (variable=getVariableByName(requestObject.text,jsonData))!=undefined){
            htmlStream=htmlStream.replace("(("+requestObject.text+"))",variable);
        }
    }
    return htmlStream;
}


/**********************************************************************************************
 * 
 * 
 * 
 * Gestion des If/Elseif/Else
 * 
 * 
 * 
 **********************************************************************************************/

/**
 * Application du if 
 * @param {*} requestObject la requete if
 * @param {*} htmlStream le flux html
 * @param {*} jsonData l'objet json
 */
function ifReplace(requestObject, htmlStream,jsonData){
    var endif=getNextEndRequest(requestObject, "endif", htmlStream);
    
    var ifValue=testValue(requestObject,jsonData)
    if(ifValue){
        var elseIfVar =getNextEndRequest(requestObject,"elseif", htmlStream);
        var elseVar =getNextEndRequest(requestObject,"else", htmlStream);
        if(elseIfVar){
            htmlStream=htmlStream.slice(0,elseIfVar.start)+htmlStream.slice(endif.end+1,htmlStream.length);
        }
        else if(elseVar){
            htmlStream=htmlStream.slice(0,elseVar.start)+htmlStream.slice(endif.end+1,htmlStream.length);
        }
        htmlStream=removeRequest(requestObject,0,htmlStream);
    }
    else
    {
        var index_deplacement=requestObject.end;
        var elseIfRequest=null;
        var elseIfValide=false;
        var requestTemp=getNextRequest(htmlStream,requestObject.end);
        requestTemp.end=index_deplacement;
        while((elseIfRequest=getNextEndRequest( requestTemp,"elseif",htmlStream))){
            if(elseIfRequest!=null){
                if(testValue(elseIfRequest,jsonData)){
                    requestTemp.end=index_deplacement=elseIfRequest.end;
                    var nextRqt=getNextEndRequest( requestTemp,"elseif",htmlStream);
                    if(!nextRqt){nextRqt=getNextEndRequest( requestTemp,"else",htmlStream);}
                    if(!nextRqt){nextRqt=getNextEndRequest( requestTemp,"endif",htmlStream);}

                    htmlStream=
                    htmlStream.slice(0,requestObject.start)+
                    htmlStream.slice(elseIfRequest.end+1,nextRqt.start)+
                    htmlStream.slice(endif.end+1,htmlStream.length);
                    elseIfValide=true;
                    break;
                }
                else{
                    requestTemp.end=index_deplacement=elseIfRequest.end;
                }   
            } 
        }
        if(!elseIfValide){
            var nextRqt=getNextEndRequest( requestTemp,"else",htmlStream);
            if(nextRqt){
                htmlStream=removeRequest(endif,0,htmlStream);
                htmlStream=
                htmlStream.slice(0,requestObject.start)+
                htmlStream.slice(nextRqt.end+1,htmlStream.length);
            }
            else{
                htmlStream=
                htmlStream.slice(0,requestObject.start)+
                htmlStream.slice(endif.end+1,htmlStream.length);
            }
        }
    }
    return htmlStream;
}

/**
 * teste la valeur d'une requete if ou elseif
 * @param {*} requestObject la requete
 * @param {*} jsonData les données
 */
function testValue(requestObject,jsonData){
    var testText=requestObject.text.slice(requestObject.text.indexOf("["),requestObject.text.length);
    testText=replaceCrochet(testText);  
    /*
        testText est la condition sans les []
    */
    var rempasementString="ReplacementStringLoop";
    for(var element in jsonData.datas){
        while(testText.indexOf(element)!=-1){
            testText=testText.replace(element,"jsonData.datas."+rempasementString);
        }
        while(testText.indexOf(rempasementString)!=-1){
            testText=testText.replace(rempasementString,element);
        }
    }
    var ifValue=eval(testText);
    return ifValue;
}

/**********************************************************************************************************
 * 
 * 
 * 
 * Gestion des tableaux / Array
 * 
 * 
 * 
 **********************************************************************************************************/


/**
 * Remplace une request array dans le flux
 * @param {*} requestObject la requete
 * @param {*} htmlStream le flux
 * @param {*} jsonData les données
 */
function arrayReplace(requestObject, htmlStream,jsonData)
{
    var endArray=getNextEndRequest(requestObject, "/", htmlStream);
    var tempHtmlStream=htmlStream;
    var arrayVar=getVariableByName(requestObject.text.slice(1,requestObject.text.length),jsonData);

    var loopText=htmlStream.slice(requestObject.end+1,endArray.start);
    tempHtmlStream=removeRequest(endArray,0,tempHtmlStream);
    tempHtmlStream=tempHtmlStream.slice(0,requestObject.start)+tempHtmlStream.slice(endArray.start+1,tempHtmlStream.length);

    //A ce moent, le tempHtmlStream ne contient plus rien en rapport avec la boucle, on va rajouter  de suite ces données
    for(var j=0,  decalage=0;j<arrayVar.length;j++, decalage+=tempText.length){
        var tempText=loopText.replace(new RegExp(requestObject.text.slice(1,requestObject.text.length), 'g'),requestObject.text.slice(1,requestObject.text.length)+"["+j+"]");
        tempHtmlStream=tempHtmlStream.slice(0,requestObject.start+decalage)+tempText+tempHtmlStream.slice(requestObject.start+decalage,tempHtmlStream.length);
    }
    htmlStream=tempHtmlStream;
    return htmlStream;
}

/***********************************************************************************************************
 * 
 * 
 * 
 * Gestion du case switch
 * 
 * 
 * 
 ************************************************************************************************************/

/**
 * Remplace une requete switch
 * @param {*} requestObject la requete switch
 * @param {*} htmlStream le flux html
 * @param {*} jsonData le json
 */
function caseReplace(requestObject, htmlStream,jsonData)
{
    var endSwitch=getNextEndRequest(requestObject, "endswitch", htmlStream);
    var variableName=requestObject.text.split(" ")[1];
    var allCase=getAllCaseOfSwitch(requestObject.end,endSwitch.start,htmlStream);
    var haveMatch=false;
    //console.log("#Info#\n"+allCase+"\n#InfoEnd#");

    var tempHtmlStream="";
    /*
        traitement
    */
    tempHtmlStream= removeRequest(requestObject,0,htmlStream); // remove start switch

    allCase.forEach(element => {
        if(element[0].text=="defaultcase" && haveMatch==false){
            tempHtmlStream= removeRequest(element[0],tempHtmlStream.length-htmlStream.length,tempHtmlStream);
        }
        else if(element[0].text=="defaultcase"){
            tempHtmlStream=tempHtmlStream.slice(0,element[0].start+tempHtmlStream.length-htmlStream.length)+tempHtmlStream.slice(endSwitch.start+1+tempHtmlStream.length-htmlStream.length, htmlStream.length);
        }
        else{
            var variable=element[0].text.split(" ")[1];
            if(variable!=getVariableByName(variableName,jsonData)){
                tempHtmlStream= removeRequest(element[0],tempHtmlStream.length-htmlStream.length,tempHtmlStream);
                tempHtmlStream=tempHtmlStream.slice(0,element[0].end+tempHtmlStream.length-htmlStream.length)+tempHtmlStream.slice(element[1].start+1+tempHtmlStream.length-htmlStream.length, htmlStream.length);
                tempHtmlStream= removeRequest(element[1],tempHtmlStream.length-htmlStream.length,tempHtmlStream);
            }
            else{
                tempHtmlStream= removeRequest(element[0],tempHtmlStream.length-htmlStream.length,tempHtmlStream);
                tempHtmlStream= removeRequest(element[1],tempHtmlStream.length-htmlStream.length,tempHtmlStream);
                haveMatch=true;
            }
        }

        

    });
    /*
        remove request
    */
    tempHtmlStream= removeRequest(endSwitch,tempHtmlStream.length-htmlStream.length,tempHtmlStream);
    htmlStream=tempHtmlStream;
    return htmlStream;
}



/**
 * retourne un tableau d'objet requete par paire ( array[][2]{})
 * @param {*} indexStart index de fin de la 1er requette switch
 * @param {*} indexEnd index de debut de la requet endswitch
 * @param {*} htmlStream le flux html
 */
function getAllCaseOfSwitch(indexStart,indexEnd, htmlStream)
{
    var ret=[];
    var listRequest=[];
    var index=indexStart;
    var nextToAdd=[];

    while(1)
    {
        var request=getNextRequest(htmlStream,index);
        if(request.end > indexEnd)
            break;
        if(testRequestValue(request.text,"case ") && listRequest.length==0  ){ 
            nextToAdd.push(request);
        }
        else if(testRequestValue(request.text,"endcase") && listRequest.length==0 ){
            if(nextToAdd.length==1){
                nextToAdd.push(request);
                ret.push(nextToAdd);
                nextToAdd=[];
            }
        }
        else if(testRequestValue(request.text,"defaultcase") && listRequest.length==0 ){
            nextToAdd.push(request);
            ret.push(nextToAdd);
            nextToAdd=[];
        }
        else if(testRequestValue(request.text,"#") || testRequestValue(request.text,"if  ") || testRequestValue(request.text,"switch ")){
            listRequest.push(request);
        }
        else if(testRequestValue(request.text,"/") || testRequestValue(request.text,"endif ")  || testRequestValue(request.text,"endswitch")){
            listRequest.pop();
        }
        index=request.end;
    }
    return ret;
}

/*******************************************************************************************
 * 
 * 
 * 
 * Fonction de traitement des chaines et des requetes
 * 
 * 
 * 
 *******************************************************************************************/


/**
 * retourne the html stream without the request
 * @param {*} request the request
 * @param {*} indexDecalage recalage index
 * @param {*} htmlStream flux html
 */
function removeRequest(request, indexDecalage, htmlStream)
{
    return htmlStream.slice(0,request.start+indexDecalage)+htmlStream.slice(request.end+1+indexDecalage, htmlStream.length);
}


/**
 * Retourne la requete de fin du bloc
 * @param {*} request la requete de rébut
 * @param {*} endtext le texte de requete de fin
 * @param {*} htmlStream le flux html
 * @return {*} la requete ou null
 */
function getNextEndRequest(request,endtext,htmlStream)
{
    var arrayRequest = [];  //push // pop
    var returnRequest=null;
    var index=request.end;
    while(!returnRequest){
        var rqt=getNextRequest(htmlStream,index);
        if(rqt==null)
            break;
        if(rqt.text.indexOf(endtext)!=-1 && arrayRequest.length==0){
            returnRequest=rqt;
            break;
        }
        else if(testRequestValue(rqt.text,"#") || testRequestValue(rqt.text,"if  ") || testRequestValue(rqt.text,"case ") || testRequestValue(rqt.text,"switch ")){
            arrayRequest.push(rqt);
        }
        else if(testRequestValue(rqt.text,"/") || testRequestValue(rqt.text,"endif") || testRequestValue(rqt.text,"endcase") || testRequestValue(rqt.text,"endswitch")){
            arrayRequest.pop();
        }
        index=rqt.end;
    }
    return returnRequest;
}


/**
 * Permet de récupérer le valeur d'une variable des données JSON avec son nom
 * @param {*} vName Le nom de la variable (string)
 * @param {*} jsonData les données JSON
 * @return {*} la valeur trouve ou undefine
 */
function getVariableByName(vName, jsonData){
    return eval("jsonData.datas."+vName);
}

/**
 * Teste la valeur d'une requete (())
 * @param {*} text le texte du (())
 * @param {*} test la valeur à tester
 * @return {*} true si le texte cherché existe, false si il n'existe pas
 */
function testRequestValue(text, test)
{
    if( (indexOf=text.indexOf(test))!=-1){
        if(indexOf==0 || text.charAt(indexOf-1)==' ')
            return true;
    }
    return false;
}

/**
 * Retourne un objet avec : l'index début, l'index fin et le text du (()) suivant le lastindex. Si aucun match, retourn null
 * @param {*} htmlStream le flux html
 * @param {*} lastIndex l'index de début de recherche
 * @return {*} un object start,end et text représantant le requette ou null si il y à une erreur
 */
function getNextRequest(htmlStream, lastIndex)
{
    var retIndex=0;
    var i=lastIndex;
    if( (i=scanHtmlToNextUseOf(htmlStream,i,'(')) != -1)
    {
        var j=scanHtmlToNextUseOf(htmlStream,i,')');
        if(j!=-1)
        {
            var stringIn=htmlStream.slice(i+2,j);
            return {start: i, end: j+1, text: stringIn};
        }
    }
    return null;
}


/**
 * scanne le flux html pour retourner l'index du permier (()) après le lastIndex
 * @param {*} htmlStream le flux html
 * @param {*} lastIndex le dernier index retourné
 * @param {*} simbol le simbole (( ou ))
 */
function scanHtmlToNextUseOf(htmlStream, lastIndex, simbol)
{
    var vLast;
    var indexUse=lastIndex+3;
    vLast=htmlStream.charAt(lastIndex+2);
    while(indexUse<htmlStream.length && !(vLast==simbol && htmlStream.charAt(indexUse)==simbol )  )
    {
        vLast=htmlStream.charAt(indexUse);
        indexUse++;
    }
    if(indexUse<htmlStream.length)
        return indexUse-1;
    return -1;
}

/**
 * Remplace les crochet [] par des ()
 * @param {*} str la chaine
 * @return la nouvelle chaine
 */
function replaceCrochet(str){
    while(str.indexOf("[")!=-1){
        str=str.replace("[","(");}
    while(str.indexOf("]")!=-1){
        str=str.replace("]",")");}
    return str;
}






/*******************************************************************************************
 * 
 * 
 * 
 * Gestion des appels de données
 * 
 * 
 * 
 **********************************************************************************************/


/**
        pp_requestJSON:
            - Permet de récupérer du json en appelant une page php
            url: l'url du fichier à appeler
            data: un objet FormData qui sera envoyé avec la requet
            callback: une fonction qui sera appelée après la récupération des données (utiliser une fonction avec comme paramètre l'objet JSON) 
*/
function pp_requestJSON(url,data,callback)
{
    pp_requestWebPage(url, data, (value)=>{
        callback(JSON.parse(value));
    });
}


/**
 * Permet de récuperer les données brute d'une page sur le serveur
 * @param {l'url de la page sur le serveur} url 
 * @param {les données à envoyer avec la requet (post). A utiliser avec pp_createFormData.} data 
 * @param {une fonction qui sera appelé après récupération de la page avec un paramètre, les données bruts.} callback 
 */
function pp_requestWebPage(url,data,callback)
{
    var xhr = new XMLHttpRequest();
    var promesse=new Promise((resolve, reject)=>{
        
        xhr.open("POST", url,false);
        
        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);
        
        
        xhr.send(data);
    }).catch(
        () => {console.log(xhr.statusText);}
    );
    promesse.then(
        () => {
            callback(xhr.responseText);
        }
    );
}

function pp_getTemplate(filename){
    url="../templates/"+filename;
}


/** 
    pp_createFormData: A utiliser pour envoyer des données lors du post
        - Permet de créer un objet FormData à partir d'un objet simple
        return: un objet FormData
        object: l'objet utilisé pour créer l'objet FormData 
*/
function pp_createFormData(object)
{
    var data=new FormData()
    var keys=Object.keys(object);
    keys.forEach(function(valeur) {
        data.append(valeur,object[valeur]);
    }, this);
    return data;
}


/**************************************************************************************************************
 * 
 * 
 * 
 * Gestion des objects json -> html
 * 
 * 
 * 
 ***************************************************************************************************************/


 /**
  * pp_loadWithJsonObject
  * permet de convertir un JSON en structure html
  * jsonDataArray => Object JSON
  * return => un objet DOM html
  */
function pp_loadWithJsonObject(jsonDataArray)
{
    var page=document.createElement( 'html' );
    for(var jsonElement in jsonDataArray.page){
        page.appendChild(pp_fillObject(jsonDataArray.page[jsonElement]));
    }
    return page;
}

 /**
  * pp_fillObject
  * permet de convertir un Objet JSON en Objet de structure html
  * objJSON => un objet JSON
  * return => un element du DOM html
  */
function pp_fillObject(objJSON)
{
    var obj=document.createElement( objJSON.type ); // création de la balise
    /*
        parse de chaque attribut de l'objet
    */
    for(var attribut in objJSON)
    {
        if(typeof(objJSON[attribut])==="object")// si c'est un objet
        {
            if(objJSON[attribut].length==undefined) // si c'est un objet
            {
                obj.appendChild(pp_fillObject(objJSON[attribut]));
            }
            else if(objJSON[attribut].length>0) // si c'est un tableau
            {
                for(var jsonElement in objJSON[attribut]) // parse du tableau
                {
                    obj.appendChild(pp_fillObject(objJSON[attribut][jsonElement]));
                }
            }
        }
        else if(objJSON[attribut]!==undefined&&attribut!=="type"&& typeof(attribut)!="number" && attribut!=="pp_text" ) // si c'est une valeur 
        {
            obj.setAttribute(attribut,objJSON[attribut]);
        }
        else if(attribut==="pp_text") // si c'est un text entre balise
        {
            obj.innerHTML=objJSON[attribut];
        }
    }
    return obj;
}






