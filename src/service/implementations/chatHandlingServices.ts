import chatHandlingRepository from '../../repositoriess/implementation/chatHandlingRepo';
import * as grpc from '@grpc/grpc-js';
import {  IChatHandlingService } from '../interFace/chatHandlingServiceInterFace';
import { AppointmentUpdateParams, AppointmentUpdateResponse, ChatMessageServiceResponse, ChatMessageStorageRequest, ConversationFetchRequest, ConversationServiceFetchResponse } from '../../doctorInterFace/IdoctorType';
import { IChatHandlingRepo } from '../../repositoriess/interFace/chatHandlingRepoInterFace';

export default class  ChatHandlingService  implements IChatHandlingService {
    private ChatHandlingRepo:IChatHandlingRepo
    constructor(chatHandlingRepository:IChatHandlingRepo) {
        this.ChatHandlingRepo=chatHandlingRepository
    }

    


  storeMessage = async (messageData: ChatMessageStorageRequest): Promise<ChatMessageServiceResponse> => {
    try {
      console.log('Service layer received message data:', messageData);

      // Call repository layer
      const dbResponse = await this.ChatHandlingRepo.storeMessage(messageData);

      return {
        success: true,
        message: 'Message stored successfully',
        messageId: dbResponse.messageId,
        conversationId: dbResponse.conversationId,
        doctorId: dbResponse.doctorId,
      };
    } catch (error) {
      console.error('Error in service layer:', error);

      return {
        success: false,
        message: `Service layer error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        messageId: '',
        conversationId: '',
        doctorId: ''
      };
    }
  };


fetchConversations = async (messageData: ConversationFetchRequest): Promise<ConversationServiceFetchResponse> => {
    try {
      const { userId, doctorId } = messageData;

      // Call repository layer
      const dbResponse = await this.ChatHandlingRepo.fetchConversations(userId, doctorId);
      console.log('check this response in service while the fetching conversations', dbResponse);

      return {
        success: true,
        conversations: dbResponse.conversations,
        message: 'Conversations fetched successfully'
      };

    } catch (error) {
      console.error('Error in service layer:', error);

      return {
        success: false,
        conversations: [],
        message: `Service layer error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

updateAppointmentAfterConsultation = async (
    params: AppointmentUpdateParams
  ): Promise<AppointmentUpdateResponse> => {
    try {
      // Call repository layer
      const dbResponse = await this.ChatHandlingRepo.updateAppointmentAfterConsultation(
        params.appointmentId, 
        params.endedBy
      );
      
      console.log('check this res in service layer', dbResponse);
      
      return dbResponse;
      
    } catch (error) {
      console.error('Error in service layer:', error);
      
      return {
        success: false,
        error: `Service layer error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }


}