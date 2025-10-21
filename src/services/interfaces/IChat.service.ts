import {
  AppointmentUpdateParams,
  AppointmentUpdateResponse,
  ChatMessageServiceResponse,
  ChatMessageStorageRequest,
  ConversationFetchRequest,
  ConversationServiceFetchResponse,
  
} from "../../types/Doctor.interface";

export interface IChatService {
  storeMessage(
    messageData: ChatMessageStorageRequest
  ): Promise<ChatMessageServiceResponse>;
  fetchConversations(
    messageData: ConversationFetchRequest
  ): Promise<ConversationServiceFetchResponse>;

 
}
