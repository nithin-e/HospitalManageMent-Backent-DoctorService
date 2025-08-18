import { IFetchAppointmentSlotsService } from '../interFace/fetchAppontMentSlotesInterFace';
import FetchingAppontMentSlotesRepo from '../../repositoriess/implementation/fetchingAppontMentSlotesRepo'
import { AppointmentRequest, AppointmentResponse, CancelAppointmentRequest, CancelAppointmentResponse, FetchAppointmentSlotsRequest, FetchAppointmentSlotsResponse, IAppointment, UserAppointmentsResponse } from '../../doctorInterFace/IdoctorType';
import { IAppointmentRepository } from '../../repositoriess/interFace/fetchingAppontMentSlotesRepoInterFace';




export default class fetchingAppontMentSlotesService  implements IFetchAppointmentSlotsService{
    private fetchingAppontMentSlotesRepository:IAppointmentRepository;
    constructor(fetchingAppontMentSlotesRepo:IAppointmentRepository) {
        this.fetchingAppontMentSlotesRepository=fetchingAppontMentSlotesRepo
    }


    fetchAppointmentSlots = async (request: FetchAppointmentSlotsRequest): Promise<FetchAppointmentSlotsResponse> => {
      try {
          const response = await this.fetchingAppontMentSlotesRepository.fetchAppointmentSlots(request);
          return response;
      } catch (error) {
          console.error('Error in service layer:', error);
          throw error;
      }
  }

  makeAppointment = async (request: AppointmentRequest): Promise<AppointmentResponse> => {
    try {
      console.log('Service layer received request:', request);
      
      
      
      // Map and validate data
      const appointmentData: AppointmentRequest = {
        patientName: request.patientName,
        patientEmail: request.patientEmail,
        patientPhone: request.patientPhone,
        appointmentDate: request.appointmentDate,
        appointmentTime: request.appointmentTime,
        doctorName: request.doctorName,
        specialty: request.specialty,
        userEmail: request.userEmail,
        notes: request.notes || '',
        userId: request.userId,
        doctorId: request.doctorId
      };
      
      console.log('Validated appointment data:', appointmentData);
      
      // Pass to repository
      return await this.fetchingAppontMentSlotesRepository.createAppointment(appointmentData);
    } catch (error) {
      console.error('Error in service layer:', error);
      throw error;
    }
}



fetchUserAppointments = async (email: string): Promise<UserAppointmentsResponse> => {
  try {
      return await this.fetchingAppontMentSlotesRepository.fetchUserAppointments(email);
  } catch (error) {
      console.error("Error in fetching single user use case:", error);
      throw error;
  }
}



fetchAllUserAppointments = async (): Promise<IAppointment[]> => {
  try {
    const response = await this.fetchingAppontMentSlotesRepository.fetchAllUserAppointments();
    return response;
  } catch (error) {
    console.error("Error in fetching all user appointments service:", error);
    throw error; // Consider creating custom error classes for better error handling
  }
}


cancelUserAppointment = async (
  appointmentId: CancelAppointmentRequest['appointmentId']
): Promise<CancelAppointmentResponse> => {
  try {
    if (!appointmentId) {
      throw new Error('Appointment ID is required');
    }

    const response = await this.fetchingAppontMentSlotesRepository.cancelUserAppointment(appointmentId);
      
    
    return response;
  } catch (error) {
    console.error("Error in cancelling appointment service:", error);
    throw error;
  }
}

}