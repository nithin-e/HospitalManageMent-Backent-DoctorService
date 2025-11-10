import { injectable } from 'inversify';
import AppointmentSlot from '../../entities/storeAppointmentSlot_schema';
import {
    FetchAppointmentSlotsRequest,
    FetchAppointmentSlotsResponse,
    SlotInfo,
    DateSlots,
    AppointmentSlotsData,
    DbResponse,
    AppointmentSlotDocument,
    FetchDoctorSlotsResponse,
    Slot,
    DateTimeSlots,
} from '../../types/Doctor.interface';
import { replicateTimeSlotsForDates } from '../../utility/replicateTimeSlotsForDates';
import { ISlotManagementRepository } from '../interfaces/ISlot-meanagement-repository';
import { generateRecurringDates } from '../../utility/generateRecurringDates';
import { SLOT_MESSAGES } from '../../constants/messages.constant';

@injectable()
export class SloteManagementRepository implements ISlotManagementRepository {
    async fetchDoctorSlots(email: string): Promise<FetchDoctorSlotsResponse> {
        try {
            const doctorSlots: AppointmentSlotDocument[] =
                await AppointmentSlot.find({
                    doctorEmail: email,
                });

            if (!doctorSlots || doctorSlots.length === 0) {
                return {
                    success: false,
                    message: SLOT_MESSAGES.FETCH.NO_SLOTS,
                    slots_created: 0,
                    dates: [],
                    slots: [],
                };
            }

            const uniqueDates = [
                ...new Set(doctorSlots.map((slot) => slot.date)),
            ];

            const formattedSlots: Slot[] = doctorSlots.map((slot) => ({
                id: slot._id.toString(),
                date: slot.date,
                time: slot.time,
                is_booked: slot.isBooked,
                createdAt: slot.createdAt,
                updatedAt: slot.updatedAt,
                ...(slot.patientEmail && { patientEmail: slot.patientEmail }),
            }));

            return {
                success: true,
                message: SLOT_MESSAGES.FETCH.DOCTOR_SLOTS_RETRIEVED,
                slots_created: doctorSlots.length,
                dates: uniqueDates,
                slots: formattedSlots,
            };
        } catch (error) {
            console.error(SLOT_MESSAGES.ERROR.FETCH_FAILED, error);
            throw error;
        }
    }

    fetchAppointmentSlots = async (
        request: FetchAppointmentSlotsRequest
    ): Promise<FetchAppointmentSlotsResponse> => {
        try {
            const appointmentSlots = await AppointmentSlot.find({
                doctorEmail: request.email,
            });

            if (!appointmentSlots || appointmentSlots.length === 0) {
                return {
                    success: false,
                    slots_created: 0,
                    dates: [],
                    time_slots: [],
                };
            }

            interface SlotsByDateType {
                [date: string]: SlotInfo[];
            }

            const slotsByDate: SlotsByDateType = {};

            appointmentSlots.forEach((slot) => {
                if (!slotsByDate[slot.date]) {
                    slotsByDate[slot.date] = [];
                }

                slotsByDate[slot.date].push({
                    id: slot._id.toString(),
                    time: slot.time,
                    is_booked: slot.isBooked,
                });
            });

            const uniqueDates = Object.keys(slotsByDate);
            const timeSlots: DateSlots[] = uniqueDates.map((date) => ({
                date: date,
                slots: slotsByDate[date].map((slot) => ({
                    id: slot.id,
                    time: slot.time,
                    is_booked: slot.is_booked,
                })),
            }));

            return {
                success: true,
                slots_created: appointmentSlots.length,
                dates: uniqueDates,
                time_slots: timeSlots,
            };
        } catch (error) {
            console.error(SLOT_MESSAGES.ERROR.FETCH_FAILED, error);
            throw error;
        }
    };

