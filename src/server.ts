import express from 'express';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import "dotenv/config";
import path from 'path';
import connectDB from './config/mongo';
import cron from 'node-cron';
import  {checkAppointments}  from './utility/cron-job';


// import controllers - FIXED PATHS AND TYPOS
import fetchAppontMentSlotesController from './controllerr/implementation/fetchAppontMentSlotesController'
import storeAppointmentSlotsController from "./controllerr/implementation/StoreAppointmentSlots_Controller"
import chatHandlingController from './controllerr/implementation/chatHandlingController';



// import services - FIXED PATHS
import fetchAppontMentSlotesService from './service/implementations/fetchAppontMentSlotesService'
import storeAppointmentSlotsService from "./service/implementations/StoreAppointmentSlotsService";
import chatHandlingServices from "./service/implementations/chatHandlingServices";


//import repo - FIXED PATHS AND TYPOS
import fetchingAppontMentSlotesRepo from "./repositoriess/implementation/fetchingAppontMentSlotesRepo";
import storeAppointmentSlotsRepo from "./repositoriess/implementation/StoreAppointmentSlots_Repo";
import chatHandlingRepo from "./repositoriess/implementation/chatHandlingRepo";


import axiosInstance from './axiousInstance';


// Initialize dependency chain for chat
const ChatHandlingRepo=new chatHandlingRepo()
const ChatHandlingServices =new chatHandlingServices(ChatHandlingRepo)
const ChatHandlingController =new chatHandlingController(ChatHandlingServices)



// Initialize dependency chain for fectingappointmentslotes
const StoreAppointmentSlotsRepo=new storeAppointmentSlotsRepo()
const StoreAppointmentSlotsService=new storeAppointmentSlotsService(StoreAppointmentSlotsRepo)
const StoreAppointmentSlotsController=new storeAppointmentSlotsController(StoreAppointmentSlotsService)


// Initialize dependency chain for fectingappointmentslotes
const FetchingAppontMentSlotesRepo=new fetchingAppontMentSlotesRepo()
const FetchAppontMentSlotesService=new fetchAppontMentSlotesService(FetchingAppontMentSlotesRepo)
const FetchAppontMentSlotesController=new fetchAppontMentSlotesController(FetchAppontMentSlotesService)



cron.schedule('* * * * *', async () => {
  
  const startedAppointments = await checkAppointments();
  if (startedAppointments.length) {
   console.log('callig again-----------------');

    const response = await axiosInstance.post('/api/doctor/appointment-alert', {
      startedAppointments
    })
  }
});



// mongoconnection
console.log('Attempting to connect to MongoDB...');
connectDB().then(() => {
  console.log('MongoDB connection successful in doctor servise');
}).catch(err => {
  console.error('MongoDB connection failed:', err);
});








const app = express();
// const httpServer = http.createServer(app);









// Load proto file for gRPC
console.log('Loading proto file for gRPC...');
const protoPath = path.resolve(__dirname, './proto/Doctor.proto');
console.log('Proto file path:', protoPath);

const packageDef = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
console.log('Proto file loaded successfully');

const grpcObject = grpc.loadPackageDefinition(packageDef) as unknown as any;
 const DoctorProto = grpcObject.Doctor;



if (!DoctorProto || !DoctorProto.DoctorService ) {
  console.error("Failed to load the User service from the proto file.");
  process.exit(1);
}
 console.log('Doctor service found in proto file');


const grpcServer = new grpc.Server({
  'grpc.max_send_message_length': 10 * 1024 * 1024, 
  'grpc.max_receive_message_length': 10 * 1024 * 1024 
});
console.log('gRPC server created');



// Add gRPC services
console.log('Adding services to gRPC server...');
grpcServer.addService(DoctorProto.DoctorService.service, {

  StoreAppointmentSlots:StoreAppointmentSlotsController.storeAppointmentSlots,

  fetchingDoctorSlots:StoreAppointmentSlotsController.fetchDoctorSlots,

   fetchingAppontMentSlotes:FetchAppontMentSlotesController.fetchAppointmentSlots,

   StoreAppointMent:FetchAppontMentSlotesController.makeAppointment,

    fectingUserAppointMents:FetchAppontMentSlotesController.fetchUserAppointments,

    fectingAllUserAppointMents:FetchAppontMentSlotesController.fetchAllUserAppointments,

    RescheduleAppointment :StoreAppointmentSlotsController.rescheduleAppointment,

    CancelUserAppointMent:StoreAppointmentSlotsController.cancelAppointmentUserSide,

    StoreMessage:ChatHandlingController.storeMessage,

    fetchingConversations:ChatHandlingController.fetchConversations,

    AppointmentCancelingDueToUser:FetchAppontMentSlotesController.cancelUserAppointment,

    AfterTheConsultationUpdatingAppointMent:ChatHandlingController.updateAppointmentAfterConsultation,

    filteringDoctorAppoinments:ChatHandlingController.filteringDoctorAppoinments,

    makingAddPrescription:StoreAppointmentSlotsController.CreatingPrescription,

    fetchingPrescription:StoreAppointmentSlotsController.fetchPrescription,

    doctorCancellingUserBookedAppointMent:StoreAppointmentSlotsController.doctorCancelAppointment,

    addNewService:FetchAppontMentSlotesController.createService,

    fetchService:FetchAppontMentSlotesController.fetchService,

    deleteService:FetchAppontMentSlotesController.deleteService,

    editService:FetchAppontMentSlotesController.editService,
});

//fectingUserAppointMents

console.log('Services added to gRPC server');

// Start gRPC server
const startGrpcServer = () => {
  const port = process.env.Doctor_GRPC_PORT || '7001';
  const domain = process.env.NODE_ENV === 'dev' ? process.env.DEV_DOMAIN : process.env.PRO_DOMAIN_USER;
  console.log(`Preparing to start gRPC server on ${domain}:${port}`);
  
  grpcServer.bindAsync(`${domain}:${port}`, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
    if (err) {
      console.error("Error starting gRPC server:", err);
      return;
    }
    grpcServer.start();
    console.log("\x1b[42m\x1b[30m%s\x1b[0m", `🚀 [INFO] gRPC DOCTOR server started on port: ${bindPort} ✅`);
  });
};



// Start both servers
console.log('Starting servers...');
startGrpcServer();