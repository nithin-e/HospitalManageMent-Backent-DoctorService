import express from "express";
import { container } from "../config/inversify.config";
import { AppointmentController } from "../controllers/appointment.controller";
import { TYPES } from "../types/inversify";
import { ChatController } from "../controllers/chat.controller";
import { PrescriptionController } from "../controllers/prescription.controller";
import { ServiceController } from "../controllers/service.controller";
import { SlotManagementController } from "../controllers/slot-management.controller";


const doctorRoute= express.Router()



export const appointmentController = container.get<AppointmentController>(
    TYPES.AppointmentController
);

export const chatController = container.get<ChatController>(
    TYPES.ChatController
);


export const priscriptionController=container.get<PrescriptionController>(TYPES.PriscriptionController)

export const serviceManageMentController=container.get<ServiceController>(TYPES.ServiceManageMentController) 

export const slotManagementController= container.get<SlotManagementController>(TYPES.SlotmanagementController)


doctorRoute.post('/fectingAllUserAppointMents',appointmentController.fetchAllUserAppointments)
doctorRoute.post('/fectingAppointMent',appointmentController.fetchUserAppointments)
doctorRoute.post('/CancelingUserAppointMent',appointmentController.cancelAppointmentUserSide)
doctorRoute.get('/doctorAppointmentPagination',appointmentController.filteringDoctorAppointments)
doctorRoute.post('/stripe-webhook',appointmentController.makeAppointment)
doctorRoute.post('/fetchUserConversations',chatController.fetchConversations)
doctorRoute.post('/AddPrescription',priscriptionController.createPrescription)
doctorRoute.post('/fetchingPrescription',priscriptionController.fetchPrescription)
doctorRoute.post('/addService',serviceManageMentController.createService)
doctorRoute.get('/fetchService',serviceManageMentController.fetchService)
doctorRoute.post('/deleteService/:serviceId',serviceManageMentController.deleteService)
doctorRoute.post('/editService/:serviceId',serviceManageMentController.editService)
doctorRoute.post('/fectingAppointMentSlotes',slotManagementController.fetchAppointmentSlots)
doctorRoute.post('/fetchDoctorSlots',slotManagementController.fetchDoctorSlots)
doctorRoute.post('/FecthAppointMentForAdmin',appointmentController.fetchAllUserAppointments)
doctorRoute.post('/appointment-slots',slotManagementController.storeAppointmentSlots)
doctorRoute.post('/stripe-webhook',appointmentController.makeAppointment)


// blockingDoctor 
// AddPrescription



export default doctorRoute