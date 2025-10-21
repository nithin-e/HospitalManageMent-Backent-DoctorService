import {
  AppointmentUpdateResponse,
  ChatMessageDbResponse,
  ChatMessageStorageRequest,
  ConversationDbFetchResponse,

} from "../../types/Doctor.interface";

export interface IChatRepository {
  storeMessage(
    messageData: ChatMessageStorageRequest
  ): Promise<ChatMessageDbResponse>;
  fetchConversations(
    userId: string,
    doctorId: string
  ): Promise<ConversationDbFetchResponse>;

}
