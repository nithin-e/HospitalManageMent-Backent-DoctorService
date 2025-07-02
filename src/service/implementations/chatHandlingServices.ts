import chatHandlingRepository from '../../repositoriess/implementation/chatHandlingRepo';
import * as grpc from '@grpc/grpc-js';
import { IchatHandlingService } from '../interFace/chatHandlingServiceInterFace';

export default class  chatHandlingService implements IchatHandlingService {
    private ChatHandlingRepo:chatHandlingRepository
    constructor(chatHandlingRepository:chatHandlingRepository) {
        this.ChatHandlingRepo=chatHandlingRepository
    }

    


    StoreMsngInto__Db = async (messageData:any) => {
      try {
        console.log('Service layer received message data:', messageData);
        
    
        // Call repository layer
        const dbResponse = await this.ChatHandlingRepo.Store_MsngInto__Db(messageData);
        
        return {
          success: true,
          message: 'Message stored successfully',
          messageId: dbResponse.messageId,
          conversationId: dbResponse.conversationId,
          doctorId: dbResponse.doctorId,
        };
      } catch (error) {
        console.log('Error in service layer:', error);
        
        // Return error response
        return {
          success: false,
          message: `Service layer error: ${error}`,
          messageId: null,
          conversationId: null,
          savedAt: null
        };
      }
    };
}