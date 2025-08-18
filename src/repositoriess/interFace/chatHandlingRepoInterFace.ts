import { AppointmentUpdateResponse, ChatMessageDbResponse, ChatMessageStorageRequest, ConversationDbFetchResponse } from "../../doctorInterFace/IdoctorType";

export interface IChatHandlingRepo {
  storeMessage(messageData: ChatMessageStorageRequest): Promise<ChatMessageDbResponse>;
  fetchConversations(userId: string, doctorId: string): Promise<ConversationDbFetchResponse>;
  updateAppointmentAfterConsultation(appointmentId: string, endedBy: string): Promise<AppointmentUpdateResponse>;
}
