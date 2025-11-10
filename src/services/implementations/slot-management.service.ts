import { inject, injectable } from 'inversify';
import {
    AppointmentSlotsData,
    Data,
    DbResponse,
    FetchAppointmentSlotsRequest,
    FetchAppointmentSlotsResponse,
    FetchDoctorSlotsResponse,
    HttpStatusCode,
} from '../../types/Doctor.interface';
import { ISlotmanageMentService } from '../interfaces/ISlot-mangement.service';
import { TYPES } from '../../types/inversify';
import { ISlotManagementRepository } from '../../repositories/interfaces/ISlot-meanagement-repository';
import { SLOT_MESSAGES } from '../../constants/messages.constant';

@injectable()
export class SlotManagementService implements ISlotmanageMentService {
    constructor(
        @inject(TYPES.SlotmanagementRepository)
        private _slotmanageMentRepository: ISlotManagementRepository
    ) {}

    createAppointmentSlot = async (
        appointmentData: AppointmentSlotsData
    ): Promise<DbResponse> => {
        try {
            this.validateAppointmentData(appointmentData);

            const response =
                await this._slotmanageMentRepository.storeAppointmentSlots(
                    appointmentData
                );

            return response;
        } catch (error) {
            console.error(SLOT_MESSAGES.ERROR.SERVICE_LAYER_ERROR, error);
            throw error;
        }
    };

    getDoctorSlots = async (
        email: string
    ): Promise<FetchDoctorSlotsResponse> => {
        try {
            return await this._slotmanageMentRepository.fetchDoctorSlots(email);
        } catch (error) {
            console.error(SLOT_MESSAGES.ERROR.SERVICE_LAYER_ERROR, error);
            throw error;
        }
    };
    private validateAppointmentData = (
        appointmentData: AppointmentSlotsData
    ): void => {
        const { doctor_email, action } = appointmentData;

        if (!doctor_email) {
            const error: Data = new Error(
                SLOT_MESSAGES.VALIDATION.DOCTOR_EMAIL_REQUIRED
            );
            error.statusCode = HttpStatusCode.NOT_FOUND;
            throw error;
        }

        if (action === 'create') {
            const { selected_dates, time_slots } = appointmentData;

            if (!selected_dates || selected_dates.length === 0) {
                const error: Data = new Error(
                    SLOT_MESSAGES.VALIDATION.SELECTED_DATES_REQUIRED
                );
                error.statusCode =  HttpStatusCode.NOT_FOUND;
                throw error;
            }

            if (!time_slots || time_slots.length === 0) {
                const error: Data = new Error(
                    SLOT_MESSAGES.VALIDATION.TIME_SLOTS_REQUIRED
                );
                error.statusCode =  HttpStatusCode.NOT_FOUND;
                throw error;
            }
        } else if (action === 'update') {
            const { removed_slot_ids, new_time_slots } = appointmentData;

            if (
                (!removed_slot_ids || removed_slot_ids.length === 0) &&
                (!new_time_slots || new_time_slots.length === 0)
            ) {
                const error: Data = new Error(
                    SLOT_MESSAGES.VALIDATION.UPDATE_DATA_REQUIRED
                );
                error.statusCode =  HttpStatusCode.NOT_FOUND;
                throw error;
            }
        } else {
            const error: Data = new Error(
                SLOT_MESSAGES.VALIDATION.UPDATE_DATA_REQUIRED
            );
            error.statusCode =  HttpStatusCode.NOT_FOUND;
            throw error;
        }
    };

    fetchAppointmentSlots = async (
        request: FetchAppointmentSlotsRequest
    ): Promise<FetchAppointmentSlotsResponse> => {
        try {
            const response =
                await this._slotmanageMentRepository.fetchAppointmentSlots(
                    request
                );
            return response;
        } catch (error) {
            console.error(SLOT_MESSAGES.ERROR.SERVICE_LAYER_ERROR, error);
            throw error;
        }
    };
}
