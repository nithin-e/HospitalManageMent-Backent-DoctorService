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
          console.log('Doctor controller request:', call.request);
          
          // Pass the request data to the use case service
          const dbResponse = await this.storeAppointmentSlotsService.storeAppointment_Slots(call.request);
          
          console.log('Doctor slots processed in controller:', dbResponse);
          
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
      // storeAppointmentSlots = async (call: any, callback: any) => {
      //   try {
      //     console.log('Doctor controller request:', call.request);
          
      //     // Pass the request data to the use case service
      //     const dbResponse = await this.storeAppointmentSlotsService.storeAppointment_Slots(call.request);
          
      //     console.log('Doctor slots processed in controller:', dbResponse);
          
      //     // Return response to API gateway
      //     callback(null, dbResponse);
      //   } catch (error) {
      //     console.log('Error in doctor controller:', error);
      //     const grpcError = {
      //       code: grpc.status.INTERNAL,
      //       message: (error as Error).message,
      //     };
      //     callback(grpcError, null);
      //   }
      // }


      fetchDoctorSlots= async (call: any, callback: any) => {
        try {
          console.log('doctor controllerrrrrrr request:', call.request);
          
          // Pass the request data to the use case
          const dbResponse = await this.storeAppointmentSlotsService.fetchDoctor__Slots(call.request);
          
          console.log('doctor created: in note controller',dbResponse);
          
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



}