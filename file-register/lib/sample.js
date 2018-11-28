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

/* global getAssetRegistry getFactory emit */


//TODO: implement
 function generateFileId(){
  return Date.now().toString();
}

/**
 * Sample transaction processor function.
 * @param {org.example.basic.RegisterFileTransaction} tx The sample transaction instance.
 * @transaction
 */
async function RegisterFileTransaction(tx) {  // eslint-disable-line no-unused-vars
 console.log('calling RegisterFileTransaction');
  //calculate hash of the file from file url and populate hash into FileAsset
  var factory = getFactory();
  var NS = 'org.example.basic';
  //console.log('calling factory.newResource');
  let fileId = generateFileId();
  var fileAsset = factory.newResource(NS, 'FileAsset',fileId);
  fileAsset.hashValue = tx.fileHash;
  //console.log('after factory.newResource: fileAsset id:'+ fileAsset.fileId);
  
    // Get the asset registry for the asset.
    const assetRegistry = await getAssetRegistry('org.example.basic.FileAsset');
    // Update the asset in the asset registry.
    await assetRegistry.add(fileAsset);    

    // Emit an event for the modified asset.
    let event = getFactory().newEvent('org.example.basic', 'FileRegisterEvent');
    event.fileId = fileAsset.fileId;
    event.hashValue = fileAsset.hashValue;
    emit(event);
    //return fileAsset.fileId;
}


/**
 * Sample transaction processor function.
 * @param {org.example.basic.ValidateFileTransaction} tx The sample transaction instance.
 * @returns {string}(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/string) The string.
 * @transaction
 */
async function ValidateFileTransaction(tx) {  // eslint-disable-line no-unused-vars
  console.log('calling ValidateFileTransaction'); 
  const assetRegistry = await getAssetRegistry('org.example.basic.FileAsset');
  const fileAsset = await assetRegistry.get(tx.fileId);
  const hashFromBC = fileAsset.hashValue;
  
  const result = (hashFromBC.trim().valueOf() == tx.fileHash.trim().valueOf());  
  console.log('result: '+result);
    
  let event = getFactory().newEvent('org.example.basic', 'FileValidateEvent');
  event.fileId = fileAsset.fileId;
  event.result = result;
  emit(event);
  return '{result:'+result+'}';
}

