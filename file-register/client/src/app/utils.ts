import * as CryptoJS from 'crypto-js';

export default class Utils {
    //static doSomething(val: string) { return val; }
    //static doSomethingElse(val: string) { return val; }
    static getTextFromURL(documentUrl){
        console.log('calling getTextFromURL - documentUrl'+documentUrl);
        // read text from URL location
        var responseStr;
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            //console.log('ready state');
            if (request.readyState === 4 && request.status === 200) {
                //console.log('readyState: '+request.readyState);
                //console.log('request.status: '+request.status);
                var type = request.getResponseHeader('Content-Type');
                //console.log('content type: '+type);
                if (type.indexOf("text") !== 1) {
                    console.log('request.responseText'+request.responseText);                        
                    responseStr = request.responseText;
                }
                
            }
        }
    
        request.open('GET', documentUrl, false);
        request.send(null); 
        return responseStr;
    }
    
    static generateHashUsingCryptJS(documentUrl)
    {
        //if(status){
        console.log('calling generateHashUsingCryptJS - documentUrl'+documentUrl);
        var documentContent =  this.getTextFromURL(documentUrl);  
       console.log('content fetched: '+ documentContent);
          //documentContent = 'daasdasdad';
          var hash = CryptoJS.SHA256(documentContent);
          
          if(hash) { 
            var hashStr = hash.toString(CryptoJS.enc.Hex);
            console.log('hashStr: '+hashStr);
           return hashStr;
          }
        //}             
    }

    static generateHashOfFileUsingCryptJS(documentContent: string)
    {
        var hashStr;
        //if(status){
        console.log('calling generateHashOfFileUsingCryptJS');
       // var documentContent =  this.getTextFromURL(documentUrl);  
       console.log('content fetched: '+ documentContent);
          //documentContent = 'daasdasdad';
          var hash = CryptoJS.SHA256(documentContent);
          
          if(hash) { 
             hashStr = hash.toString(CryptoJS.enc.Hex);
            console.log('hashStr: '+hashStr);
           return hashStr;
          }         
                    
    }
    
}