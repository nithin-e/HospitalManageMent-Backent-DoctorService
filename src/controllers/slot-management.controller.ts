import { AppointmentSlotsData, HttpStatusCode } from '../types/Doctor.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/inversify';
import { Response, Request } from 'express';
import { ISlotmanageMentService } from '../services/interfaces/ISlot-mangement.service';

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
                message: 'Appointment slots fetched successfully',
                data: slots,
            });
        } catch (error) {
            console.error('REST fetchAppointmentSlots error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error while fetching appointment slots',
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
                    message: 'Appointment settings are required',
                });
                return;
            }

            if (!appointmentSettings.doctorEmail) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: 'Doctor email is required',
                });
                return;
            }

            if (!appointmentSettings.action) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: 'Action (create/update) is required',
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
                    message: "Invalid action. Must be 'create' or 'update'",
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
            console.error('Error in storeAppointmentSlots:', error);
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
                message: 'Doctor slots fetched successfully',
                data: slots,
            });
        } catch (error) {
            console.error('REST fetchDoctorSlots error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error while fetching doctor slots',
            });
        }
    };
}
