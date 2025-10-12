import { inject, injectable } from 'inversify';
import {
    AppointmentSlotsData,
    DbResponse,
    FetchAppointmentSlotsRequest,
    FetchAppointmentSlotsResponse,
    FetchDoctorSlotsResponse,
} from '../../types/Doctor.interface';
import { ISlotmanageMentService } from '../interfaces/ISlot-mangement.service';
import { TYPES } from '../../types/inversify';
import { ISlotManagementRepository } from '../../repositories/interfaces/ISlot-meanagement-repository';

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

     
      const response = await this._slotmanageMentRepo.storeAppointmentSlots(
        appointmentData
      );

      return response;
    } catch (error: any) {
      console.error("Error in appointment slots service:", error);
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
  ): void => {
    const { doctor_email, action } = appointmentData;

    if (!doctor_email) {
      const error: any = new Error("Doctor email is required");
      error.statusCode = 400;
      throw error;
    }

    if (action === "create") {
      const { selected_dates, time_slots } = appointmentData;

      if (!selected_dates || selected_dates.length === 0) {
        const error: any = new Error(
          "Selected dates are required for creating slots"
        );
        error.statusCode = 400;
        throw error;
      }

      if (!time_slots || time_slots.length === 0) {
        const error: any = new Error(
          "Time slots are required for creating slots"
        );
        error.statusCode = 400;
        throw error;
      }
    } else if (action === "update") {
      const { removed_slot_ids, new_time_slots } = appointmentData;

      if (
        (!removed_slot_ids || removed_slot_ids.length === 0) &&
        (!new_time_slots || new_time_slots.length === 0)
      ) {
        const error: any = new Error(
          "At least one of removed slots or new slots is required for update"
        );
        error.statusCode = 400;
        throw error;
      }
    } else {
      const error: any = new Error(
        "Invalid action. Must be 'create' or 'update'"
      );
      error.statusCode = 400;
      throw error;
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
