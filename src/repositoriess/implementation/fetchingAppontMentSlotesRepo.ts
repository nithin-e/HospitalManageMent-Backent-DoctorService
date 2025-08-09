import AppointmentSlot from "../../entities/storeAppointmentSlot_schema";
import AppointmentModel from '../../entities/AppointmentModel'
import { IfetchAppontMentSlotesRepo } from "../interFace/fetchingAppontMentSlotesRepoInterFace";
import { Appointment, AppointmentRequest, AppointmentResponse, CancelAppointmentRequest, CancelAppointmentResponse, DateSlots, FetchAppointmentSlotsRequest, FetchAppointmentSlotsResponse, IAppointment, MongoAppointment, MongoAppointmentt, SlotInfo, UserAppointmentsResponse } from "../../doctorInterFace/IdoctorType";


export interface AllAppointmentsResponse {
  appointments: IAppointment[];
}


export default class fetchingAppontMentSloteRepo implements IfetchAppontMentSlotesRepo{
  
  fetching__AppontMentSlotes = async (request: FetchAppointmentSlotsRequest): Promise<FetchAppointmentSlotsResponse> => {
    try {
      console.log('Fetching appointment slots for email in repo:', request.email);
      
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
      
      // Type for grouped slots
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
      const timeSlots: DateSlots[] = uniqueDates.map(date => ({
        date: date,
        slots: slotsByDate[date].map(slot => ({
          id: slot.id,
          time: slot.time,
          is_booked: slot.is_booked
        }))
      }));
      
      console.log(`In the repositories: Found ${appointmentSlots.length} slots across ${uniqueDates.length} dates`);
      
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


making__Appoint__ment = async (appointmentData: AppointmentRequest): Promise<AppointmentResponse> => {
  try {
    console.log('Appointment data in repository:', appointmentData);
    
    // Find the specific appointment slot
    const appointmentSlot = await AppointmentSlot.findOne({ 
      doctorEmail: appointmentData.patientEmail,
      date: appointmentData.appointmentDate,
      time: appointmentData.appointmentTime
    });

    if (!appointmentSlot) {
      throw new Error('Appointment slot not found');
    }
    
    if (appointmentSlot.isBooked) {
      throw new Error('This appointment slot is already booked');
    }

    // Update the slot status
    appointmentSlot.isBooked = true;
    appointmentSlot.patientEmail = appointmentData.userEmail;
    appointmentSlot.updatedAt = new Date();
    await appointmentSlot.save();

    // Create new appointment record
    const newAppointment = new AppointmentModel({
      patientName: appointmentData.patientName,
      doctorEmail: appointmentData.patientEmail,
      patientPhone: appointmentData.patientPhone,
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      notes: appointmentData.notes,
      doctorName: appointmentData.doctorName,
      specialty: appointmentData.specialty,
      patientEmail: appointmentData.userEmail,
      doctorId: appointmentData.doctorId,
      userId: appointmentData.userId,
      status: 'scheduled',
      created_at: new Date(),
      amount: '500',
      adminAmount: '150',
      doctorAmount: '350',
      paymentStatus: 'success',
      payment_method: 'online',
      payment_status: 'pending'
    });
    
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


fetching_User__ApointMents = async (email: string): Promise<UserAppointmentsResponse> => {
  try {
    console.log('Fetching user appointments with email in repo:', email);
    
    const appointments = await AppointmentModel.find({ 
      patientEmail: email 
    }).sort({ appointmentDate: -1, appointmentTime: -1 }) as MongoAppointmentt[];
    
    if (!appointments || appointments.length === 0) {
      return {
        appointments: [],
        success: true,
        message: 'No appointments found for this user'
      };
    }
    
 
    const formattedAppointments: Appointment[] = appointments.map(appointment => {
     
      const baseAppointment: Appointment = {
        id: appointment._id?.toString() || appointment.id || '',
        patientName: appointment.patientName || 'Unknown',
        doctorEmail: appointment.doctorEmail || '',
        patientPhone: appointment.patientPhone || '',
        appointmentDate: appointment.appointmentDate || '',
        appointmentTime: appointment.appointmentTime || '',
        notes: appointment.notes || '',
        doctorName: appointment.doctorName || '',
        specialty: appointment.specialty || '',
        patientEmail: appointment.patientEmail || '',
        status: appointment.status || 'unknown',
        doctorId: appointment.doctorId || '',
        userRefoundAmount:appointment.userRefoundAmount,
      };

      
      if (appointment.message) baseAppointment.message = appointment.message;
      if (appointment.Prescription) baseAppointment.Prescription = appointment.Prescription;

      return baseAppointment;
    });

    console.log('Formatted appointments:', formattedAppointments);
    
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



fetching_All__User__ApointMents = async (): Promise<IAppointment[]> => {
  try {
    const appointments = await AppointmentModel.find()
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .lean()
      .exec();

    // Explicit type conversion with all required fields
    return appointments.map(appointment => ({
      id: appointment._id?.toString(),
      patientName: appointment.patientName,
      doctorEmail: appointment.doctorEmail,
      patientPhone: appointment.patientPhone,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      notes: appointment.notes,
      doctorName: appointment.doctorName,
      specialty: appointment.specialty,
      patientEmail: appointment.patientEmail,
      status: appointment.status,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
      message: appointment.message,
      amount: appointment.amount,
      adminAmount: appointment.adminAmount,
      doctorAmount: appointment.doctorAmount,
      userRefoundAmount: appointment.userRefoundAmount,
      paymentStatus: appointment.paymentStatus,
      payment_method: appointment.payment_method,
      payment_status: appointment.payment_status,
      doctorId: appointment.doctorId,
      userId: appointment.userId,
      Prescription: appointment.Prescription
    })) as IAppointment[];
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw new Error(`Failed to fetch appointments: ${(error as Error).message}`);
  }
};



cancelling_UserAppointment__DueToUser = async (
  appointmentId: CancelAppointmentRequest['appointmentId']
): Promise<CancelAppointmentResponse> => {
  try {
    console.log('Received appointment id for cancellation:', appointmentId);
    
    const result = await AppointmentModel.findByIdAndUpdate(
      appointmentId, 
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!result) {
      return { 
        success: false,
        message: 'Appointment not found' 
      };
    }
    
    return { 
      success: true,
      message: 'Appointment cancelled successfully' 
    };
    
  } catch (error) {
    console.error("Error while cancelling appointment:", error);
    throw new Error(`Failed to cancel appointment: ${(error as Error).message}`);
  }
}

}