import * as grpc from '@grpc/grpc-js';
import storeAppointmentSlotsService from "../../service/implementations/StoreAppointmentSlotsService";
import { IStoreAppointmentSlots_Controller } from '../interFace/StoreAppointmentSlots_InterFace';


 export default class StoreAppointmentSlotsController  implements IStoreAppointmentSlots_Controller{
      private storeAppointmentSlotsService:storeAppointmentSlotsService

    constructor(storeAppointmentSlotsService:storeAppointmentSlotsService) {
      this.storeAppointmentSlotsService=storeAppointmentSlotsService  
      }

      storeAppointmentSlots = async (call: any, callback: any) => {
        try {
         
          console.log('Doctor slots processed in controller:',call.request );

          // Pass the request data to the use case service
          const dbResponse = await this.storeAppointmentSlotsService.storeAppointment_Slots(call.request);
          
          // console.log('Doctor slots processed in controller:', dbResponse);
          
          // Return response to API gateway
          callback(null, dbResponse);
        } catch (error) {
          console.log('Error in doctor controller:', error);
          const grpcError = {
            code: grpc.status.INTERNAL,
            message: (error as Error).message,
          };
          callback(grpcError, null);
        }
      }
      

      fetchDoctorSlots= async (call: any, callback: any) => {
        try {
          
          
          // Pass the request data to the use case
          const dbResponse = await this.storeAppointmentSlotsService.fetchDoctor__Slots(call.request);
          
          console.log('check dbResponse dbResponse',dbResponse);
          
          
          // Return a response (assuming you want to return some data)
          callback(null, dbResponse);
        } catch (error) {
          console.log('Error in notification controller:', error);
          const grpcError = {
            code: grpc.status.INTERNAL,
            message: (error as Error).message,
          };
          callback(grpcError, null);
        }
      }


      rescheduleAppointment = async (call: any, callback: any) => {
        try {
            
            
            const dbResponse = await this.storeAppointmentSlotsService.slotReschedule__Appointment(call.request);

            console.log('check for the final result in CONTROLLER ',dbResponse);
            
            callback(null, dbResponse);
        } catch (error) {
            console.log('Error in notification controller:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: (error as Error).message,
            };
            callback(grpcError, null);
        }
    }
  

    CancelingAppointMentUserSide =async (call:any , callback:any)=>{
        try {
          
          console.log('check here getting the cancelling details',call.request);
           const res= await this.storeAppointmentSlotsService.CancelingAppointMent__UserSide(call.request)
           callback(null, res);


        } catch (error) {
          
          console.log('Error in notification controller:', error);
          const grpcError = {
              code: grpc.status.INTERNAL,
              message: (error as Error).message,
          };
          callback(grpcError, null);
        }
    }

}