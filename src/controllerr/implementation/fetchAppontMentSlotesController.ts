import * as grpc from '@grpc/grpc-js';
import fetchAppontMentSlotesService from "../../service/implementations/fetchAppontMentSlotesService";
import { IfetchAppontMentSlotesController } from '../interFace/fetchAppontMentSlotesInterFace';


 export default class fetchingAppontMentSlotesController implements IfetchAppontMentSlotesController{
      private fetchAppontMentSlotesService:fetchAppontMentSlotesService

    constructor(fetchAppontMentSlotesService:fetchAppontMentSlotesService) {
     this.fetchAppontMentSlotesService=fetchAppontMentSlotesService;

    }




    fetchingAppontMentSlotes = async (call: any, callback: any) => {
      try {
        console.log('doctor controller request:', call.request);
        
        // Pass the request data to the use case
        const dbResponse = await this.fetchAppontMentSlotesService.fetchingAppontMent__Slotes(call.request);
        
        console.log('doctor slots fetched: in controller', dbResponse);
        
        // Return a response
        callback(null, dbResponse);
      } catch (error) {
        console.log('Error in controller:', error);
        const grpcError = {
          code: grpc.status.INTERNAL,
          message: (error as Error).message,
        };
        callback(grpcError, null);
      }
    }



    MakingAppointMent = async (call: any, callback: any) => {
      try {
        console.log('doctor controller request:', call.request);
        
        // Pass the complete request data to the use case
        const dbResponse = await this.fetchAppontMentSlotesService.Making_Appoint_Ment(call.request);
        
        console.log('appointmenttt created: in controller', dbResponse);
        
        // Return a response
        callback(null, {
          success: true,
          message: 'Appointment booked successfully',
          appointment_id: dbResponse.id,
        
        });
      } catch (error) {
        console.log('Error in controller:', error);
        const grpcError = {
          code: grpc.status.INTERNAL,
          message: (error as Error).message,
        };
        callback(grpcError, null);
      }
    }


}