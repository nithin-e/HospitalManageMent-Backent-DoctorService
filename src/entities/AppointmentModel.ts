import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientName: { 
    type: String, 
   
  },
  doctorEmail: { 
    type: String, 
  
  },
  patientPhone: { 
    type: String, 
   
  },
  appointmentDate: { 
    type: String, 
   
  },
  appointmentTime: { 
    type: String, 
   
  },
  notes: { 
    type: String, 
    default: '' 
  },
  doctorName: { 
    type: String, 
   
  },
  specialty: { 
    type: String, 
    
  },
  patientEmail:{ 
    type: String, 
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled' 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  },
  message: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  adminAmount: {
    type: String,
    required: true
  },
  doctorAmount: {
    type: String,
    required: true
  },

  userRefoundAmount:{
    type: String,
    
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['online', 'cash', 'card'],
    default: 'online'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  doctorId:{
    type: String,
  },
  userId:{
    type: String,
  },
  Prescription:{
    type:String,
    default:'not done'
  }
  
});

// Index for faster queries
appointmentSchema.index({ patientEmail: 1 });
appointmentSchema.index({ doctorName: 1 });
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ doctorEmail: 1 });
appointmentSchema.index({ paymentStatus: 1 });

const AppointmentModel = mongoose.model('Appointment', appointmentSchema);

export default AppointmentModel;