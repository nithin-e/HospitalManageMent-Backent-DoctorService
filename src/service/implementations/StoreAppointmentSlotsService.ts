import { IStoreAppointmentSlotsService } from "../interFace/IStoreAppointmentSlots";

import {
  appointmentaData,
  AppointmentSlotsData,
  CancelData,
  Cancelres,
  CancelResponse,
  DbResponse,
  FetchDoctorSlotsResponse,
  FetchPrescriptionRequest,
  FetchPrescriptionResponse,
  PrescriptionData,
  PrescriptionResponse,
  RescheduleAppointmentRequest,
  RescheduleAppointmentResponse,
} from "../../interfaces/Doctor.interface";
import { IAppointmentSlotsRepository } from "../../repositories/interFace/IStoreAppointmentSlotsRepository";

/**
 * Service layer for managing appointment slots, cancellations,
 * rescheduling, and prescriptions.
 *
 * Acts as a bridge between controllers and repository layer.
 */

export default class StoreAppointmentSlotsServer
  implements IStoreAppointmentSlotsService
{
  private _storeAppointmentSlotsRepository: IAppointmentSlotsRepository;

  constructor(storeAppointmentSlotsRepo: IAppointmentSlotsRepository) {
    this._storeAppointmentSlotsRepository = storeAppointmentSlotsRepo;
  }

  /**
   * Creates or updates appointment slots for a doctor.
   *
   * @param appointmentData - slot creation/update request
   * @returns DbResponse with operation result
   */

  createAppointmentSlot = async (
    appointmentData: AppointmentSlotsData
  ): Promise<DbResponse> => {
    try {
      this.validateAppointmentData(appointmentData);

      const response =
        await this._storeAppointmentSlotsRepository.storeAppointmentSlots(
          appointmentData
        );

      return response;
    } catch (error) {
      console.error("Error in appointment slots service:", error);
      throw error;
    }
  };

  /**
   * Validates appointment slot creation or update request.
   *
   * @param appointmentData - data to validate
   * @throws Error if validation fails
   */

  private validateAppointmentData = (appointmentData: AppointmentSlotsData) => {
    const { doctor_email, action } = appointmentData;

    if (!doctor_email) {
      throw new Error("Doctor email is required");
    }

    if (action === "create") {
      const { selected_dates, time_slots } = appointmentData;

      if (!selected_dates || selected_dates.length === 0) {
        throw new Error("Selected dates are required for creating slots");
      }

      if (!time_slots || time_slots.length === 0) {
        throw new Error("Time slots are required for creating slots");
      }
    } else if (action === "update") {
      const { removed_slot_ids, remaining_slots } = appointmentData;

      if (
        (!removed_slot_ids || removed_slot_ids.length === 0) &&
        (!remaining_slots || remaining_slots.length === 0)
      ) {
        throw new Error(
          "Either removed slot IDs or remaining slots are required for update"
        );
      }
    }
  };

  /**
   * Fetches all slots for a doctor by email.
   *
   * @param email - doctor email
   * @returns list of slots
   */

  getDoctorSlots = async (email: string): Promise<FetchDoctorSlotsResponse> => {
    try {
      return await this._storeAppointmentSlotsRepository.fetchDoctorSlots(
        email
      );
    } catch (error) {
      console.error("Error in appointment slot service:", error);
      throw error;
    }
  };

  /**
   * Reschedules an existing appointment.
   *
   * @param rescheduleData - new date/time and appointment info
   * @returns updated appointment data
   */

  rescheduleAppointment = async (
    rescheduleData: RescheduleAppointmentRequest
  ): Promise<RescheduleAppointmentResponse> => {
    try {
      const response =
        await this._storeAppointmentSlotsRepository.rescheduleAppointment(
          rescheduleData
        );
      return response;
    } catch (error) {
      console.error("Error in service layer:", error);
      throw error;
    }
  };

  /**
   * Cancels appointment requested by a user.
   *
   * @param cancelData - user cancel request
   * @returns cancel response with status and message
   */

  cancelAppointmentByUser = async (
    cancelData: CancelData
  ): Promise<CancelResponse> => {
    try {
      const response =
        await this._storeAppointmentSlotsRepository.cancelAppointmentByUser(
          cancelData
        );
      return response;
    } catch (error) {
      console.error("Error in service layer:", error);
      return {
        success: false,
        message: "Failed to cancel appointment in service layer",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  /**
   * Creates a prescription for an appointment.
   *
   * @param prescriptionData - prescription details
   * @returns saved prescription data
   */
  createPrescription = async (
    PrescriptionData: PrescriptionData
  ): Promise<PrescriptionResponse> => {
    try {
      const response =
        await this._storeAppointmentSlotsRepository.createPrescription(
          PrescriptionData
        );
      return response;
    } catch (error) {
      console.error("Error in service layer:", error);
      throw error;
    }
  };

  /**
   * Fetches a prescription for a given appointment.
   *
   * @param request - prescription fetch request
   * @returns prescription response
   */
  getPrescription = async (
    request: FetchPrescriptionRequest
  ): Promise<FetchPrescriptionResponse> => {
    try {
      return await this._storeAppointmentSlotsRepository.fetchPrescription(
        request
      );
    } catch (error) {
      console.error("Error in service layer:", error);
      throw error;
    }
  };

  /**
   * Cancels an appointment from the doctor's side.
   *
   * @param request - doctor cancel request
   * @returns cancel response
   */
  cancelAppointmentByDoctor = async (
    request: appointmentaData
  ): Promise<Cancelres> => {
    try {
      const res =
        await this._storeAppointmentSlotsRepository.cancelAppointmentByDoctor(
          request
        );
      return res;
    } catch (err) {
      console.log(err);
      return {
        success: false,
      };
    }
  };
}
