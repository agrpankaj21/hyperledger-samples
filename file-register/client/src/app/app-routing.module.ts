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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { TransactionComponent } from './Transaction/Transaction.component'
import { HomeComponent } from './home/home.component';

import { FileAssetComponent } from './FileAsset/FileAsset.component';


  import { AgentParticipantComponent } from './AgentParticipant/AgentParticipant.component';
  import { CustomParticipantComponent } from './CustomParticipant/CustomParticipant.component';


  import { RegisterFileTransactionComponent } from './RegisterFileTransaction/RegisterFileTransaction.component';
  import { ValidateFileTransactionComponent } from './ValidateFileTransaction/ValidateFileTransaction.component';  
const routes: Routes = [
     //{ path: 'transaction', component: TransactionComponent },
    {path: '', component: HomeComponent},
		
		{ path: 'FileAsset', component: FileAssetComponent},
    
    
      { path: 'AgentParticipant', component: AgentParticipantComponent},
      
      { path: 'CustomParticipant', component: CustomParticipantComponent},
      
      
        { path: 'RegisterFileTransaction', component: RegisterFileTransactionComponent},
        
        { path: 'ValidateFileTransaction', component: ValidateFileTransactionComponent},
        
		{path: '**', redirectTo:''}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
