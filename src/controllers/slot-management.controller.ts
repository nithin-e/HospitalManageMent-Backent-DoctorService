import {
    AppointmentSlotsData,
    HttpStatusCode,
} from '../types/Doctor.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/inversify';
import { Response, Request } from 'express';
import { ISlotmanageMentService } from '../services/interfaces/ISlot-mangement.service';
import { SLOT_MESSAGES } from '../constants/messages.constant';

@injectable()
export class SlotManagementController {
    constructor(
        @inject(TYPES.SlotmanagementService)
        private _sloteManageMentService: ISlotmanageMentService
    ) {}

    fetchAppointmentSlots = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const requestData = req.body;

            const slots =
                await this._sloteManageMentService.fetchAppointmentSlots(
                    requestData
                );

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: SLOT_MESSAGES.FETCH.SUCCESS,
                data: slots,
            });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : SLOT_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            });
        }
    };

    storeAppointmentSlots = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            console.log(req.body);

            const { appointmentSettings } = req.body;

            if (!appointmentSettings) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message:
                        SLOT_MESSAGES.VALIDATION.APPOINTMENT_SETTINGS_REQUIRED,
                });
                return;
            }

            if (!appointmentSettings.doctorEmail) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: SLOT_MESSAGES.VALIDATION.DOCTOR_EMAIL_REQUIRED,
                });
                return;
            }

            if (!appointmentSettings.action) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: SLOT_MESSAGES.VALIDATION.ACTION_REQUIRED,
                });
                return;
            }

            let serviceData: AppointmentSlotsData;

            if (appointmentSettings.action === 'update') {
                // 🔸 Update Mode
                serviceData = {
                    doctor_email: appointmentSettings.doctorEmail,
                    action: 'update',
                    removed_slot_ids: appointmentSettings.removedSlotIds || [],
                    remaining_slots: appointmentSettings.remainingSlots || [],
                    new_time_slots: appointmentSettings.newTimeSlots || [],
                };
            } else if (appointmentSettings.action === 'create') {
                // 🔸 Create Mode
                const timeSlots = appointmentSettings.timeSlots || [];
                serviceData = {
                    doctor_email: appointmentSettings.doctorEmail,
                    action: 'create',
                    date_range: appointmentSettings.dateRange,
                    selected_dates: appointmentSettings.selectedDates,
                    time_slots: timeSlots.map((slot: any) => ({
                        date: slot.date,
                        slots: slot.slots,
                    })),
                    start_time: appointmentSettings.startTime,
                    end_time: appointmentSettings.endTime,
                    slot_duration: appointmentSettings.slotDuration,
                    include_rest_periods:
                        appointmentSettings.includeRestPeriods || false,
                    create_recurring:
                        appointmentSettings.createRecurring || false,
                    recurring_months: appointmentSettings.recurringMonths || 6,
                };
            } else {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: SLOT_MESSAGES.VALIDATION.INVALID_ACTION,
                });
                return;
            }

            const dbResponse =
                await this._sloteManageMentService.createAppointmentSlot(
                    serviceData
                );

            const statusCode = serviceData.action === 'create' ? 201 : 200;

            res.status(statusCode).json({
                success: true,
                result: dbResponse,
            });
        } catch (error) {
            console.error('Error :', error);
        }
    };

    fetchDoctorSlots = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;

            const slots = await this._sloteManageMentService.getDoctorSlots(
                email
            );

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: SLOT_MESSAGES.FETCH.DOCTOR_SLOTS_SUCCESS,
                data: slots,
            });
        } catch (error) {
            console.error('REST fetchDoctorSlots error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : SLOT_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            });
        }
    };
}
