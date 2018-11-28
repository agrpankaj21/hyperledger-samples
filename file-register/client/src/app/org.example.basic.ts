import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace org.example.basic{
   export class FileAsset extends Asset {
      fileId: string;
      hashValue: string;
   }
   export class AgentParticipant extends Participant {
      participantId: string;
      firstName: string;
      lastName: string;
   }
   export class CustomParticipant extends Participant {
      participantId: string;
      firstName: string;
      lastName: string;
   }
   export class RegisterFileTransaction extends Transaction {
      fileId: string;
      fileHash: string;
      fileUrl: string;
   }
   export class ValidateFileTransaction extends Transaction {
      fileId: string;
      fileHash: string;
      fileUrl: string;
   }
   
   export class FileRegisterEvent extends Event {
      fileId: string;
      hashValue: string;
   }
   export class FileValidateEvent extends Event {
      fileId: string;
      result: boolean;
   }

  