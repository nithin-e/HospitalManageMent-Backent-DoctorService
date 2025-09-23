import chatHandlingRepo from "./repositories/implementation/chatRepository";
import chatHandlingServices from "./service/implementations/chatServices";
import chatHandlingController from "./controller/implementation/chatController";

import storeAppointmentSlotsRepo from "./repositories/implementation/storeAppointmentSlotsRepository";
import storeAppointmentSlotsService from "./service/implementations/storeAppointmentSlotsService";
import storeAppointmentSlotsController from "./controller/implementation/storeAppointmentSlotsController";

import fetchingAppontMentSlotesRepo from "./repositories/implementation/appontmentSlotesRepository";
import fetchAppontMentSlotesService from "./service/implementations/appontMentSlotesService";
import fetchAppontMentSlotesController from "./controller/implementation/appontmentSlotesController";

// Chat
const ChatHandlingRepo = new chatHandlingRepo();
const ChatHandlingServices = new chatHandlingServices(ChatHandlingRepo);
export const ChatHandlingController = new chatHandlingController(ChatHandlingServices);

// Store Appointment Slots
const StoreAppointmentSlotsRepo = new storeAppointmentSlotsRepo();
const StoreAppointmentSlotsService = new storeAppointmentSlotsService(StoreAppointmentSlotsRepo);
export const StoreAppointmentSlotsController = new storeAppointmentSlotsController(StoreAppointmentSlotsService);

// Fetch Appointment Slots
const FetchingAppontMentSlotesRepo = new fetchingAppontMentSlotesRepo();
const FetchAppontMentSlotesService = new fetchAppontMentSlotesService(FetchingAppontMentSlotesRepo);
export const FetchAppontMentSlotesController = new fetchAppontMentSlotesController(FetchAppontMentSlotesService);