    createAppointmentSlots = async (
        appointmentData: AppointmentSlotsData
    ): Promise<DbResponse> => {
        try {
            const {
                doctor_email,
                date_range,
                selected_dates = [],
                time_slots = [],
                create_recurring = false,
                recurring_months = 6,
            } = appointmentData;

            let allTimeSlots: DateTimeSlots[] = [...time_slots];
            let allSelectedDates: string[] = [...selected_dates];
            console.log(
                'date_range&&',
                date_range,
                'create_recurring',
                create_recurring
            );

            if (date_range === 'oneWeek' || create_recurring) {
                const recurringDates = generateRecurringDates(
                    selected_dates,
                    recurring_months
                );

                const recurringTimeSlots = replicateTimeSlotsForDates(
                    time_slots,
                    recurringDates
                );

                allTimeSlots = [...time_slots, ...recurringTimeSlots];
                allSelectedDates = [...selected_dates, ...recurringDates];
            }

            const appointmentSlots = [];

            for (const timeSlot of allTimeSlots) {
                const { date, slots } = timeSlot;

                for (const time of slots) {
                    const convertedTime = this.convertTo12HourFormat(time);

                    appointmentSlots.push({
                        doctorEmail: doctor_email,
                        date: date,
                        time: convertedTime,
                        originalTime: time,
                        isBooked: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isRecurring:
                            create_recurring && !selected_dates.includes(date),
                    });
                }
            }

            let insertedCount = 0;

            try {
                const result = await AppointmentSlot.insertMany(
                    appointmentSlots,
                    {
                        ordered: false,
                    }
                );
                insertedCount = result.length;
            } catch (err) {
                console.error(SLOT_MESSAGES.ERROR.INSERT_FAILED, err);
            }

            return {
                success: true,
                message: SLOT_MESSAGES.CREATE.SUCCESS,
                slots_created: insertedCount,
                dates: selected_dates,
                slots_removed: 0,
                slots_updated: 0,
            };
        } catch (error) {
            console.error(SLOT_MESSAGES.ERROR.CREATE_FAILED, error);
            throw error;
        }
    };

    private updateAppointmentSlots = async (
        appointmentData: AppointmentSlotsData
    ): Promise<DbResponse> => {
        try {
            const {
                doctor_email,
                removed_slot_ids = [],
                new_time_slots = [],
            } = appointmentData;

            let removedCount = 0;
            let updatedCount = 0;

            if (removed_slot_ids.length > 0) {
                const deleteResult = await AppointmentSlot.deleteMany({
                    _id: { $in: removed_slot_ids },
                    doctorEmail: doctor_email,
                    isBooked: false,
                });

                removedCount = deleteResult.deletedCount || 0;

                if (removedCount < removed_slot_ids.length) {
                    console.warn(
                        `Only ${removedCount} out of ${removed_slot_ids.length} slots were removed (some may be booked or not found)`
                    );
                }
            }

            if (new_time_slots.length > 0) {
                const newSlots = new_time_slots.map((slot) => ({
                    doctorEmail: doctor_email,
                    date: slot.date,
                    time: slot.time,
                    isBooked: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }));

                try {
                    const insertResult = await AppointmentSlot.insertMany(
                        newSlots,
                        {
                            ordered: false,
                        }
                    );

                    updatedCount = insertResult.length;
                } catch (error: any) {
                    console.error(SLOT_MESSAGES.ERROR.NEW_SLOTS_FAILED, error);

                    if (error.insertedDocs) {
                        updatedCount = error.insertedDocs.length;
                    }
                }
            }

            const allSlots = await AppointmentSlot.distinct('date', {
                doctorEmail: doctor_email,
            });

            const message = `${SLOT_MESSAGES.UPDATE.SUCCESS}. Removed: ${removedCount}, Added: ${updatedCount}`;

            return {
                success: true,
                message: message,
                slots_created: 0,
                slots_removed: removedCount,
                slots_updated: updatedCount,
                dates: allSlots.sort(),
            };
        } catch (error) {
            console.error(SLOT_MESSAGES.ERROR.UPDATE_FAILED, error);
            throw error;
        }
    };

    storeAppointmentSlots = async (
        appointmentData: AppointmentSlotsData
    ): Promise<DbResponse> => {
        try {
            const { action } = appointmentData;

            if (action === 'update') {
                return await this.updateAppointmentSlots(appointmentData);
            } else {
                return await this.createAppointmentSlots(appointmentData);
            }
        } catch (error) {
            console.error(SLOT_MESSAGES.ERROR.STORE_FAILED, error);
            throw error;
        }
    };

    private convertTo12HourFormat = (time: string): string => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };
}
