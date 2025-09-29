import {
  AppointmentUpdateResponse,
  ChatMessageDbResponse,
  ChatMessageStorageRequest,
  ConversationDbFetchResponse,
  FilteringResponse,
  SearchParam,
} from "../../types/Doctor.interface";

export interface IChatHandlingRepo {
  storeMessage(
    messageData: ChatMessageStorageRequest
  ): Promise<ChatMessageDbResponse>;
  fetchConversations(
    userId: string,
    doctorId: string
  ): Promise<ConversationDbFetchResponse>;
  updateAppointmentAfterConsultation(
    appointmentId: string,
    endedBy: string
  ): Promise<AppointmentUpdateResponse>;
}
