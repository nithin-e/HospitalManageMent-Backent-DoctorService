import { injectable } from 'inversify';
import AppointmentModel from '../../entities/AppointmentModel';
import PrescriptionModel from '../../entities/PrescriptionModel';
import {
    PrescriptionData,
    PrescriptionResponse,
    FetchPrescriptionRequest,
    FetchPrescriptionResponse,
} from '../../types/Doctor.interface';
import { IPriscriptionRepo } from '../interfaces/IPriscription.repository';
import { PRESCRIPTION_MESSAGES } from '../../constants/messages.constant';

@injectable()
export class PrescriptionRepository implements IPriscriptionRepo {
    createPrescription = async (
        prescriptionData: PrescriptionData
    ): Promise<PrescriptionResponse> => {
        try {
            const newPrescription = new PrescriptionModel({
                doctorId: prescriptionData.doctorId,
                patientId: prescriptionData.patientId,
                appointmentId: prescriptionData.appointmentId,
                prescriptionDetails: prescriptionData.prescriptionDetails,
                time: prescriptionData.time,
                date: prescriptionData.date || new Date(),
            });

            await newPrescription.save();

            await AppointmentModel.findByIdAndUpdate(
                prescriptionData.appointmentId,
                { Prescription: 'done' },
                { new: true }
            );

            return {
                success: true,
            };
        } catch (error) {
            console.error(PRESCRIPTION_MESSAGES.ERROR.SAVE_FAILED, error);
            throw error;
        }
    };

    fetchPrescription = async (
        prescriptionData: FetchPrescriptionRequest
    ): Promise<FetchPrescriptionResponse> => {
        try {
            const prescription = await PrescriptionModel.findOne({
                appointmentId: prescriptionData.appointmentId,
            });

            if (!prescription) {
                throw new Error(PRESCRIPTION_MESSAGES.FETCH.NOT_FOUND);
            }

            const appointment = await AppointmentModel.findById(
                prescriptionData.appointmentId
            );

            if (!appointment) {
                throw new Error(
                    PRESCRIPTION_MESSAGES.FETCH.APPOINTMENT_NOT_FOUND
                );
            }

            const response: FetchPrescriptionResponse = {
                prescriptionDetails: prescription.prescriptionDetails,
                date: prescription.date.toISOString(),
                time: prescription.time,
                patientEmail: appointment.patientEmail ?? null,
                doctorEmail: appointment.doctorEmail ?? null,
            };

            return response;
        } catch (error) {
            console.error(PRESCRIPTION_MESSAGES.FETCH.FAILED, error);
            throw error;
        }
    };
}
