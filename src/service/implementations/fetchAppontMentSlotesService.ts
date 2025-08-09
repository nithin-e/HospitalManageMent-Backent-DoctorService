import { IfetchAppontMentSlotesService } from '../interFace/fetchAppontMentSlotesInterFace';
import FetchingAppontMentSlotesRepo from '../../repositoriess/implementation/fetchingAppontMentSlotesRepo'
import { AppointmentRequest, AppointmentResponse, CancelAppointmentRequest, CancelAppointmentResponse, FetchAppointmentSlotsRequest, FetchAppointmentSlotsResponse, IAppointment, UserAppointmentsResponse } from '../../doctorInterFace/IdoctorType';
import { IfetchAppontMentSlotesRepo } from '../../repositoriess/interFace/fetchingAppontMentSlotesRepoInterFace';




export default class fetchingAppontMentSlotesService  implements IfetchAppontMentSlotesService{
    private fetchingAppontMentSlotesRepository:IfetchAppontMentSlotesRepo;
    constructor(fetchingAppontMentSlotesRepo:IfetchAppontMentSlotesRepo) {
        this.fetchingAppontMentSlotesRepository=fetchingAppontMentSlotesRepo
    }


    fetchingAppontMent__Slotes = async (request: FetchAppointmentSlotsRequest): Promise<FetchAppointmentSlotsResponse> => {
      try {
          const response = await this.fetchingAppontMentSlotesRepository.fetching__AppontMentSlotes(request);
          return response;
      } catch (error) {
          console.error('Error in service layer:', error);
          throw error;
      }
  }

  Making_Appoint_Ment = async (request: AppointmentRequest): Promise<AppointmentResponse> => {
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
      return await this.fetchingAppontMentSlotesRepository.making__Appoint__ment(appointmentData);
    } catch (error) {
      console.error('Error in service layer:', error);
      throw error;
    }
}



fecting_UserAppointments = async (email: string): Promise<UserAppointmentsResponse> => {
  try {
      return await this.fetchingAppontMentSlotesRepository.fetching_User__ApointMents(email);
  } catch (error) {
      console.error("Error in fetching single user use case:", error);
      throw error;
  }
}



fecting_UserAllAppointments = async (): Promise<IAppointment[]> => {
  try {
    const response = await this.fetchingAppontMentSlotesRepository.fetching_All__User__ApointMents();
    return response;
  } catch (error) {
    console.error("Error in fetching all user appointments service:", error);
    throw error; // Consider creating custom error classes for better error handling
  }
}


cancellingUserAppointment__DueToUser = async (
  appointmentId: CancelAppointmentRequest['appointmentId']
): Promise<CancelAppointmentResponse> => {
  try {
    if (!appointmentId) {
      throw new Error('Appointment ID is required');
    }

    const response = await this.fetchingAppontMentSlotesRepository.cancelling_UserAppointment__DueToUser(appointmentId);
      
    
    return response;
  } catch (error) {
    console.error("Error in cancelling appointment service:", error);
    throw error;
  }
}

}