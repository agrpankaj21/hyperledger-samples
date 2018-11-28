/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { BusinessNetworkConnection } from 'composer-client';
import Utils from '../utils';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ValidateFileTransactionService } from './ValidateFileTransaction.service';
import { SystemService } from '../SystemTransaction/System.service';
import 'rxjs/add/operator/toPromise';
import { HistorianRecord } from '../org.hyperledger.composer.system';
import { FileValidateEvent } from '../org.example.basic';
@Component({
	selector: 'app-ValidateFileTransaction',
	templateUrl: './ValidateFileTransaction.component.html',
	styleUrls: ['./ValidateFileTransaction.component.css'],
  providers: [ValidateFileTransactionService,SystemService]
})
export class ValidateFileTransactionComponent implements OnInit {

  //myForm: form-group;

  private allTransactions;
  private Transaction;
  private currentId;
	private errorMessage;
  private fileHash;
  private timestamp;
  private file;
  private fileContent;
  private fileId;
  private successMessage = 'null';
      
         // timestamp = new FormControl("", Validators.required);
 //        cardName ='admin@file-register';
 //        businessNetworkIdentifier = 'file-register';
    //     bizNetworkConnection = new BusinessNetworkConnection(this.cardName);
         
  constructor(private serviceValidateFileTransaction:ValidateFileTransactionService,
    private systemService:SystemService) {

    /*
    this.bizNetworkConnection.on('event',(evt)=>{
      console.log('Validate event result: '+evt.result);
      });
      */

  };

  
  ngOnInit(): void {
    this.loadAll();
  }


  fileChanged($event):void {
    var self = this;
    console.log("MyApp.fileChanged");
   // let filesArray = [(<HTMLInputElement>document.getElementById("file")).files]
   //  this.file = filesArray[0];
    //this.file = Array.from((<HTMLInputElement>document.getElementById("file")).files)[0];
		this.file = (<HTMLInputElement>document.getElementById("file")).files[0];
	  var fileReader = new FileReader();		
		fileReader.onload = function(e) {  
      //console.log('file content: '+fileReader.result);		
      self.fileContent = fileReader.result;	
      console.log('******self.fileContent*********');
      console.log('self.fileContent: '+self.fileContent);	
    }
    
    fileReader.readAsBinaryString(this.file);
	}

  loadAll(): Promise<any> {
    let tempList = [];
    return this.serviceValidateFileTransaction.getAll()
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      result.forEach(transaction => {
        tempList.push(transaction);
      });
      this.allTransactions = tempList;
    })
    .catch((error) => {
        if(error == 'Server error'){
            this.errorMessage = "Could not connect to REST server. Please check your configuration details";
        }
        else if(error == '404 - Not Found'){
				this.errorMessage = "404 - Could not find API route. Please check your available APIs."
        }
        else{
            this.errorMessage = error;
        }
    });
  }

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the transaction field to update
   * @param {any} value - the enumeration value for which to toggle the checked state
   */
  changeArrayValue(name: string, value: any): void {
    const index = this[name].value.indexOf(value);
    if (index === -1) {
      this[name].value.push(value);
    } else {
      this[name].value.splice(index, 1);
    }
  }

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
   * only). This is used for checkboxes in the transaction updateDialog.
   * @param {String} name - the name of the transaction field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified transaction field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  

  addTransaction(): Promise<any> {
    console.log('calling ValidateFileTransactionComponent:addTransaction from angular');
    this.fileId = (<HTMLInputElement>document.getElementById("fileId")).value;
    //this.fileHash = Utils.generateHashOfFileUsingCryptJS(this.fileContent);
    if(this.fileContent != null){
      this.fileHash = Utils.generateHashOfFileUsingCryptJS(this.fileContent); 
      if(this.fileHash == null){
        this.errorMessage = 'hash generation failed';
      }   
     }
     else{
       this.errorMessage = 'not a valid file';
  
     }
    this.timestamp = new Date().toISOString();
    console.log('fileHash: '+ this.fileHash);
    console.log('fileid: ',this.fileId);
    this.Transaction = {
      $class: "org.example.basic.ValidateFileTransaction",      
        
          "fileId":this.fileId,      
          "fileHash":this.fileHash,         
          "timestamp":this.timestamp       
      };

    return this.serviceValidateFileTransaction.addTransaction(this.Transaction)
    .toPromise()
    .then( result => {
			this.errorMessage = null;
      (<HTMLInputElement>document.getElementById("fileId")).value = null;
      //(<HTMLInputElement>document.getElementById("file")).files[0]= null;  
      console.log('***result of validate result call: ',result);
      
      this.successMessage = String(result);//hack: cast observable to string...due to 
     
     console.log('********validation successMessage: '+ this.successMessage);
    })
    .catch((error) => {
        if(error == 'Server error'){
            this.errorMessage = "Could not connect to REST server. Please check your configuration details";
        }
        else{
            this.errorMessage = error;
        }
    });
 }
  
  setId(id: any): void{
    this.currentId = id;
  }

  /*
  getForm(id: any): Promise<any>{

    return this.serviceValidateFileTransaction.getTransaction(id)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      let formObject = {
        
          
            "fileId":null,
          
        
          
           // "fileHash":null,
          
        
          
            "fileUrl":null,
          
        
          
           // "transactionId":null,
          
        
          
           // "timestamp":null 
          
        
      };



      
        if(result.fileId){
          
            formObject.fileId = result.fileId;
          
        }else{
          formObject.fileId = null;
        }
      /*
        if(result.fileHash){
          
            formObject.fileHash = result.fileHash;
          
        }else{
          formObject.fileHash = null;
        }
        
      
        if(result.fileUrl){
          
            formObject.fileUrl = result.fileUrl;
          
        }else{
          formObject.fileUrl = null;
        }
      /*
        if(result.transactionId){
          
            formObject.transactionId = result.transactionId;
          
        }else{
          formObject.transactionId = null;
        }
      
        if(result.timestamp){
          
            formObject.timestamp = result.timestamp;
          
        }else{
          formObject.timestamp = null;
        }
      

     // this.myForm.setValue(formObject);

    })
    .catch((error) => {
        if(error == 'Server error'){
            this.errorMessage = "Could not connect to REST server. Please check your configuration details";
        }
        else if(error == '404 - Not Found'){
				this.errorMessage = "404 - Could not find API route. Please check your available APIs."
        }
        else{
            this.errorMessage = error;
        }
    });

  }
*/
 /* resetForm(): void{
  /*  this.myForm.setValue({
      
        
          "fileId":null,
        
      
        
         // "fileHash":null,
        
      
        
          "fileUrl":null,
        
      
        
         // "transactionId":null,
        
      
        
         // "timestamp":null 
        
      
      });
  }
 */

}

