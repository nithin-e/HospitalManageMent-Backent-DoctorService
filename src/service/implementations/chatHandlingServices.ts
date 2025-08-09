import chatHandlingRepository from '../../repositoriess/implementation/chatHandlingRepo';
import * as grpc from '@grpc/grpc-js';
import { IchatHandlingService } from '../interFace/chatHandlingServiceInterFace';
import { AppointmentUpdateParams, AppointmentUpdateResponse, ChatMessageServiceResponse, ChatMessageStorageRequest, ConversationFetchRequest, ConversationServiceFetchResponse } from '../../doctorInterFace/IdoctorType';
import { IchatHandlingRepo } from '../../repositoriess/interFace/chatHandlingRepoInterFace';

export default class  chatHandlingService implements IchatHandlingService {
    private ChatHandlingRepo:IchatHandlingRepo
    constructor(chatHandlingRepository:IchatHandlingRepo) {
        this.ChatHandlingRepo=chatHandlingRepository
    }

    


  StoreMsngInto__Db = async (messageData: ChatMessageStorageRequest): Promise<ChatMessageServiceResponse> => {
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


fetching__Conversations = async (messageData: ConversationFetchRequest): Promise<ConversationServiceFetchResponse> => {
    try {
      const { userId, doctorId } = messageData;

      // Call repository layer
      const dbResponse = await this.ChatHandlingRepo.fetching_Conversations(userId, doctorId);
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

AfterTheConsultation___UpdatingAppointMent = async (
    params: AppointmentUpdateParams
  ): Promise<AppointmentUpdateResponse> => {
    try {
      // Call repository layer
      const dbResponse = await this.ChatHandlingRepo.AfterTheConsultation_Updating_AppointMent(
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