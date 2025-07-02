

import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema({
  
  // Reference to conversation
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  
  // Sender information
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  senderType: {
    type: String,
    enum: ['user', 'doctor'],
    required: true
  },
  
  // Message content
  content: {
    type: String,
    required: true
  },
  
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'prescription', 'audio', 'system'],
    default: 'text'
  },
  
  // File/Media information (if applicable)
  fileInfo: {
    fileName: String,
    fileSize: Number,
    fileType: String,
    fileUrl: String
  },
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  // Read receipts
  readBy: [{
    userId: mongoose.Schema.Types.ObjectId,
    readAt: Date
  }],
  
  // Reply/Thread information
  replyTo: {
    messageId: mongoose.Schema.Types.ObjectId,
    content: String // snippet of original message
  },
  
  // Message reactions (optional)
  reactions: [{
    userId: mongoose.Schema.Types.ObjectId,
    reaction: String, // emoji or reaction type
    reactedAt: Date
  }],
  
  // System message data (for automated messages)
  systemData: {
    type: String, // 'appointment_reminder', 'prescription_sent', etc.
    data: mongoose.Schema.Types.Mixed
  },
  
  // Soft delete flag
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: Date,
  
}, {
  timestamps: true // createdAt, updatedAt
});

// INDEXES FOR BETTER PERFORMANCE
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ conversationId: 1, status: 1 });

// MONGOOSE MODEL
const Message = mongoose.model('Message', messageSchema);

export default Message;