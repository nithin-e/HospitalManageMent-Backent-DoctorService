import { Types } from 'mongoose';
import Chat from '../../entities/meetSchema';
import Message from '../../entities/messageSchema';
import AppointmentModel from '../../entities/AppointmentModel';
import {
    AppointmentUpdateResponse,
    ChatMessageDbResponse,
    ChatMessageStorageRequest,
    ConversationDbFetchResponse,
} from '../../types/Doctor.interface';
import { injectable } from 'inversify';
import { IChatRepository } from '../interfaces/IChat.repository';

/**
 * ChatHandlingRepo
 *
 * Repository layer responsible for direct database operations
 * related to chat messages, conversations, and appointments.
 * Uses Mongoose models to interact with MongoDB collections.
 */

@injectable()
export class ChatRepository implements IChatRepository {
    /**
     * Stores a message in the database.
     * Creates or updates a conversation record,
     * then saves the new message in the messages collection.
     *
     * @param messageData - contains sender, receiver, appointment, and message details
     * @returns Promise resolving with message and conversation details
     */
    storeMessage = async (
        messageData: ChatMessageStorageRequest
    ): Promise<ChatMessageDbResponse> => {
        try {
            const {
                appointmentId,
                messageType,
                content,
                senderType,
                timestamp,
                senderId,
                fileUrl,
                receverId,
            } = messageData;

            const senderObjectId = new Types.ObjectId(senderId);
            const receiverObjectId = new Types.ObjectId(receverId);
            const appointmentObjectId = new Types.ObjectId(appointmentId);

            let chatId: string;
            const existingChat = await Chat.findOne({
                appointmentId: appointmentObjectId,
                participants: { $all: [senderObjectId, receiverObjectId] },
            });

            if (existingChat) {
                existingChat.lastMessage = content;
                existingChat.lastMessageType = messageType;
                existingChat.lastMessageTimestamp = timestamp;
                await existingChat.save();
                chatId = existingChat._id.toString();
                console.log('Chat updated successfully:', existingChat._id);
            } else {
                const newChat = new Chat({
                    appointmentId: appointmentObjectId,
                    participants: [senderObjectId, receiverObjectId],
                    lastMessage: content,
                    lastMessageType: messageType,
                    lastMessageTimestamp: timestamp,
                });
                const savedChat = await newChat.save();
                chatId = savedChat._id.toString();
                console.log('New chat created successfully:', savedChat._id);
            }

            const newMessage = new Message({
                senderId: senderObjectId,
                receiverId: receiverObjectId,
                appointmentId: appointmentObjectId,
                chatId: new Types.ObjectId(chatId),
                messageType: messageType,
                content: content,
                senderType: senderType,
                fileUrl: fileUrl || '',
                timestamp: timestamp,
            });

            // Save the message
            const savedMessage = await newMessage.save();
            console.log('Message saved successfully:', savedMessage._id);

            const doctorId = senderType === 'doctor' ? senderId : receverId;

            return {
                success: true,
                message: 'Message stored successfully',
                messageId: (savedMessage._id as string).toString(),
                conversationId: chatId,
                doctorId: doctorId,
            };
        } catch (error) {
            console.error('Error storing message in database:', error);

            return {
                success: false,
                message: `Database error: ${
                    error instanceof Error
                        ? error.message
                        : 'Unknown database error'
                }`,
                messageId: '',
                conversationId: '',
                doctorId: '',
            };
        }
    };

 
    fetchConversations = async (
        userId: string,
        doctorId: string
    ): Promise<ConversationDbFetchResponse> => {
        try {
            const userObjectId = new Types.ObjectId(userId);
            const doctorObjectId = new Types.ObjectId(doctorId);

            const conversations = await Chat.find({
                participants: {
                    $all: [userObjectId, doctorObjectId],
                },
            }).sort({ lastMessageTimestamp: -1 });

            const conversationsWithMessages = await Promise.all(
                conversations.map(async (conversation) => {
                    const messages = await Message.find({
                        chatId: conversation._id,
                    })
                        .sort({ timestamp: 1 })
                        .populate('senderId', 'name email')
                        .populate('receiverId', 'name email')
                        .lean();

                    return {
                        conversationId: conversation._id.toString(),
                        participants: conversation.participants.map((p: any) =>
                            p.toString()
                        ),
                        appointmentId: conversation.appointmentId.toString(),
                        lastMessage: conversation.lastMessage,
                        lastMessageType: conversation.lastMessageType,
                        lastMessageTimestamp: conversation.lastMessageTimestamp,
                        messages: messages.map((message) => ({
                            messageId: message._id.toString(),
                            senderId:
                                message.senderId._id?.toString() ||
                                message.senderId.toString(),
                            receiverId:
                                message.receiverId._id?.toString() ||
                                message.receiverId.toString(),
                            appointmentId: message.appointmentId.toString(),
                            messageType: message.messageType,
                            content: message.content,
                            senderType: message.senderType,
                            fileUrl: message.fileUrl || '',
                            timestamp: message.timestamp,
                            createdAt: message.createdAt || new Date(),
                            updatedAt: message.updatedAt || new Date(),
                        })),
                    };
                })
            );

            return {
                success: true,
                conversations: conversationsWithMessages,
            };
        } catch (error) {
            console.error('Error in repository layer:', error);
            throw new Error(
                `Repository error: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`
            );
        }
    };

   

}
