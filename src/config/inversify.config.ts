import { Container } from "inversify";
import { TYPES } from "../types/inversify";
import { IAppointmentRepository } from "../repositories/interfaces/IAppontMentSlotesRepository";
import AppontMentRepository from "../repositories/implementations/appointment.repository";
import { AppontMentService } from "../services/implementations/appointment.service";
import { ChatRepository } from "../repositories/implementations/chat.repository";
import ChatController from "../controllers/chat.controller";
import { IChatHandlingService } from "../services/interfaces/IChatHandlingService";
import { IChatHandlingRepo } from "../repositories/interfaces/IChatRepository";
import { ChatService } from "../services/implementations/chat.service";
import { SloteManagementRepository } from "../repositories/implementations/slote-management.repository";
import { ISlotManagementRepository } from "../repositories/interfaces/ISloteManageMentRepository";
import { SlotManagementService } from "../services/implementations/slot-management.service";
import { ISlotmanageMentService } from "../services/interfaces/ISlotmangeMentService";
import { IFetchAppointmentSlotService } from "../services/interfaces/IFetchAppontMentSlotes";
import { SlotManagementController } from "../controllers/slot-management.controller";
import { ServiceController } from "../controllers/service.controller";
import { ServiceManageMentRepository } from "../repositories/implementations/service-management.repository";
import { IServiceManageMentRepository } from "../repositories/interfaces/IService-managementRepository";
import { IServiceManageMentService } from "../services/interfaces/IServiceManageMentService";
import { ServiceManageMentService } from "../services/implementations/service-management.service";
import { AppointmentController } from "../controllers/appointment.controller";
import { PrescriptionRepository } from "../repositories/implementations/prescription.repository";
import { IPriscriptionRepo } from "../repositories/interfaces/IPriscriptionRepository";
import { PrescriptionService } from "../services/implementations/prescription.service";
import { IPriscriptionService } from "../services/interfaces/IprescriptionService";
import { PrescriptionController } from "../controllers/priscription.controller";

 export const container=new  Container()

 container.bind<IAppointmentRepository>(TYPES.AppointmentRepository).to(AppontMentRepository)
 container.bind<IFetchAppointmentSlotService>(TYPES.AppointmentService).to(AppontMentService)
 container.bind(TYPES.AppointmentController).to(AppointmentController)

 container.bind<IChatHandlingRepo>(TYPES.ChatRepository).to(ChatRepository)
 container.bind<IChatHandlingService>(TYPES.ChatService).to(ChatService)
 container.bind(TYPES.ChatController).to(ChatController)

 container.bind<ISlotManagementRepository>(TYPES.SlotmanagementRepository).to(SloteManagementRepository)
 container.bind<ISlotmanageMentService>(TYPES.SlotmanagementService).to(SlotManagementService)
 container.bind(TYPES.SlotmanagementController).to(SlotManagementController)

 container.bind<IPriscriptionRepo>(TYPES.PriscriptionRepository).to(PrescriptionRepository)
 container.bind<IPriscriptionService>(TYPES.PriscriptionService).to(PrescriptionService)
 container.bind(TYPES.PriscriptionController).to(PrescriptionController)

 container.bind<IServiceManageMentRepository>(TYPES.ServiceManageMentRepository).to(ServiceManageMentRepository)
 container.bind<IServiceManageMentService>(TYPES.ServiceManageMentService).to(ServiceManageMentService)
 container.bind(TYPES.ServiceManageMentController).to(ServiceController)