

import mongoose from 'mongoose';


const conversationSchema = new mongoose.Schema({
  
  // Participants in the conversation
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userType: {
      type: String,
      enum: ['user', 'doctor'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Conversation metadata
  conversationType: {
    type: String,
    enum: ['consultation', 'follow_up', 'emergency'],
    default: 'consultation'
  },
  
  status: {
    type: String,
    enum: ['active', 'closed', 'paused'],
    default: 'active'
  },
  
  // Last message for quick preview
  lastMessage: {
    content: String,
    timestamp: Date,
    senderId: mongoose.Schema.Types.ObjectId,
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'prescription', 'audio']
    }
  },
  
  // Unread message counts for each participant
  unreadCount: [{
    userId: mongoose.Schema.Types.ObjectId,
    count: {
      type: Number,
      default: 0
    }
  }],
  
  // Additional metadata
  consultationFee: Number, // if applicable
  consultationDuration: Number, // in minutes
  appointmentDate: Date,
  
}, {
  timestamps: true // createdAt, updatedAt
});

// INDEXES FOR BETTER PERFORMANCE
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ status: 1 });

// MONGOOSE MODEL
const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;