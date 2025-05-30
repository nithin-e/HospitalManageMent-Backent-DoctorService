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


    Making_Appoint_Ment = async (request: AppointmentRequest) => {
      try {
        // Validate request data
        if (!request.name || !request.email || !request.date || !request.time || !request.doctor) {
          throw new Error('Missing required appointment information');
        }
        
        // Format date for consistency if needed
        const formattedDate = new Date(request.date);
        if (isNaN(formattedDate.getTime())) {
          throw new Error('Invalid appointment date format');
        }
        
        // Pass to repository
        const response = await this.fetchingAppontMentSlotesRepository.making__Appoint__ment(request);
      
        return response;
      } catch (error) {
        console.error('Error in use case:', error);
        throw error;
      }
    }


}