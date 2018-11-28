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

import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';
//import { ValidateFileTransaction } from '../org.example.basic';
import 'rxjs/Rx';
import { Asset, HistorianRecord } from '../org.hyperledger.composer.system';

// Can be injected into a constructor
@Injectable()
export class SystemService {
	
		private NAMESPACE: string = 'system';

    constructor(private dataService: DataService<Asset>) {
    };    

    public getHistorianRecord(id: any): Observable<Asset> {
      return this.dataService.getHistorianRecord(this.NAMESPACE,id);
    }

}

