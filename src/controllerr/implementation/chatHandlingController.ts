import * as grpc from '@grpc/grpc-js';
import { AppointmentUpdateParams, AppointmentUpdateResponse, ChatMessageGrpcCall, ChatMessageGrpcCallback, ChatMessageGrpcResponse, ChatMessageStorageRequest, ConversationGrpcFetchCall, ConversationGrpcFetchCallback, ConversationGrpcFetchResponse } from "../../doctorInterFace/IdoctorType";
import { IchatHandlingService } from "../../service/interFace/chatHandlingServiceInterFace";

// interface StoreMessageResponse {
//   success: boolean;
//   message: string;
//   messageId: string;
//   conversationId: string;
//   doctorId: string;
// }

export default class chatHandlingController {

    private chatHandlingServices:IchatHandlingService

    constructor(chatHandlingServices:IchatHandlingService) {
        this.chatHandlingServices=chatHandlingServices
    }



   StoreMsngIntoDb = async (call: ChatMessageGrpcCall, callback: ChatMessageGrpcCallback): Promise<void> => {
    try {
      console.log('Doctor service StoreMessage request:', call.request);

      // Extract and validate data from gRPC call
      const messageData: ChatMessageStorageRequest = {
       appointmentId: call.request.appointmentId,
           messageType: call.request.messageType,
           content: call.request.content,
            senderType: call.request.senderType,
           timestamp: call.request.timestamp instanceof Date 
           ? call.request.timestamp.toISOString() 
              : call.request.timestamp,
              senderId: call.request.senderId,
             fileUrl: call.request.fileUrl || '',
           receverId: call.request.receverId
              };

      // Call service layer
      const dbResponse = await this.chatHandlingServices.StoreMsngInto__Db(messageData);

      const response: ChatMessageGrpcResponse = {
        success: dbResponse.success,
        message: dbResponse.message,
        messageId: dbResponse.messageId || '',
        conversationId: dbResponse.conversationId || '',
        doctorId: dbResponse.doctorId || ''
      };

      callback(null, response);
    } catch (error) {
      console.error('Error in doctor service controller:', error);

      const grpcError = {
        code: grpc.status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal server error',
      };

      callback(grpcError, null);
    }
  };



       fetchingConversations = async (call: ConversationGrpcFetchCall, callback: ConversationGrpcFetchCallback): Promise<void> => {
    try {
      console.log('Doctor service fetchingConversations request:', call.request);

      // Extract and validate data from gRPC call
      const { userId, doctorId } = call.request;

      // Call service layer
      const dbResponse = await this.chatHandlingServices.fetching__Conversations({
        userId,
        doctorId
      });

      console.log('check the datas about conversation', dbResponse);

      // Return the response according to proto definition
      const response: ConversationGrpcFetchResponse = {
        success: dbResponse.success,
        conversations: dbResponse.conversations || [],
        message: dbResponse.message || ''
      };

      callback(null, response);

    } catch (error) {
      console.error('Error in doctor service controller:', error);

      const grpcError = {
        code: grpc.status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal server error',
      };

      callback(grpcError, null);
    }
  };

     
  

    AfterTheConsultationUpdatingAppointMent = async (call: any, callback: any) => {
    try {
      console.log('Doctor service fetchingConversations request:', call.request);
      const params: AppointmentUpdateParams = {
        appointmentId: call.request.appointmentId,
        endedBy: call.request.endedBy
      };
      
     
      const serviceResponse: AppointmentUpdateResponse = await this.chatHandlingServices.AfterTheConsultation___UpdatingAppointMent(params);
      
      console.log('check the res in controller layer', serviceResponse);
      
    
      callback(null, serviceResponse);
      
    } catch (error) {
      console.error('Error in doctor service controller:', error);
      
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal server error',
      };
      
      callback(grpcError, null);
    }
  }



}