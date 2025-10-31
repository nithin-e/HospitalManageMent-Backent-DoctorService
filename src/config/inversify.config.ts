import { Container } from 'inversify';
import { TYPES } from '../types/inversify';
import { AppointmentController } from '../controllers/appointment.controller';
import { ChatController } from '../controllers/chat.controller';
import { PrescriptionController } from '../controllers/prescription.controller';
import { ServiceController } from '../controllers/service.controller';
import { SlotManagementController } from '../controllers/slot-management.controller';
import { AppontMentRepository } from '../repositories/implementations/appointment.repository';
import { ChatRepository } from '../repositories/implementations/chat.repository';
import { PrescriptionRepository } from '../repositories/implementations/prescription.repository';
import { ServiceManageMentRepository } from '../repositories/implementations/service-management.repository';
import { SloteManagementRepository } from '../repositories/implementations/slote-management.repository';
import { IAppointmentRepository } from '../repositories/interfaces/IAppointment.repository';
import { IPriscriptionRepo } from '../repositories/interfaces/IPriscription.repository';
import { IServiceManageMentRepository } from '../repositories/interfaces/IService-management-repository';
import { ISlotManagementRepository } from '../repositories/interfaces/ISlot-meanagement-repository';
import { AppontMentService } from '../services/implementations/appointment.service';
import { ChatService } from '../services/implementations/chat.service';
import { PrescriptionService } from '../services/implementations/prescription.service';
import { ServiceManageMentService } from '../services/implementations/service-management.service';
import { SlotManagementService } from '../services/implementations/slot-management.service';
import { IAppointmentService } from '../services/interfaces/IAppontment.service';
import { IChatService } from '../services/interfaces/IChat.service';
import { IPrescriptionService } from '../services/interfaces/IPrescription.service';
import { IServiceManageMentService } from '../services/interfaces/IService-management.service';
import { ISlotmanageMentService } from '../services/interfaces/ISlot-mangement.service';
import { IChatRepository } from '../repositories/interfaces/IChat.repository';

export const container = new Container();

container
    .bind<IAppointmentRepository>(TYPES.AppointmentRepository)
    .to(AppontMentRepository);
container
    .bind<IAppointmentService>(TYPES.AppointmentService)
    .to(AppontMentService);
container.bind(TYPES.AppointmentController).to(AppointmentController);

container.bind<IChatRepository>(TYPES.ChatRepository).to(ChatRepository);
container.bind<IChatService>(TYPES.ChatService).to(ChatService);
container.bind(TYPES.ChatController).to(ChatController);

container
    .bind<ISlotManagementRepository>(TYPES.SlotmanagementRepository)
    .to(SloteManagementRepository);
container
    .bind<ISlotmanageMentService>(TYPES.SlotmanagementService)
    .to(SlotManagementService);
container.bind(TYPES.SlotmanagementController).to(SlotManagementController);

container
    .bind<IPriscriptionRepo>(TYPES.PriscriptionRepository)
    .to(PrescriptionRepository);
container
    .bind<IPrescriptionService>(TYPES.PriscriptionService)
    .to(PrescriptionService);
container.bind(TYPES.PriscriptionController).to(PrescriptionController);

container
    .bind<IServiceManageMentRepository>(TYPES.ServiceManageMentRepository)
    .to(ServiceManageMentRepository);
container
    .bind<IServiceManageMentService>(TYPES.ServiceManageMentService)
    .to(ServiceManageMentService);
container.bind(TYPES.ServiceManageMentController).to(ServiceController);
