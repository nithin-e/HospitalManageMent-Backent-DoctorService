import { AppointmentUpdateResponse, ChatMessageDbResponse, ChatMessageStorageRequest, ConversationDbFetchResponse } from "../../doctorInterFace/IdoctorType";
import { FilteringResponse, SearchParamss } from "../implementation/chatHandlingRepo";

export interface IChatHandlingRepo {
  storeMessage(messageData: ChatMessageStorageRequest): Promise<ChatMessageDbResponse>;
  fetchConversations(userId: string, doctorId: string): Promise<ConversationDbFetchResponse>;
  updateAppointmentAfterConsultation(appointmentId: string, endedBy: string): Promise<AppointmentUpdateResponse>;
  filteringDoctorAppoinments(params:SearchParamss): Promise<FilteringResponse>;
}
