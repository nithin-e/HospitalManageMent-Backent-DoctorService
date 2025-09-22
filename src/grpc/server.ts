// import * as grpc from "@grpc/grpc-js";
// import { loadProto } from "./protoLoader";

// // Import controllers
// import chatHandlingController from "../controller/implementation/chatController";
// import storeAppointmentSlotsController from "../controller/implementation/storeAppointmentSlotsController";
// import fetchAppontMentSlotesController from "../controller/implementation/appontmentSlotesController";

// // Dependency injection (services/repositories)
// import chatHandlingServices from "../service/implementations/chatServices";
// import storeAppointmentSlotsService from "../service/implementations/appontMentSlotesService";
// import fetchAppontMentSlotesService from "../service/implementations/appontMentSlotesService";

// import chatHandlingRepo from "../repositories/implementation/chatRepository";
// import storeAppointmentSlotsRepo from "../repositories/implementation/storeAppointmentSlotsRepository";
// import fetchingAppontMentSlotesRepo from "../repositories/implementation/appontmentSlotesRepository";

// // Initialize dependencies
// const ChatRepo = new chatHandlingRepo();
// const ChatService = new chatHandlingServices(ChatRepo);
// const ChatController = new chatHandlingController(ChatService);

// const StoreRepo = new storeAppointmentSlotsRepo();
// const StoreService = new storeAppointmentSlotsService(StoreRepo);
// const StoreController = new storeAppointmentSlotsController(StoreService);

// const FetchRepo = new fetchingAppontMentSlotesRepo();
// const FetchService = new fetchAppontMentSlotesService(FetchRepo);
// const FetchController = new fetchAppontMentSlotesController(FetchService);

// // Load proto
// const grpcObject = loadProto("Doctor.proto");
// const DoctorProto = grpcObject.Doctor;

// if (!DoctorProto || !DoctorProto.DoctorService) {
//   throw new Error("Failed to load DoctorService from proto file");
// }

// // Create gRPC server
// const grpcServer = new grpc.Server({
//   "grpc.max_send_message_length": 10 * 1024 * 1024,
//   "grpc.max_receive_message_length": 10 * 1024 * 1024,
// });

// // Add gRPC services
// grpcServer.addService(DoctorProto.DoctorService.service, {
//   StoreAppointmentSlots: StoreController.storeAppointmentSlots,
//   fetchingDoctorSlots: StoreController.fetchDoctorSlots,
//   fetchingAppontMentSlotes: FetchController.fetchAppointmentSlots,
//   StoreAppointMent: FetchController.makeAppointment,
//   fectingUserAppointMents: FetchController.fetchUserAppointments,
//   fectingAllUserAppointMents: FetchController.fetchAllUserAppointments,
//   RescheduleAppointment: StoreController.rescheduleAppointment,
//   CancelUserAppointMent: StoreController.cancelAppointmentUserSide,
//   StoreMessage: ChatController.storeMessage,
//   fetchingConversations: ChatController.fetchConversations,
//   AppointmentCancelingDueToUser: FetchController.cancelUserAppointment,
//   AfterTheConsultationUpdatingAppointMent: ChatController.updateAppointmentAfterConsultation,
//   filteringDoctorAppoinments: ChatController.filteringDoctorAppoinments,
//   makingAddPrescription: StoreController.CreatingPrescription,
//   fetchingPrescription: StoreController.fetchPrescription,
//   doctorCancellingUserBookedAppointMent: StoreController.doctorCancelAppointment,
//   addNewService: FetchController.createService,
//   fetchService: FetchController.fetchService,
//   deleteService: FetchController.deleteService,
//   editService: FetchController.editService,
// });

// // Start gRPC server
// export const startGrpcServer = () => {
//   const port = process.env.DOCTOR_GRPC_PORT || "7000";
//   const host = process.env.GRPC_HOST || "0.0.0.0";
//   const serverAddress = `${host}:${port}`;

//   grpcServer.bindAsync(
//     serverAddress,
//     grpc.ServerCredentials.createInsecure(),
//     (err, bindPort) => {
//       if (err) {
//         console.error("Error starting gRPC server:", err);
//         return;
//       }
//       grpcServer.start();
//       console.log(
//         "\x1b[42m\x1b[30m%s\x1b[0m",
//         `🚀 [INFO] gRPC DOCTOR server started on port: ${bindPort} ✅`
//       );
//     }
//   );
// };
