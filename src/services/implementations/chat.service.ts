import {  IChatService } from '../interfaces/IChat.service';
import {
    AppointmentUpdateParams,
    AppointmentUpdateResponse,
    ChatMessageServiceResponse,
    ChatMessageStorageRequest,
    ConversationFetchRequest,
    ConversationServiceFetchResponse,
} from '../../types/Doctor.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types/inversify';
import { IChatRepository } from '../../repositories/interfaces/IChat.repository';

/**
 * ChatHandlingService
 *
 * Service layer responsible for handling chat-related business logic
 * such as storing messages, fetching conversations, updating appointments,
 * and filtering doctor appointments.
 */

@injectable()
export class ChatService implements IChatService {
    constructor(
        @inject(TYPES.ChatRepository) private _chatRepository: IChatRepository
    ) {}

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
            console.log('Service layer received message data:', messageData);

            const dbResponse = await this._chatRepository.storeMessage(
                messageData
            );

            return {
                success: true,
                message: 'Message stored successfully',
                messageId: dbResponse.messageId,
                conversationId: dbResponse.conversationId,
                doctorId: dbResponse.doctorId,
            };
        } catch (error) {
            console.error('Error in service layer:', error);

            return {
                success: false,
                message: `Service layer error: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                messageId: '',
                conversationId: '',
                doctorId: '',
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

            const dbResponse = await this._chatRepository.fetchConversations(
                userId,
                doctorId
            );

            return {
                success: true,
                conversations: dbResponse.conversations,
                message: 'Conversations fetched successfully',
            };
        } catch (error) {
            console.error('Error in service layer:', error);

            return {
                success: false,
                conversations: [],
                message: `Service layer error: ${
                    error instanceof Error ? error.message : 'Unknown error'
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
                await this._chatRepository.updateAppointmentAfterConsultation(
                    params.appointmentId,
                    params.endedBy
                );

            return dbResponse;
        } catch (error) {
            console.error('Error in service layer:', error);

            return {
                success: false,
                error: `Service layer error: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
            };
        }
    };
}
