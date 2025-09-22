import {
  AppointmentUpdateParams,
  AppointmentUpdateResponse,
  ChatMessageServiceResponse,
  ChatMessageStorageRequest,
  ConversationFetchRequest,
  ConversationServiceFetchResponse,
  FilteringResponse,
} from "../../interfaces/Doctor.interface";

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
  filteringDoctorAppoinments(params: {
    searchQuery?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    page?: number;
    limit?: number;
    role?: string;
  }): Promise<FilteringResponse>;
}
