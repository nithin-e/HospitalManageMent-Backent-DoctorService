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

@injectable()
export class PrescriptionRepository implements IPriscriptionRepo {
    createPrescription = async (
        prescriptionData: PrescriptionData
    ): Promise<PrescriptionResponse> => {
        try {
            console.log(
                'This is repository layer so check the Prescription data',
                prescriptionData
            );

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
            console.error('Error saving prescription:', error);
            throw error;
        }
    };

    fetchPrescription = async (
        prescriptionData: FetchPrescriptionRequest
    ): Promise<FetchPrescriptionResponse> => {
        try {
            console.log('check da kuttaa it is getting', prescriptionData);

            const prescription = await PrescriptionModel.findOne({
                appointmentId: prescriptionData.appointmentId,
            });

            if (!prescription) {
                throw new Error('Prescription not found');
            }

            const appointment = await AppointmentModel.findById(
                prescriptionData.appointmentId
            );

            if (!appointment) {
                throw new Error('Appointment not found');
            }

            const response: FetchPrescriptionResponse = {
                prescriptionDetails: prescription.prescriptionDetails,
                date: prescription.date.toISOString(),
                time: prescription.time,
                patientEmail: appointment.patientEmail ?? null,
                doctorEmail: appointment.doctorEmail ?? null,
            };

            console.log('Fetched prescription response:', response);
            return response;
        } catch (error) {
            console.error('Error fetching prescription:', error);
            throw error;
        }
    };
}
