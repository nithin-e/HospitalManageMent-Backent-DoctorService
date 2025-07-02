import * as grpc from '@grpc/grpc-js';
import { IchatHandlingRepo } from '../interFace/chatHandlingRepoInterFace';
import mongoose from 'mongoose';
import Conversation from '../../entities/conversationSchema';
import Message from '../../entities/messageSchema';
import AppointmentModel from '../../entities/AppointmentModel';


export default class chatHandlingRepo implements IchatHandlingRepo {

  Store_MsngInto__Db = async (messageData:any) => {
    try {
      // Extract data from messageData
      const {
        appointmentId,
        messageType,
        content,
        senderType,
        timestamp,
        senderId,
        fileInfo,
        replyTo
      } = messageData;


      console.log('inside the reppo messageData',messageData);
      

  
      // 1. Find or create conversation based on appointmentId
      let conversation = await Conversation.findOne({
        appointmentId: appointmentId
      });
  

      let doctorId
      // If no conversation exists, create one
      if (!conversation) {
        // Get patient and doctor IDs from appointment
        const appointment = await AppointmentModel.findById(appointmentId);
        if (!appointment) {
          throw new Error('Appointment not found');
        }
  
        doctorId=appointment.doctorId

        conversation = new Conversation({
          participants: [
            { userId: appointment.userId, userType: 'user' }, // Using 'user' instead of 'patient'
            { userId: appointment.doctorId, userType: 'doctor' }
          ],
          appointmentId: appointmentId,
          conversationType: 'consultation',
          status: 'active',
          unreadCount: [
            { userId: appointment.userId, count: 0 },
            { userId: appointment.doctorId, count: 0 }
          ]
        });
        
        conversation = await conversation.save();
      }
  
      // 2. Create and save new message
      const message = new Message({
        conversationId: conversation._id,
        senderId: senderId,
        senderType: senderType,
        content: content,
        messageType: messageType || 'text',
        fileInfo: fileInfo || null,
        replyTo: replyTo || null,
        status: 'sent'
      });
  
      const savedMessage = await message.save();
  
      // 3. Update conversation with last message and increment unread count
      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: {
          content: content,
          timestamp: new Date(),
          senderId: senderId,
          messageType: messageType || 'text'
        },
        updatedAt: new Date(),
        // Increment unread count for other participants
        $inc: {
          'unreadCount.$[elem].count': 1
        }
      }, {
        arrayFilters: [{ 'elem.userId': { $ne: senderId } }]
      });
  
      // 4. Return the required data for the service layer
      return {
        success: true,
        message: 'Message stored successfully',
        messageId: savedMessage._id.toString(),
        conversationId: conversation._id.toString(),
        doctorId: doctorId,
        // Additional data for socket emission if needed
        socketData: {
          _id: savedMessage._id,
          conversationId: conversation._id,
          senderId: senderId,
          senderType: senderType,
          content: content,
          messageType: messageType || 'text',
          fileInfo: fileInfo || null,
          timestamp: savedMessage.createdAt,
          status: 'delivered'
        }
      };
  
    } catch (error) {
      console.error('Error storing message in database:', error);
      
      throw new Error(`Database error: ${error}`);
    }
  }


  

  
}