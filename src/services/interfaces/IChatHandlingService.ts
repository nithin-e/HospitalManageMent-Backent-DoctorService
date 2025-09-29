import {
  AppointmentUpdateParams,
  AppointmentUpdateResponse,
  ChatMessageServiceResponse,
  ChatMessageStorageRequest,
  ConversationFetchRequest,
  ConversationServiceFetchResponse,
  FilteringResponse,
} from "../../types/Doctor.interface";

export interface IChatHandlingService {
  storeMessage(
    messageData: ChatMessageStorageRequest
  ): Promise<ChatMessageServiceResponse>;
  fetchConversations(
    messageData: ConversationFetchRequest
  ): Promise<ConversationServiceFetchResponse>;
  updateAppointmentAfterConsultation(
    params: AppointmentUpdateParams
  ): Promise<AppointmentUpdateResponse>;
 
}
