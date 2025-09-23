import { StoreAppointmentSlotsController, FetchAppontMentSlotesController, ChatHandlingController } from "../app";

export const doctorGrpcHandlers = {
  StoreAppointmentSlots: StoreAppointmentSlotsController.storeAppointmentSlots,
  fetchingDoctorSlots: StoreAppointmentSlotsController.fetchDoctorSlots,
  fetchingAppontMentSlotes: FetchAppontMentSlotesController.fetchAppointmentSlots,
  StoreAppointMent: FetchAppontMentSlotesController.makeAppointment,
  fectingUserAppointMents: FetchAppontMentSlotesController.fetchUserAppointments,
  fectingAllUserAppointMents: FetchAppontMentSlotesController.fetchAllUserAppointments,
  RescheduleAppointment: StoreAppointmentSlotsController.rescheduleAppointment,
  CancelUserAppointMent: StoreAppointmentSlotsController.cancelAppointmentUserSide,
  StoreMessage: ChatHandlingController.storeMessage,
  fetchingConversations: ChatHandlingController.fetchConversations,
  AppointmentCancelingDueToUser: FetchAppontMentSlotesController.cancelUserAppointment,
  AfterTheConsultationUpdatingAppointMent: ChatHandlingController.updateAppointmentAfterConsultation,
  filteringDoctorAppoinments: ChatHandlingController.filteringDoctorAppoinments,
  makingAddPrescription: StoreAppointmentSlotsController.CreatingPrescription,
  fetchingPrescription: StoreAppointmentSlotsController.fetchPrescription,
  doctorCancellingUserBookedAppointMent: StoreAppointmentSlotsController.doctorCancelAppointment,
  addNewService: FetchAppontMentSlotesController.createService,
  fetchService: FetchAppontMentSlotesController.fetchService,
  deleteService: FetchAppontMentSlotesController.deleteService,
  editService: FetchAppontMentSlotesController.editService,
};
