import chatHandlingRepository, {
  FilteringResponse,
  SearchParamss,
} from "../../repositoriess/implementation/chatHandlingRepo";
import * as grpc from "@grpc/grpc-js";
import { IChatHandlingService } from "../interFace/chatHandlingServiceInterFace";
import {
  AppointmentUpdateParams,
  AppointmentUpdateResponse,
  ChatMessageServiceResponse,
  ChatMessageStorageRequest,
  ConversationFetchRequest,
  ConversationServiceFetchResponse,
} from "../../doctorInterFace/IdoctorType";
import { IChatHandlingRepo } from "../../repositoriess/interFace/chatHandlingRepoInterFace";

export default class ChatHandlingService implements IChatHandlingService {
  private _chatHandlingRepo: IChatHandlingRepo;

  constructor(chatHandlingRepository: IChatHandlingRepo) {
    this._chatHandlingRepo = chatHandlingRepository;
  }

  storeMessage = async (
    messageData: ChatMessageStorageRequest
  ): Promise<ChatMessageServiceResponse> => {
    try {
      console.log("Service layer received message data:", messageData);

      // Call repository layer
      const dbResponse = await this._chatHandlingRepo.storeMessage(messageData);

      return {
        success: true,
        message: "Message stored successfully",
        messageId: dbResponse.messageId,
        conversationId: dbResponse.conversationId,
        doctorId: dbResponse.doctorId,
      };
    } catch (error) {
      console.error("Error in service layer:", error);

      return {
        success: false,
        message: `Service layer error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        messageId: "",
        conversationId: "",
        doctorId: "",
      };
    }
  };

  fetchConversations = async (
    messageData: ConversationFetchRequest
  ): Promise<ConversationServiceFetchResponse> => {
    try {
      const { userId, doctorId } = messageData;

      // Call repository layer
      const dbResponse = await this._chatHandlingRepo.fetchConversations(
        userId,
        doctorId
      );

      return {
        success: true,
        conversations: dbResponse.conversations,
        message: "Conversations fetched successfully",
      };
    } catch (error) {
      console.error("Error in service layer:", error);

      return {
        success: false,
        conversations: [],
        message: `Service layer error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  };

  updateAppointmentAfterConsultation = async (
    params: AppointmentUpdateParams
  ): Promise<AppointmentUpdateResponse> => {
    try {
      // Call repository layer
      const dbResponse =
        await this._chatHandlingRepo.updateAppointmentAfterConsultation(
          params.appointmentId,
          params.endedBy
        );

      return dbResponse;
    } catch (error) {
      console.error("Error in service layer:", error);

      return {
        success: false,
        error: `Service layer error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  };

  async filteringDoctorAppoinments(params: {
    searchQuery?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    page?: number;
    limit?: number;
    role?: string;
  }): Promise<FilteringResponse> {
    try {
      // Destructure with defaults
      const {
        searchQuery = "",
        sortBy = "createdAt",
        sortDirection = "desc",
        page = 1,
        limit = 50,
        role = "",
      } = params;

      // Validate and sanitize input parameters
      const validatedPage = Math.max(1, page);
      const validatedLimit = Math.min(Math.max(1, limit), 100);
      const validatedSortDirection =
        sortDirection === "asc" || sortDirection === "desc"
          ? sortDirection
          : "desc";

      // Prepare parameters object for repository
      const repoParams: SearchParamss = {
        searchQuery: searchQuery.trim(),
        sortBy: sortBy.trim(),
        sortDirection: validatedSortDirection,
        page: validatedPage,
        limit: validatedLimit,
        role: role.trim(),
      };

      console.log("Service Layer - Processing params:", repoParams);

      // Call repository layer
      const result = await this._chatHandlingRepo.filteringDoctorAppoinments(
        repoParams
      );

      return result;
    } catch (error) {
      console.error("Service Layer Error - filteringDoctorAppoinments:", error);

      return {
        appointments: [],
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
        totalCount: 0,
        totalPages: 0,
        currentPage: params.page || 1,
      };
    }
  }
}
