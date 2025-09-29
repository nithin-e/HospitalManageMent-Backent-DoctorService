import { inject, injectable } from 'inversify';
import {
    AppointmentSlotsData,
    DbResponse,
    FetchAppointmentSlotsRequest,
    FetchAppointmentSlotsResponse,
    FetchDoctorSlotsResponse,
} from '../../types/Doctor.interface';
import { ISlotmanageMentService } from '../interfaces/ISlotmangeMentService';
import { TYPES } from '../../types/inversify';
import { ISlotManagementRepository } from '../../repositories/interfaces/ISloteManageMentRepository';

@injectable()
export class SlotManagementService implements ISlotmanageMentService {
    constructor(
        @inject(TYPES.SlotmanagementRepository)
        private _slotmanageMentRepo: ISlotManagementRepository
    ) {}

    createAppointmentSlot = async (
        appointmentData: AppointmentSlotsData
    ): Promise<DbResponse> => {
        try {
            this.validateAppointmentData(appointmentData);

            const response =
                await this._slotmanageMentRepo.storeAppointmentSlots(
                    appointmentData
                );

            return response;
        } catch (error) {
            console.error('Error in appointment slots service:', error);
            throw error;
        }
    };

    getDoctorSlots = async (
        email: string
    ): Promise<FetchDoctorSlotsResponse> => {
        try {
            return await this._slotmanageMentRepo.fetchDoctorSlots(email);
        } catch (error) {
            console.error('Error in appointment slot service:', error);
            throw error;
        }
    };

    private validateAppointmentData = (
        appointmentData: AppointmentSlotsData
    ) => {
        const { doctor_email, action } = appointmentData;

        if (!doctor_email) {
            throw new Error('Doctor email is required');
        }

        if (action === 'create') {
            const { selected_dates, time_slots } = appointmentData;

            if (!selected_dates || selected_dates.length === 0) {
                throw new Error(
                    'Selected dates are required for creating slots'
                );
            }

            if (!time_slots || time_slots.length === 0) {
                throw new Error('Time slots are required for creating slots');
            }
        } else if (action === 'update') {
            const { removed_slot_ids, remaining_slots } = appointmentData;

            if (
                (!removed_slot_ids || removed_slot_ids.length === 0) &&
                (!remaining_slots || remaining_slots.length === 0)
            ) {
                throw new Error(
                    'Either removed slot IDs or remaining slots are required for update'
                );
            }
        }
    };

    fetchAppointmentSlots = async (
        request: FetchAppointmentSlotsRequest
    ): Promise<FetchAppointmentSlotsResponse> => {
        try {
            const response =
                await this._slotmanageMentRepo.fetchAppointmentSlots(request);
            return response;
        } catch (error) {
            console.error('Error in service layer:', error);
            throw error;
        }
    };
}
