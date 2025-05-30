import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientName: { 
    type: String, 
    required: true 
  },
  doctorEmail: { 
    type: String, 
    required: true 
  },
  patientPhone: { 
    type: String, 
    required: true 
  },
  appointmentDate: { 
    type: String, 
    required: true 
  },
  appointmentTime: { 
    type: String, 
    required: true 
  },
  notes: { 
    type: String, 
    default: '' 
  },
  doctorName: { 
    type: String, 
    required: true 
  },
  specialty: { 
    type: String, 
    required: true 
  },
  patientEmail: { 
    type: String, 
    required: true 
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
  }
});

// Index for faster queries
appointmentSchema.index({ patientEmail: 1 });
appointmentSchema.index({ doctorName: 1 });
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });

const AppointmentModel = mongoose.model('Appointment', appointmentSchema);

export default AppointmentModel;