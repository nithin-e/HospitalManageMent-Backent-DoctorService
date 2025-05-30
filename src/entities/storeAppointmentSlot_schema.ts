import mongoose from 'mongoose';


const appointmentSlotSchema = new mongoose.Schema({
  doctorEmail: {
    type: String,
    required: true,
    index: true 
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index for faster lookups by doctor and date/time
appointmentSlotSchema.index({ doctorEmail: 1, date: 1, time: 1 }, { unique: true });

const AppointmentSlot = mongoose.model('AppointmentSlot', appointmentSlotSchema);

export default AppointmentSlot