import { container } from '../config/inversify.config';
import { AppointmentController } from '../controllers/appointment.controller';
import { ChatController } from '../controllers/chat.controller';
import { PrescriptionController } from '../controllers/prescription.controller';
import { ServiceController } from '../controllers/service.controller';
import { SlotManagementController } from '../controllers/slot-management.controller';
import { TYPES } from '../types/inversify';

export const appointmentController = container.get<AppointmentController>(
    TYPES.AppointmentController
);
export const chatController = container.get<ChatController>(
    TYPES.ChatController
);

export const priscriptionController = container.get<PrescriptionController>(
    TYPES.PriscriptionController
);

export const slotManagementController = container.get<SlotManagementController>(
    TYPES.SlotmanagementController
);

export const serviceManageMentController = container.get<ServiceController>(
    TYPES.ServiceManageMentController
);

export const doctorGrpcHandlers = {
    AfterTheConsultationUpdatingAppointMent:
        appointmentController.updateAppointmentAfterConsultation,
    doctorCancellingUserBookedAppointMent:
        appointmentController.doctorCancelAppointment,
};
