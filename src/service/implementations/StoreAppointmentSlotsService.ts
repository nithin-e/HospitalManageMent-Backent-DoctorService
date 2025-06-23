import { IStoreAppointmentSlotsService } from '../interFace/StoreAppointmentSlotsInterFace';
import StoreAppointmentSlots_Repo from '../../repositoriess/implementation/StoreAppointmentSlots_Repo'


export default class StoreAppointmentSlotsServer implements IStoreAppointmentSlotsService{
    private storeAppointmentSlotsRepository:StoreAppointmentSlots_Repo;
    constructor(storeAppointmentSlots_Repo:StoreAppointmentSlots_Repo) {
        this.storeAppointmentSlotsRepository=storeAppointmentSlots_Repo
    }

    storeAppointment_Slots = async (appointmentData: any) => {
      try {
        // console.log('Service layer processing:', appointmentData);
        
        // Validate the request data
        this.validateAppointmentData(appointmentData);
        
        // Pass the data to the repository
        const response = await this.storeAppointmentSlotsRepository.store__Appointment_Slots(appointmentData);
      
        return response;
      } catch (error) {
        console.error('Error in appointment slots service:', error);
        throw error;
      }
    }
    
    // Validation method
    private validateAppointmentData = (appointmentData: any) => {
      const { doctor_email, action } = appointmentData;
      
      if (!doctor_email) {
        throw new Error('Doctor email is required');
      }
      
      if (action === 'create') {
        const { selected_dates, time_slots } = appointmentData;
        
        if (!selected_dates || selected_dates.length === 0) {
          throw new Error('Selected dates are required for creating slots');
        }
        
        if (!time_slots || time_slots.length === 0) {
          throw new Error('Time slots are required for creating slots');
        }
      } else if (action === 'update') {
        const { removed_slot_ids, remaining_slots } = appointmentData;
        
        if ((!removed_slot_ids || removed_slot_ids.length === 0) && 
            (!remaining_slots || remaining_slots.length === 0)) {
          throw new Error('Either removed slot IDs or remaining slots are required for update');
        }
      }
    }




      fetchDoctor__Slots = async (email: any) => {
        try {
          // Pass the data to the repository
          const response = await this.storeAppointmentSlotsRepository.fetch_Doctor__Slots(email);
        
          return response;
        } catch (error) {
          console.error('Error in use case:', error);
          throw error;
        }
      }


      slotReschedule__Appointment = async (rescheduleData: any) => {
        try {
            
            
            
            // Pass the data to the repository
            const response = await this.storeAppointmentSlotsRepository.slot_Reschedule_Appointment(rescheduleData);
            
            return response;
        } catch (error) {
            console.error('Error in service layer:', error);
            throw error;
        }
    }

    CancelingAppointMent__UserSide =async (calcellData:any)=>{
      try {
            
            
            
      
        const response = await this.storeAppointmentSlotsRepository.Canceling_AppointMent__UserSide(calcellData);
        
        return response;
    } catch (error) {
        console.error('Error in service layer:', error);
        throw error;
    }
    }
}