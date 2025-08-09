import { AppointmentUpdateParams, AppointmentUpdateResponse, ChatMessageServiceResponse, ChatMessageStorageRequest, ConversationFetchRequest, ConversationServiceFetchResponse } from "../../doctorInterFace/IdoctorType";

export interface IchatHandlingService {
    StoreMsngInto__Db(messageData: ChatMessageStorageRequest): Promise<ChatMessageServiceResponse>;
    fetching__Conversations(mmessageData: ConversationFetchRequest): Promise<ConversationServiceFetchResponse>;
    AfterTheConsultation___UpdatingAppointMent( params: AppointmentUpdateParams): Promise<AppointmentUpdateResponse>;

}
