import { IStoreAppointmentSlotsService } from "../interFace/StoreAppointmentSlotsInterFace";
import StoreAppointmentSlots_Repo, {
  CancelData,
  CancelResponse,
  FetchPrescriptionRequest,
  FetchPrescriptionResponse,
  PrescriptionData,
  PrescriptionResponse,
} from "../../repositoriess/implementation/StoreAppointmentSlots_Repo";
import {
  AppointmentSlotsData,
  Cancelres,
  DbResponse,
  FetchDoctorSlotsRequest,
  FetchDoctorSlotsResponse,
  RescheduleAppointmentRequest,
  RescheduleAppointmentResponse,
} from "../../doctorInterFace/IdoctorType";
import { IAppointmentSlotsRepository } from "../../repositoriess/interFace/StoreAppointmentSlots_RepoInterFace";
import { appointmentaData } from "../../controllerr/implementation/StoreAppointmentSlots_Controller";

export default class StoreAppointmentSlotsServer
  implements IStoreAppointmentSlotsService
{
  private _storeAppointmentSlotsRepository: IAppointmentSlotsRepository;

  constructor(storeAppointmentSlotsRepo: IAppointmentSlotsRepository) {
    this._storeAppointmentSlotsRepository = storeAppointmentSlotsRepo;
  }

  createAppointmentSlot = async (
    appointmentData: AppointmentSlotsData
  ): Promise<DbResponse> => {
    try {
      // Validate the request data
      this.validateAppointmentData(appointmentData);

      // Pass the data to the repository
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

  // Validation method
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

  rescheduleAppointment = async (
    rescheduleData: RescheduleAppointmentRequest
  ): Promise<RescheduleAppointmentResponse> => {
    try {
      // Pass the data to the repository
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

  getPrescription = async (
    request: FetchPrescriptionRequest
  ): Promise<FetchPrescriptionResponse> => {
    try {
      // You could add additional business logic here if needed
      return await this._storeAppointmentSlotsRepository.fetchPrescription(
        request
      );
    } catch (error) {
      console.error("Error in service layer:", error);
      throw error;
    }
  };

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
