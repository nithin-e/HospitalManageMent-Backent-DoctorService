import AppointmentSlot from "../../entities/storeAppointmentSlot_schema";
import AppointmentModel from '../../entities/AppointmentModel'
import { IfetchAppontMentSlotesRepo } from "../interFace/fetchingAppontMentSlotesRepoInterFace";


interface AppointmentRequest {
  name: string;        
  email: string;      
  phone: string;      
  date: string;        
  time: string;       
  notes: string;       
  doctor: string;     
  specialty: string;   
  userEmail: string;   
}

export default class fetchingAppontMentSloteRepo implements IfetchAppontMentSlotesRepo{
  
  fetching__AppontMentSlotes = async (request: { email: string }) => {
    try {
      console.log('Fetching appointment slots for email in repo :', request.email);
      
      // Find all appointment slots where doctorEmail matches the provided email
      const appointmentSlots = await AppointmentSlot.find({ doctorEmail: request.email });
      
      if (!appointmentSlots || appointmentSlots.length === 0) {
        console.log('No appointment slots found for this doctor');
        return {
          success: false,
          slots_created: 0,
          dates: [],
          time_slots: []
        };
      }
      
     
      interface SlotInfo {
        id: string;
        time: string;
        is_booked: boolean;
      }
      
      interface SlotsByDateType {
        [date: string]: SlotInfo[];
      }
      
      const slotsByDate: SlotsByDateType = {};
      
      appointmentSlots.forEach(slot => {
        if (!slotsByDate[slot.date]) {
          slotsByDate[slot.date] = [];
        }
        
        slotsByDate[slot.date].push({
          id: slot._id.toString(),
          time: slot.time,
          is_booked: slot.isBooked 
        });
      });
      
    
      const uniqueDates = Object.keys(slotsByDate);
      const timeSlots = uniqueDates.map(date => ({
        date: date,
        slots: slotsByDate[date].map(slot => ({
          id: slot.id,
          time: slot.time,
          is_booked: slot.is_booked
        }))
      }));
      
      console.log(` inthe repositories  Found ${appointmentSlots.length} slots across ${uniqueDates.length} dates`);
      
      return {
        success: true,
        slots_created: appointmentSlots.length,
        dates: uniqueDates,
        time_slots: timeSlots
      };
    } catch (error) {
      console.error('Error fetching doctor slots:', error);
      throw error;
    }
  }


  making__Appoint__ment = async (appointmentData: AppointmentRequest) => {
    try {
      // Find the specific appointment slot that matches doctor email, date and time
      const appointmentSlot = await AppointmentSlot.findOne({ 
        doctorEmail: appointmentData.email,
        date: appointmentData.date,
        time: appointmentData.time
      });
  
      // Check if the slot exists and is available
      if (!appointmentSlot) {
        throw new Error('Appointment slot not found');
      }
      
      if (appointmentSlot.isBooked) {
        throw new Error('This appointment slot is already booked');
      }
  
      // Update the slot status to booked
      appointmentSlot.isBooked = true;
      appointmentSlot.updatedAt = new Date();
      await appointmentSlot.save();
  
      // Create a new appointment record
      const newAppointment = new AppointmentModel({
        patientName: appointmentData.name,
        doctorEmail: appointmentData.email,
        patientPhone: appointmentData.phone,
        appointmentDate: appointmentData.date,
        appointmentTime: appointmentData.time,
        notes: appointmentData.notes,
        doctorName: appointmentData.doctor,
        specialty: appointmentData.specialty,
        patientEmail: appointmentData.userEmail,
        status: 'scheduled',
        created_at: new Date()
      });
      
      // Save to database
      const savedAppointment = await newAppointment.save();
      
      
      
      return {
        id: savedAppointment._id.toString(),
        message: 'Appointment booked successfully'
      };
    } catch (error) {
      console.error('Error storing appointment:', error);
      throw new Error(`Failed to store appointment: ${(error as Error).message}`);
    }
  }


}