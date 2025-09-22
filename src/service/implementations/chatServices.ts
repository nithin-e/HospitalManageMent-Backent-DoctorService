import { IChatHandlingService } from "../interFace/IChatHandlingService";
import {
  AppointmentUpdateParams,
  AppointmentUpdateResponse,
  ChatMessageServiceResponse,
  ChatMessageStorageRequest,
  ConversationFetchRequest,
  ConversationServiceFetchResponse,
  FilteringResponse,
  SearchParam,
} from "../../interfaces/Doctor.interface";
import { IChatHandlingRepo } from "../../repositories/interFace/IChatRepository";

/**
 * ChatHandlingService
 *
 * Service layer responsible for handling chat-related business logic
 * such as storing messages, fetching conversations, updating appointments,
 * and filtering doctor appointments.
 */
export default class ChatHandlingService implements IChatHandlingService {
  private _chatHandlingRepo: IChatHandlingRepo;

  constructor(chatHandlingRepository: IChatHandlingRepo) {
    this._chatHandlingRepo = chatHandlingRepository;
  }

  /**
   * Stores a chat message into the database.
   *
   * @param messageData - message details including sender, receiver, and content
   * @returns Promise resolving with service response containing success status,
   *          messageId, conversationId, and doctorId
   */
  storeMessage = async (
    messageData: ChatMessageStorageRequest
  ): Promise<ChatMessageServiceResponse> => {
    try {
      console.log("Service layer received message data:", messageData);

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

  /**
   * Fetches conversations between a user and a doctor.
   *
   * @param messageData - contains userId and doctorId
   * @returns Promise resolving with conversations list and success status
   */
  fetchConversations = async (
    messageData: ConversationFetchRequest
  ): Promise<ConversationServiceFetchResponse> => {
    try {
      const { userId, doctorId } = messageData;

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

  /**
   * Updates an appointment record after consultation ends.
   *
   * @param params - appointment update parameters including appointmentId and endedBy
   * @returns Promise resolving with update result (success/failure)
   */
  updateAppointmentAfterConsultation = async (
    params: AppointmentUpdateParams
  ): Promise<AppointmentUpdateResponse> => {
    try {
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

  /**
   * Filters doctor appointments based on query, sorting, pagination, and role.
   *
   * @param params - filtering parameters including searchQuery, sortBy, sortDirection, page, limit, and role
   * @returns Promise resolving with filtered appointments list and pagination details
   */
  async filteringDoctorAppoinments(params: {
    searchQuery?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    page?: number;
    limit?: number;
    role?: string;
  }): Promise<FilteringResponse> {
    try {
      const {
        searchQuery = "",
        sortBy = "createdAt",
        sortDirection = "desc",
        page = 1,
        limit = 50,
        role = "",
      } = params;

      const validatedPage = Math.max(1, page);
      const validatedLimit = Math.min(Math.max(1, limit), 100);
      const validatedSortDirection =
        sortDirection === "asc" || sortDirection === "desc"
          ? sortDirection
          : "desc";

      const repoParams: SearchParam = {
        searchQuery: searchQuery.trim(),
        sortBy: sortBy.trim(),
        sortDirection: validatedSortDirection,
        page: validatedPage,
        limit: validatedLimit,
        role: role.trim(),
      };

      console.log("Service Layer - Processing params:", repoParams);

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
