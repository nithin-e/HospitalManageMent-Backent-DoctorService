import {
    ChatMessageGrpcRequest,
    HttpStatusCode,
} from '../types/Doctor.interface';
import { ChatMessageMapper } from '../mapers/chatMessage.mapper';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/inversify';
import { IChatService } from '../services/interfaces/IChat.service';
import { Response, Request } from 'express';
import { CHAT_MESSAGES } from '../constants/messages.constant';

@injectable()
export class ChatController {
    constructor(
        @inject(TYPES.ChatService)
        private _chatService: IChatService
    ) {}

    async storeMessageInDb(messageData: ChatMessageGrpcRequest): Promise<void> {
        try {
            const mappedData = ChatMessageMapper.toStorageRequest(messageData);
            const serviceResponse = await this._chatService.storeMessage(
                mappedData
            );
        } catch (error) {
            console.error(CHAT_MESSAGES.STORE.FAILED, error);
            throw error;
        }
    }

    fetchConversations = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId, doctorId } = req.body;

            if (!userId || !doctorId) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: CHAT_MESSAGES.VALIDATION.BOTH_IDS_REQUIRED,
                });
                return;
            }

            const dbResponse = await this._chatService.fetchConversations({
                userId,
                doctorId,
            });

            res.status(HttpStatusCode.OK).json({
                success: dbResponse.success,
                conversations: dbResponse.conversations || [],
                message: dbResponse.message || CHAT_MESSAGES.FETCH.SUCCESS,
            });
        } catch (error) {
            console.error('REST fetchConversations error:', error);

            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : CHAT_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            });
        }
    };
}
