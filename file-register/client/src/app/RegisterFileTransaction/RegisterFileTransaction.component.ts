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


import Utils from '../utils';
import { Component, OnInit, Input } from '@angular/core';
import { RegisterFileTransactionService } from './RegisterFileTransaction.service';
import 'rxjs/add/operator/toPromise';
import { SystemService } from '../SystemTransaction/System.service';
import { HistorianRecord } from '../org.hyperledger.composer.system';
import { FileRegisterEvent } from '../org.example.basic';
@Component({
	selector: 'app-RegisterFileTransaction',
	templateUrl: './RegisterFileTransaction.component.html',
  styleUrls: ['./RegisterFileTransaction.component.css'],  
  providers: [RegisterFileTransactionService,SystemService],
})
export class RegisterFileTransactionComponent implements OnInit {

  private allTransactions;
  private Transaction;
  private currentId;
  private errorMessage;
  private compInfo: string = "Loading";
	//the local file from input tag
  private file; 
  private fileContent;
  private successMessage='null';
  private elementType : 'url' | 'canvas' | 'img' = 'url';
  private qrcodeValue : string ;

  constructor(private serviceRegisterFileTransaction:RegisterFileTransactionService, 
    private systemService:SystemService) {
    
  };

  ngOnInit(): void {
    this.loadAll();

    //todo: wrap the event capturing code in a service and use it here
    // similarly us it for validation. And remove hostorian call
    //Ref - https://blog.codewithdan.com/pushing-real-time-data-to-an-angular-service-using-web-sockets/
    var a = this;
    var ws = new WebSocket('ws://localhost:3000');
     ws.onmessage = function (event) {
     console.log(event.data);
     let fileRegEventObj = JSON.parse(event.data);
     let fileId = fileRegEventObj.fileId;
     let hashValue = fileRegEventObj.hashValue;
     console.log("fileId: "+fileId);
     console.log("hashValue: "+hashValue);   
    a.qrcodeValue = fileId; // ref - https://www.techiediaries.com/generate-qrcodes-angular/
}
  }

  loadAll(): Promise<any> {
    let tempList = [];
    return this.serviceRegisterFileTransaction.getAll()
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


  fileChanged($event):void {
    var self = this;
    console.log("MyApp.fileChanged");
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

  addTransaction(form: any): Promise<any> {
    console.log('calling RegisterFileTransactionComponent:addTransaction from angular');
   // var fileHash = Utils.generateHashUsingCryptJS(this.fileUrl.value);
   if(this.fileContent != null){
    var fileHash = Utils.generateHashOfFileUsingCryptJS(this.fileContent); 
    if(fileHash == null){
      this.errorMessage = 'hash generation failed';
    }   
   }
   else{
     this.errorMessage = 'not a valid file';

   }
    var todayDate = new Date().toISOString();
    
    console.log('fileHash: '+ fileHash);
    this.Transaction = {
      
      $class: "org.example.basic.RegisterFileTransaction",
      
         "fileHash":fileHash,       
          "timestamp":todayDate
      };

    return this.serviceRegisterFileTransaction.addTransaction(this.Transaction)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
     // (<HTMLInputElement>document.getElementById("file")).files[0]= null;      
      const filereg_txnid = result.transactionId;
      console.log('****txn id in response of addtxn call: '+filereg_txnid);
      //rest call to get historian record corresponding to the txn id returned in validate txn.
      // http://localhost:3000/api/system/historian/<txn-id>
      return this.systemService.getHistorianRecord(filereg_txnid)
      .toPromise()
      .then((result)=>{
        this.errorMessage = null;
        var historianRecord = result as HistorianRecord;
        if(historianRecord && historianRecord.eventsEmitted[0]){
        let fileId = (historianRecord.eventsEmitted[0] as FileRegisterEvent).fileId;
        let fileHash = (historianRecord.eventsEmitted[0] as FileRegisterEvent).hashValue;
        
        console.log('********fileId and fileHash registered: '+ fileId + ',  '+ fileHash);
        if(fileId && fileHash){
           this.successMessage='true';
        }
        else{
          this.successMessage='false';
        }
        console.log('********Registration successMessage: '+ this.successMessage);
      }
    })
    .catch((error) => {
        if(error == 'Server error'){
            this.errorMessage = "Could not connect to REST server. Please check your configuration details";
        }
        else{
            this.errorMessage = error;
        }
    });
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


   
}

