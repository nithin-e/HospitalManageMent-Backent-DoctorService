import * as grpc from "@grpc/grpc-js";
import {
  Appointment,
  AppointmentUpdateParams,
  AppointmentUpdateRequest,
  AppointmentUpdateResponse,
  ChatMessageGrpcCall,
  ChatMessageGrpcCallback,
  ChatMessageGrpcResponse,
  ChatMessageStorageRequest,
  ConversationGrpcFetchCall,
  ConversationGrpcFetchCallback,
  ConversationGrpcFetchResponse,
} from "../../doctorInterFace/IdoctorType";
import { IChatHandlingService } from "../../service/interFace/chatHandlingServiceInterFace";

export interface filteringDoctorAppoinmentsRequest {
  searchQuery?: string;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  limit?: number;
  role?: string;
}

export interface filteringDoctorAppoinmentsResponse {
  appointments: Appointment[];
  success: boolean;
  message: string;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface FilteringResponse {
  appointments: Appointment[];
  success: boolean;
  message: string;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface GrpcCallback {
  (response?: FilteringResponse): void;
}

export default class ChatHandlingController {
  private _chatHandlingServices: IChatHandlingService;

  constructor(chatHandlingServices: IChatHandlingService) {
    this._chatHandlingServices = chatHandlingServices;
  }

  storeMessage = async (
    call: ChatMessageGrpcCall,
    callback: ChatMessageGrpcCallback
  ): Promise<void> => {
    try {
      // Extract and validate data from gRPC call
      const messageData: ChatMessageStorageRequest = {
        appointmentId: call.request.appointmentId,
        messageType: call.request.messageType,
        content: call.request.content,
        senderType: call.request.senderType,
        timestamp:
          call.request.timestamp instanceof Date
            ? call.request.timestamp.toISOString()
            : call.request.timestamp,
        senderId: call.request.senderId,
        fileUrl: call.request.fileUrl || "",
        receverId: call.request.receverId,
      };

      // Call service layer
      const dbResponse = await this._chatHandlingServices.storeMessage(
        messageData
      );

      const response: ChatMessageGrpcResponse = {
        success: dbResponse.success,
        message: dbResponse.message,
        messageId: dbResponse.messageId || "",
        conversationId: dbResponse.conversationId || "",
        doctorId: dbResponse.doctorId || "",
      };

      callback(null, response);
    } catch (error) {
      console.error("Error in doctor service controller:", error);

      const grpcError = {
        code: grpc.status.INTERNAL,
        message:
          error instanceof Error ? error.message : "Internal server error",
      };

      // callback(grpcError, null);
    }
  };

  fetchConversations = async (
    call: ConversationGrpcFetchCall,
    callback: ConversationGrpcFetchCallback
  ): Promise<void> => {
    try {
      const { userId, doctorId } = call.request;

      // Call service layer
      const dbResponse = await this._chatHandlingServices.fetchConversations({
        userId,
        doctorId,
      });

      const response: ConversationGrpcFetchResponse = {
        success: dbResponse.success,
        conversations: dbResponse.conversations || [],
        message: dbResponse.message || "",
      };

      callback(null, response);
    } catch (error) {
      console.error("Error in doctor service controller:", error);

      const grpcError = {
        code: grpc.status.INTERNAL,
        message:
          error instanceof Error ? error.message : "Internal server error",
      };

      // callback(grpcError, null);
    }
  };


  



  updateAppointmentAfterConsultation = async (
  call: grpc.ServerUnaryCall<AppointmentUpdateRequest, AppointmentUpdateResponse>,
  callback: grpc.sendUnaryData<AppointmentUpdateResponse>
) => {
  try {
    console.log(
      "Doctor service fetchingConversations request:",
      call.request
    );
    
    const params: AppointmentUpdateParams = {
      appointmentId: call.request.appointmentId,
      endedBy: call.request.endedBy,
    };

    const serviceResponse: AppointmentUpdateResponse =
      await this._chatHandlingServices.updateAppointmentAfterConsultation(
        params
      );

    console.log("check the res in controller layer", serviceResponse);

    callback(null, serviceResponse);
  } catch (error) {
    console.error("Error in doctor service controller:", error);

    const grpcError = {
      code: grpc.status.INTERNAL,
      message:
        error instanceof Error ? error.message : "Internal server error",
    };

    callback(grpcError, null);
  }
};



  filteringDoctorAppoinments = async (
    call: grpc.ServerUnaryCall<
      filteringDoctorAppoinmentsRequest,
      filteringDoctorAppoinmentsResponse
    >,
    callback: grpc.sendUnaryData<filteringDoctorAppoinmentsResponse>
  ): Promise<void> => {
    try {
      console.log("Controller - Doctor search request:", call.request);

      let sortDirection: "asc" | "desc" = "desc";

      if (typeof call.request.sortDirection === "string") {
        const direction = call.request.sortDirection.toLowerCase();
        if (direction === "asc" || direction === "desc") {
          sortDirection = direction as "asc" | "desc";
        }
      } else if (typeof call.request.sortDirection === "number") {
        sortDirection = call.request.sortDirection >= 0 ? "asc" : "desc";
      }

      const params = {
        searchQuery: call.request.searchQuery || "",
        sortBy: call.request.sortBy || "createdAt",
        sortDirection: sortDirection,
        page: call.request.page || 1,
        limit: call.request.limit || 50,
        role: call.request.role || "",
      };

      const result =
        await this._chatHandlingServices.filteringDoctorAppoinments(params);

      console.log("Controller - Result:", {
        success: result.success,
        totalCount: result.totalCount,
        currentPage: result.currentPage,
      });

      const grpcResponse: filteringDoctorAppoinmentsResponse = {
        appointments: result.appointments.map((appt) => ({
          id: appt.id,
          patientName: appt.patientName,
          doctorEmail: appt.doctorEmail,
          patientPhone: appt.patientPhone,
          appointmentDate: appt.appointmentDate,
          appointmentTime: appt.appointmentTime,
          notes: appt.notes,
          doctorName: appt.doctorName,
          specialty: appt.specialty,
          patientEmail: appt.patientEmail,
          status: appt.status,
          message: appt.message,
          payment_method: appt.payment_method,
          paymentStatus: appt.paymentStatus,
          amount: appt.amount,
          doctorAmount: appt.doctorAmount,
          adminAmount: appt.adminAmount,
          userRefoundAmount: appt.userRefoundAmount || "",
          userId: appt.userId,
          doctorId: appt.doctorId,
          Prescription: appt.Prescription || "",
        })),
        success: result.success,
        message: result.message,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      };

      callback(null, grpcResponse);
    } catch (error) {
      console.error("Controller Error - filteringDoctorAppoinments:", error);

      // Create error response
      const errorResponse: filteringDoctorAppoinmentsResponse = {
        appointments: [],
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };

      callback(null, errorResponse);
    }
  };

  // filteringDoctorAppoinments = async (
  //   call: GrpcRequest,
  //   callback: GrpcCallback
  // ): Promise<void> => {
  //   try {
  //     console.log('Controller - Doctor search request:', call.request);

  //     let sortDirection: "asc" | "desc" = "desc";

  //     if (typeof call.request.sortDirection === "string") {
  //       const direction = call.request.sortDirection
  //       if (direction === "asc" || direction === "desc") {
  //         sortDirection = direction as "asc" | "desc";
  //       }
  //     }
  //     else if (typeof call.request.sortDirection === "number") {
  //       sortDirection = call.request.sortDirection >= 0 ? "asc" : "desc";
  //     }
  //     else if (call.request.sortDirection === "asc" || call.request.sortDirection === "desc") {
  //       sortDirection = call.request.sortDirection;
  //     }

  //     const params = {
  //       searchQuery: call.request.searchQuery || '',
  //       sortBy: call.request.sortBy?.toString() || 'createdAt',
  //       sortDirection: sortDirection,
  //       page: call.request.page || 1,
  //       limit: call.request.limit || 50,
  //       role: call.request.role || ''
  //     };

  //     const result = await this.chatHandlingServices.filteringDoctorAppoinments(params);

  //     console.log('Controller - Result:', {
  //       success: result.success,
  //       totalCount: result.totalCount,
  //       currentPage: result.currentPage
  //     });

  //     callback( result);

  //   } catch (error) {
  //     console.error('Controller Error - filteringDoctorAppoinments:', error);

  //     const errorResponse: FilteringResponse = {
  //       appointments: [],
  //       success: false,
  //       message: error instanceof Error ? error.message : 'Internal server error',
  //       totalCount: 0,
  //       totalPages: 0,
  //       currentPage: 1
  //     };

  //     callback( errorResponse);
  //   }
  // }
}
