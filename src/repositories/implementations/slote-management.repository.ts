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
} from '../../types/Doctor.interface';
import { generateRecurringDates } from '../../utility/generateRecurringDates';
import { replicateTimeSlotsForDates } from '../../utility/replicateTimeSlotsForDates';
import { convertTo12HourFormat } from '../../utility/timeFormatter';
import { ISlotManagementRepository } from '../interfaces/ISloteManageMentRepository';

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
                    message: 'No appointment slots found for this doctor',
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
                message: 'Doctor appointment slots retrieved successfully',
                slots_created: doctorSlots.length,
                dates: uniqueDates,
                slots: formattedSlots,
            };
        } catch (error) {
            console.error('Error fetching doctor slots:', error);
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
            console.error('Error fetching doctor slots:', error);
            throw error;
        }
    };

    createAppointmentSlots = async (appointmentData: AppointmentSlotsData) => {
        try {
            const {
                doctor_email,
                date_range,
                selected_dates,
                time_slots,
                create_recurring = false,
                recurring_months = 6,
            } = appointmentData;

            let allTimeSlots = [...time_slots];
            let allSelectedDates = [...selected_dates];

            if (date_range === 'oneWeek') {
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
                    const convertedTime = convertTo12HourFormat(time);

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
                console.error('Error inserting appointment slots:', err);
            }

            return {
                success: true,
                message: 'Appointment slots created successfully',
                slots_created: insertedCount,
                dates: selected_dates,
                slots_removed: 0,
                slots_updated: 0,
            };
        } catch (error) {
            console.error('Error in createAppointmentSlots:', error);
            throw error;
        }
    };

    updateAppointmentSlots = async (appointmentData: any) => {
        try {
            const { doctor_email, removed_slot_ids, new_time_slots } =
                appointmentData;

            let removedCount = 0;
            let updatedCount = 0;
            const datesAffected = new Set<string>();

            if (removed_slot_ids && removed_slot_ids.length > 0) {
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

            if (new_time_slots && new_time_slots.length > 0) {
                const newSlots = new_time_slots.map((slot: any) => ({
                    doctorEmail: doctor_email,
                    date: slot.date,
                    time: slot.time,
                    isBooked: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }));

                try {
                    // Insert multiple documents at once
                    const insertResult = await AppointmentSlot.insertMany(
                        newSlots,
                        {
                            ordered: false,
                        }
                    );

                    updatedCount += insertResult.length;

                    // Track affected dates
                    for (const slot of newSlots) {
                        datesAffected.add(slot.date);
                    }
                } catch (error) {
                    console.error('Error creating appointment slots:', error);
                    throw error;
                }
            }

            const allSlots = await AppointmentSlot.find(
                { doctorEmail: doctor_email },
                { date: 1, _id: 0 }
            ).distinct('date');

            return {
                success: true,
                message: `Appointment slots updated successfully. Removed: ${removedCount}, Updated: ${updatedCount}`,
                slots_created: 0,
                slots_removed: removedCount,
                slots_updated: updatedCount,
                dates: allSlots.sort(),
            };
        } catch (error) {
            console.error('Error in updateAppointmentSlots:', error);
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
            console.error('Error in appointment slots repository:', error);
            throw error;
        }
    };
}
