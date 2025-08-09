import { IStoreAppointmentSlotsService } from '../interFace/StoreAppointmentSlotsInterFace';
import StoreAppointmentSlots_Repo, { CancelData, CancelResponse, FetchPrescriptionRequest, FetchPrescriptionResponse, PrescriptionData, PrescriptionResponse } from '../../repositoriess/implementation/StoreAppointmentSlots_Repo'
import { AppointmentSlotsData, Cancelres, DbResponse, FetchDoctorSlotsRequest, FetchDoctorSlotsResponse, RescheduleAppointmentRequest, RescheduleAppointmentResponse } from '../../doctorInterFace/IdoctorType';
import { IStoreAppointmentSlots_Repo } from '../../repositoriess/interFace/StoreAppointmentSlots_RepoInterFace';
import { appointmentaData } from '../../controllerr/implementation/StoreAppointmentSlots_Controller';


export default class StoreAppointmentSlotsServer implements IStoreAppointmentSlotsService{
    private storeAppointmentSlotsRepository:IStoreAppointmentSlots_Repo;

    constructor(storeAppointmentSlots_Repo:IStoreAppointmentSlots_Repo) {
        this.storeAppointmentSlotsRepository=storeAppointmentSlots_Repo
    }

    storeAppointment_Slots = async (appointmentData:AppointmentSlotsData):Promise<DbResponse> => {
      try {
         console.log('Service layer processing:', appointmentData);
        
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
    private validateAppointmentData = (appointmentData: AppointmentSlotsData) => {
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




   
   fetchDoctor__Slots = async (email:string): Promise<FetchDoctorSlotsResponse>=> {
      try {
          return await this.storeAppointmentSlotsRepository.fetch_Doctor__Slots(email);
      } catch (error) {
          console.error('Error in appointment slot service:', error);
          throw error;
      }
  }




  slotReschedule__Appointment = async (
    rescheduleData: RescheduleAppointmentRequest
  ): Promise<RescheduleAppointmentResponse> => {
    try {
      // Pass the data to the repository
      const response = await this.storeAppointmentSlotsRepository.slot_Reschedule_Appointment(rescheduleData);
      return response;
    } catch (error) {
      console.error('Error in service layer:', error);
      throw error;
    }
  }



   CancelingAppointMent__UserSide = async (cancelData: CancelData): Promise<CancelResponse> => {
    try {
        const response = await this.storeAppointmentSlotsRepository.Canceling_AppointMent__UserSide(cancelData);
        return response;
    } catch (error) {
        console.error('Error in service layer:', error);
        return {
            success: false,
            message: 'Failed to cancel appointment in service layer',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};


    


Creating_Prescription = async (PrescriptionData: PrescriptionData): Promise<PrescriptionResponse> => {
  try {
      const response = await this.storeAppointmentSlotsRepository.Creating__Prescription(PrescriptionData);
      return response;
  } catch (error) {
      console.error('Error in service layer:', error);
      throw error;
  }
}


fetching__Prescription = async (
  request: FetchPrescriptionRequest
): Promise<FetchPrescriptionResponse> => {
  try {
    // You could add additional business logic here if needed
    return await this.storeAppointmentSlotsRepository.fetching_Prescription(request);
  } catch (error) {
    console.error('Error in service layer:', error);
    throw error;
  }
}


doctorCancelling_UserAppointment =async (request: appointmentaData):Promise<Cancelres> =>{
   try{

    const res=  await this.storeAppointmentSlotsRepository.doctorCancelling_User_Appointment(request)
    return res

   }catch (err){
    console.log(err);
        return {
            success: false
        };
   }

}

}