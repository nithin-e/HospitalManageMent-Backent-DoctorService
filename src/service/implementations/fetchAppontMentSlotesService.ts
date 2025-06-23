import { IfetchAppontMentSlotesService } from '../interFace/fetchAppontMentSlotesInterFace';
import FetchingAppontMentSlotesRepo from '../../repositoriess/implementation/fetchingAppontMentSlotesRepo'


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

export default class fetchingAppontMentSlotesService  implements IfetchAppontMentSlotesService{
    private fetchingAppontMentSlotesRepository:FetchingAppontMentSlotesRepo;
    constructor(fetchingAppontMentSlotesRepo:FetchingAppontMentSlotesRepo) {
        this.fetchingAppontMentSlotesRepository=fetchingAppontMentSlotesRepo
    }


    fetchingAppontMent__Slotes = async (request: { email: string }) => {
      try {
        // Pass the data to the repository
        const response = await this.fetchingAppontMentSlotesRepository.fetching__AppontMentSlotes(request);
      
        return response;
      } catch (error) {
        console.error('Error in use case:', error);
        throw error;
      }
    }

    Making_Appoint_Ment = async (request: any) => {
      try {
        console.log('Service layer received request:', request);
        
        
        if (!request.patientName || !request.patientEmail || !request.appointmentDate || 
            !request.appointmentTime || !request.doctorName) {
          throw new Error('Missing required appointment information');
        }
        
       
        const appointmentData = {
          name: request.patientName,
          email: request.patientEmail, 
          phone: request.patientPhone,
          date: request.appointmentDate,
          time: request.appointmentTime,
          doctor: request.doctorName,
          specialty: request.specialty,
          userEmail: request.userEmail,
          notes: request.notes || ''
        };
        
        console.log('Mapped appointment data:', appointmentData);
        
        // Pass to repository
        const response = await this.fetchingAppontMentSlotesRepository.making__Appoint__ment(appointmentData);
      
        return response;
      } catch (error) {
        console.error('Error in use case:', error);
        throw error;
      }
    }

    fecting_UserAppointments = async (email: string) => {
      try {
        const response = await this.fetchingAppontMentSlotesRepository.fetching_User__ApointMents(email);
        return response;
      } catch (error) {
        console.error("Error in fetching single user use case:", error);
        throw error;
      }
  }


  fecting_UserAllAppointments = async () => {
    try {
      const response = await this.fetchingAppontMentSlotesRepository.fetching_All__User__ApointMents();
      return response;
    } catch (error) {
      console.error("Error in fetching all user appointments service:", error);
      throw error;
    }
  };


}