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
        // console.log('bro check this slotes its help full',slot);
        
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
      
      console.log(` inthe repositories  Found ${appointmentSlots} slots across ${uniqueDates.length} dates`);
      
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

      console.log('........appointmentData....................',appointmentData);
      
      // Find the specific appointment slot that matches doctor email, date and time
      const appointmentSlot = await AppointmentSlot.findOne({ 
        doctorEmail: appointmentData.email,
        date: appointmentData.date,
        time: appointmentData.time
      });
  
     
      if (!appointmentSlot) {
        throw new Error('Appointment slot not found');
      }
      
      if (appointmentSlot.isBooked) {
        throw new Error('This appointment slot is already booked');
      }
  
      // Update the slot status to booked
      appointmentSlot.isBooked = true;
      appointmentSlot.patientEmail=appointmentData.userEmail
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
        created_at: new Date(),
        amount:'500',
        adminAmount:'150',
        doctorAmount:'350',
        paymentStatus:'success',
        payment_method:'online',
        payment_status:'pending'
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


  fetching_User__ApointMents = async (email: string) => {
    try {
      console.log('Fetching user appointments with email in repo:', email);
      
    
      const appointments = await AppointmentModel.find({ 
        patientEmail: email 
      }).sort({ appointmentDate: -1, appointmentTime: -1 });
      
    
      
      if (!appointments || appointments.length === 0) {
        return {
          appointments: [],
          success: true,
          message: 'No appointments found for this user'
        };
      }
      
      // Transform the data to match the proto message format
      const formattedAppointments = appointments.map((appointment: any) => ({
        id: appointment._id || appointment.id,
        patientName: appointment.patientName,
        doctorEmail: appointment.doctorEmail,
        patientPhone: appointment.patientPhone,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        notes: appointment.notes || '',
        doctorName: appointment.doctorName,
        specialty: appointment.specialty,
        patientEmail: appointment.patientEmail,
        status: appointment.status,
        message:appointment.message
      }));
      
      return {
        appointments: formattedAppointments,
        success: true,
        message: 'Appointments fetched successfully'
      };
      
    } catch (error) {
      console.error("Error fetching user appointments:", error);
      throw new Error(`Failed to fetch appointments: ${(error as Error).message}`);
    }
  }


  fetching_All__User__ApointMents = async () => {
    try {
      const appointments = await AppointmentModel.find()
        .sort({ appointmentDate: 1, appointmentTime: 1 }) // Sort by date and time
       
  
      return appointments;
    } catch (error) {
      console.error("Error fetching user appointments:", error);
      throw new Error(`Failed to fetch appointments: ${(error as Error).message}`);
    }
  };

}