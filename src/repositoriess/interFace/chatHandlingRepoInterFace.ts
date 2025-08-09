import { AppointmentUpdateResponse, ChatMessageDbResponse, ChatMessageStorageRequest, ConversationDbFetchResponse } from "../../doctorInterFace/IdoctorType";

export interface IchatHandlingRepo {
    Store_MsngInto__Db(messageData: ChatMessageStorageRequest): Promise<ChatMessageDbResponse>;
    fetching_Conversations(userId: string, doctorId: string): Promise<ConversationDbFetchResponse>;
    AfterTheConsultation_Updating_AppointMent(appointmentId: string ,endedBy: string): Promise<AppointmentUpdateResponse>;
  
}

