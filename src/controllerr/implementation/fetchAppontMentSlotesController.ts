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


    


    fetchingUserApponitMents = async (call: any, callback: any) => {
      try {
        const { email } = call.request;
        
      
        const response = await this.fetchAppontMentSlotesService.fecting_UserAppointments(email);
        
        console.log('check the responce in controller check here',response);
        
        callback(null, {
          appointments: response.appointments,
          success: response.success,
          message: response.message
        });
        
      } catch (error) {
        console.log('Error fetching user appointments:', error);
        const grpcError = {
          code: grpc.status.INTERNAL,
          message: (error as Error).message,
        };
        callback(grpcError, null);
      }
    }
 


    fetchingUserAllApponitMents = async (call: any, callback: any) => {
      try {
        const response = await this.fetchAppontMentSlotesService.fecting_UserAllAppointments();
        

        console.log('.......mone mone check here.......................',response)


        const grpcResponse = {
          appointments: response.map((appointment: any) => ({
            id: appointment._id?.toString() || '',
            patientName: appointment.patientName || '',
            doctorEmail: appointment.doctorEmail || '',
            patientPhone: appointment.patientPhone || '',
            appointmentDate: appointment.appointmentDate || '',
            appointmentTime: appointment.appointmentTime || '',
            notes: appointment.notes || '',
            doctorName: appointment.doctorName || '',
            specialty: appointment.specialty || '',
            patientEmail: appointment.patientEmail || '',
            status: appointment.status || 'scheduled',
            message:appointment.message,
            amount:appointment.amount,
            adminAmount: appointment.adminAmount,
            doctorAmount:appointment.doctorAmount,
            paymentStatus:appointment.paymentStatus,
            payment_method:appointment.payment_method,
            payment_status:appointment.payment_status
          }))
        };
    
        callback(null, grpcResponse)
        
      } catch (error) {
        console.log('Error fetching user appointments:', error);
        const grpcError = {
          code: grpc.status.INTERNAL,
          message: (error as Error).message,
        };
        callback(grpcError, null);
      }
    };


}