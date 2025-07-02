import chatHandlingServices from "../../service/implementations/chatHandlingServices";
import * as grpc from '@grpc/grpc-js';
import { IchatHandling_Controller } from "../interFace/chatHandlingInterFace";

export default class chatHandlingController implements IchatHandling_Controller{

    private chatHandlingServices:chatHandlingServices

    constructor(chatHandlingServices:chatHandlingServices) {
        this.chatHandlingServices=chatHandlingServices
    }



    StoreMsngIntoDb = async (call:any, callback:any) => {
        try {
          console.log('Doctor service StoreMessage request:', call.request);
          
          // Extract and validate data from gRPC call
          const messageData = {
            appointmentId: call.request.appointmentId,
            messageType: call.request.messageType,
            content: call.request.content,
            senderType: call.request.senderType,
            timestamp: call.request.timestamp,
            senderId: call.request.senderId
          };
      
          // Call service layer
          const dbResponse = await this.chatHandlingServices.StoreMsngInto__Db(messageData);
          
          // Return gRPC response according to proto
          const response = {
            success: dbResponse.success,
            message: dbResponse.message,
            messageId: dbResponse.messageId || '',
            conversationId: dbResponse.conversationId || '',
            doctorId:  dbResponse.doctorId
          };
      
          callback(null, response);
        } catch (error) {
          console.log('Error in doctor service controller:', error);
          
          const grpcError = {
            code: grpc.status.INTERNAL,
            message: error || 'Internal server error',
          };
          
          callback(grpcError, null);
        }
      };
}