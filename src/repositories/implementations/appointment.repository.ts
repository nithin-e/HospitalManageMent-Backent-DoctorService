import AppointmentSlot from '../../entities/storeAppointmentSlot_schema';
import AppointmentModel from '../../entities/AppointmentModel';
import { IAppointmentRepository } from '../interfaces/IAppointment.repository';
import {
    AllAppointmentsResponse,
    Appointment,
    appointmentaData,
    AppointmentRequest,
    AppointmentResponse,
    AppointmentUpdateResponse,
    CancelAppointmentRequest,
    CancelAppointmentResponse,
    CancelData,
    Cancelres,
    CancelResponse,
    FilteringResponse,
    IAppointment,
    RescheduleAppointmentRequest,
    RescheduleAppointmentResponse,
    SearchParam,
    UserAppointmentsResponse,
} from '../../types/Doctor.interface';

import mongoose, { FilterQuery, SortOrder } from 'mongoose';
import { injectable } from 'inversify';
import { convertToDbDateFormat } from '../../utility/timeFormatter';

@injectable()
export class AppontMentRepository implements IAppointmentRepository {
    createAppointment = async (
        appointmentData: AppointmentRequest
    ): Promise<AppointmentResponse> => {
        try {
            // Find the specific appointment slot
            const appointmentSlot = await AppointmentSlot.findOne({
                doctorEmail: appointmentData.patientEmail,
                date: appointmentData.appointmentDate,
                time: appointmentData.appointmentTime,
            });

            if (!appointmentSlot) {
                throw new Error('Appointment slot not found');
            }

            if (appointmentSlot.isBooked) {
                throw new Error('This appointment slot is already booked');
            }

            appointmentSlot.isBooked = true;
            appointmentSlot.patientEmail = appointmentData.userEmail;
            appointmentSlot.updatedAt = new Date();
            await appointmentSlot.save();

            const newAppointment = new AppointmentModel({
                patientName: appointmentData.patientName,
                doctorEmail: appointmentData.patientEmail,
                patientPhone: appointmentData.patientPhone,
                appointmentDate: appointmentData.appointmentDate,
                appointmentTime: appointmentData.appointmentTime,
                notes: appointmentData.notes,
                doctorName: appointmentData.doctorName,
                specialty: appointmentData.specialty,
                patientEmail: appointmentData.userEmail,
                doctorId: appointmentData.doctorId,
                userId: appointmentData.userId,
                status: 'scheduled',
                created_at: new Date(),
                amount: '500',
                adminAmount: '150',
                doctorAmount: '350',
                paymentStatus: 'success',
                payment_method: 'online',
                payment_status: 'pending',
            });

            const savedAppointment = await newAppointment.save();

            return {
                id: savedAppointment._id.toString(),
                message: 'Appointment booked successfully',
            };
        } catch (error) {
            console.error('Error storing appointment:', error);
            throw new Error(
                `Failed to store appointment: ${(error as Error).message}`
            );
        }
    };

    fetchUserAppointments = async (
        email: string,
        page: number = 1,
        limit: number = 3
    ): Promise<UserAppointmentsResponse> => {
        try {
            const skip = (page - 1) * limit;

            const query = {
                $or: [
                    { patientEmail: email },
                    {
                        doctorEmail: email,
                        doctorAmount: {
                            $exists: true,
                            $nin: [null, '', 0, undefined],
                        },
                    },
                ],
            };

            const totalAppointments = await AppointmentModel.countDocuments(
                query
            );

            const totalPages = Math.ceil(totalAppointments / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            // Remove the type assertion
            const appointments = await AppointmentModel.find(query)
                .sort({ appointmentDate: -1, appointmentTime: -1 })
                .skip(skip)
                .limit(limit);

            if (!appointments || appointments.length === 0) {
                return {
                    appointments: [],
                    success: true,
                    message:
                        totalAppointments === 0
                            ? 'No appointments found for this email'
                            : `No appointments found for page ${page}`,
                    currentPage: page,
                    totalPages: totalPages,
                    totalAppointments: totalAppointments,
                    limit: limit,
                    hasNextPage: false,
                    hasPrevPage: hasPrevPage,
                };
            }

            // Format appointments
            const formattedAppointments: Appointment[] = appointments.map(
                (appointment) => {
                    const baseAppointment: Appointment = {
                        id: appointment._id?.toString() || appointment.id || '',
                        patientName: appointment.patientName || 'Unknown',
                        doctorEmail: appointment.doctorEmail || '',
                        patientPhone: appointment.patientPhone || '',
                        appointmentDate: appointment.appointmentDate || '',
                        appointmentTime: appointment.appointmentTime || '',
                        notes: appointment.notes || '',
                        doctorName: appointment.doctorName || '',
                        specialty: appointment.specialty || '',
                        patientEmail: appointment.patientEmail || '',
                        status: appointment.status || 'unknown',
                        doctorId: appointment.doctorId || '',
                        userId: appointment.userId || '',
                        userRefoundAmount: appointment.userRefoundAmount,
                        doctorAmount: appointment.doctorAmount || '',
                    };

                    if (appointment.message)
                        baseAppointment.message = appointment.message;
                    if (appointment.Prescription)
                        baseAppointment.Prescription = appointment.Prescription;

                    return baseAppointment;
                }
            );

            return {
                appointments: formattedAppointments,
                success: true,
                message: 'Appointments fetched successfully',
                currentPage: page,
                totalPages: totalPages,
                totalAppointments: totalAppointments,
                limit: limit,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage,
            };
        } catch (error) {
            console.error('Error fetching appointments:', error);
            throw new Error(
                `Failed to fetch appointments: ${(error as Error).message}`
            );
        }
    };

    fetchAllUserAppointments = async (
        email?: string,
        page: number = 1,
        limit: number = 10
    ): Promise<AllAppointmentsResponse> => {
        try {
            const skip = (page - 1) * limit;

            // Build query dynamically: if email is provided, filter by doctorEmail
            const query: any = {};
            if (email && email.trim() !== '') {
                query.doctorEmail = email.trim().toLowerCase();
            }

            console.log('Querying appointments with:', query);

            // Fetch appointments and total count in parallel
            const [appointments, totalAppointments] = await Promise.all([
                AppointmentModel.find(query)
                    .sort({ appointmentDate: 1, appointmentTime: 1 })
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .exec(),
                AppointmentModel.countDocuments(query),
            ]);

            console.log('Appointments fetched:', appointments.length, 'Total matching:', totalAppointments);

            const totalPages = Math.ceil(totalAppointments / limit);

            return {
                appointments: appointments.map((appointment) => ({
                    id: appointment._id?.toString(),
                    patientName: appointment.patientName,
                    doctorEmail: appointment.doctorEmail,
                    patientPhone: appointment.patientPhone,
                    appointmentDate: appointment.appointmentDate,
                    appointmentTime: appointment.appointmentTime,
                    notes: appointment.notes,
                    doctorName: appointment.doctorName,
                    specialty: appointment.specialty,
                    patientEmail: appointment.patientEmail,
                    status: appointment.status,
                    created_at: appointment.created_at,
                    updated_at: appointment.updated_at,
                    message: appointment.message,
                    amount: appointment.amount,
                    adminAmount: appointment.adminAmount,
                    doctorAmount: appointment.doctorAmount,
                    userRefoundAmount: appointment.userRefoundAmount,
                    paymentStatus: appointment.paymentStatus,
                    payment_method: appointment.payment_method,
                    payment_status: appointment.payment_status,
                    doctorId: appointment.doctorId,
                    userId: appointment.userId,
                    Prescription: appointment.Prescription,
                })) as IAppointment[],
                success: true,
                message: 'Appointments fetched successfully',
                currentPage: page,
                totalPages,
                totalAppointments,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            };
        } catch (error) {
            console.error('Error fetching user appointments:', error);
            throw new Error(`Failed to fetch appointments: ${(error as Error).message}`);
        }
    };

    cancelUserAppointment = async (
        appointmentId: CancelAppointmentRequest['appointmentId']
    ): Promise<CancelAppointmentResponse> => {
        try {
            const result = await AppointmentModel.findByIdAndUpdate(
                appointmentId,
                { status: 'cancelled' },
                { new: true }
            );

            if (!result) {
                return {
                    success: false,
                    message: 'Appointment not found',
                };
            }

            return {
                success: true,
                message: 'Appointment cancelled successfully',
            };
        } catch (error) {
            console.error('Error while cancelling appointment:', error);
            throw new Error(
                `Failed to cancel appointment: ${(error as Error).message}`
            );
        }
    };

    /**
     * Reschedules an appointment for a user.
     */
    rescheduleAppointment = async (
        rescheduleData: RescheduleAppointmentRequest
    ): Promise<RescheduleAppointmentResponse> => {
        try {
            const { patientEmail, doctorEmail, originalSlot, newSlot, action } =
                rescheduleData;

            const deleteSlotResult = await AppointmentSlot.findByIdAndDelete(
                originalSlot.id
            );

            if (!deleteSlotResult) {
                throw new Error(
                    'Original slot not found or could not be deleted'
                );
            }

            const userAppointment = await AppointmentModel.findOne({
                patientEmail: patientEmail,
                appointmentTime: originalSlot.time,
                appointmentDate: originalSlot.date,
            });

            if (!userAppointment) {
                throw new Error('User appointment not found');
            }

            const updateResult = await AppointmentModel.findByIdAndUpdate(
                userAppointment._id,
                {
                    $set: {
                        appointmentTime: newSlot.time24,
                        message: `Your appointment has been rescheduled from ${originalSlot.time} to ${newSlot.time12}`,
                        updated_at: new Date(),
                    },
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

            if (!updateResult) {
                throw new Error('Failed to update user appointment');
            }

            let newSlotResult;
            const existingSlot = await AppointmentSlot.findOne({
                doctorEmail: doctorEmail,
                date: originalSlot.date,
                time: newSlot.time24,
            });

            if (existingSlot) {
                newSlotResult = await AppointmentSlot.findByIdAndUpdate(
                    existingSlot._id,
                    {
                        $set: {
                            isBooked: true,
                            patientEmail: patientEmail,
                            updatedAt: new Date(),
                        },
                    },
                    { new: true }
                );
            } else {
                newSlotResult = await AppointmentSlot.create({
                    doctorEmail: doctorEmail,
                    date: originalSlot.date,
                    time: newSlot.time24,
                    isBooked: true,
                    patientEmail: patientEmail,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            return {
                success: true,
                message: 'Appointment rescheduled successfully',
                data: {
                    updatedAppointment: updateResult as mongoose.Document,
                    originalSlotDeleted: deleteSlotResult as mongoose.Document,
                    newSlot: newSlotResult as mongoose.Document,
                    newSlotTime: newSlot.time12,
                },
            };
        } catch (error) {
            console.error('Error in handleAppointmentReschedule:', error);
            return {
                success: false,
                message: 'Failed to reschedule appointment',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    };

    /**
     * Cancels an appointment from user side.
     */
    cancelAppointmentByUser = async (
        cancelData: CancelData
    ): Promise<CancelResponse> => {
        try {
            const { time, date, email } = cancelData;

            if (!time || !date || !email) {
                return {
                    success: false,
                    message: 'Missing required fields: time, date, or email',
                };
            }

            const formattedDate = convertToDbDateFormat(date);

            const appointment = await AppointmentModel.findOne({
                doctorEmail: email,
                appointmentDate: formattedDate,
                appointmentTime: time,
                status: 'scheduled',
            });

            if (!appointment) {
                console.log('Appointment not found with query parameters');

                const debugAppointments = await AppointmentModel.find({
                    doctorName: email,
                });

                return {
                    success: false,
                    message: 'Appointment not found or already cancelled',
                };
            }

            const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
                appointment._id,
                {
                    status: 'cancelled',
                    updated_at: new Date(),
                    adminAmount: '100',
                    userRefoundAmount: '150',
                    doctorAmount: '250',
                },
                { new: true }
            );

            const slotUpdate = await AppointmentSlot.findOneAndUpdate(
                {
                    doctorEmail: appointment.doctorEmail,
                    date: formattedDate,
                    time: time,
                    isBooked: true,
                },
                {
                    isBooked: false,
                    patientEmail: '',
                    updatedAt: new Date(),
                },
                { new: true }
            );

            if (!slotUpdate) {
                console.warn(
                    `Appointment slot not found for doctor: ${appointment.doctorEmail}, date: ${formattedDate}, time: ${time}`
                );

                return {
                    success: true,
                    message:
                        'Appointment cancelled successfully, but slot availability could not be updated',
                };
            }

            return {
                success: true,
                message:
                    'Appointment cancelled successfully and slot is now available',
            };
        } catch (error) {
            console.error('Error in Canceling_AppointMent__UserSide:', error);
            return {
                success: false,
                message: 'Failed to cancel appointment',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    };

    cancelAppointmentByDoctor = async (
        appointmentData: appointmentaData
    ): Promise<Cancelres> => {
        try {

            console.log('bro check the appointment data while the cancel appointment',appointmentData);
            
            const appointment = await AppointmentModel.findOne({
                patientEmail: appointmentData.patientEmail,
                doctorId: appointmentData.doctor_id,
                appointmentDate: appointmentData.date,
                appointmentTime: appointmentData.time,
                status: 'scheduled',
            });

            console.log('check this also aftet the updation', appointment);

            if (!appointment) {
                return {
                    success: false,
                };
            }

            const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
                appointment._id,
                {
                    status: 'cancelled',
                    updated_at: new Date(),
                    adminAmount: '',
                    userRefoundAmount: '500',
                    doctorAmount: '',
                },
                { new: true }
            );

            const slotUpdate = await AppointmentSlot.findOneAndUpdate(
                {
                    doctorEmail: appointment.doctorEmail,
                    date: appointmentData.date,
                    time: appointmentData.time,
                    isBooked: true,
                },
                {
                    isBooked: false,
                    patientEmail: '',
                    updatedAt: new Date(),
                },
                { new: true }
            );

            return {
                success: true,
            };
        } catch (error) {
            console.log(error);
            return {
                success: false,
            };
        }
    };

    async filteringDoctorAppoinments(
        params: SearchParam
    ): Promise<FilteringResponse> {
        try {
            const {
                searchQuery = '',
                sortBy = 'createdAt',
                sortDirection = 'desc',
                page = 1,
                limit = 50,
                role = '',
            } = params;

            const filter: FilterQuery<any> = {};

            if (searchQuery && searchQuery.trim()) {
                const searchRegex = {
                    $regex: searchQuery.trim(),
                    $options: 'i',
                };
                filter.$or = [
                    { patientName: searchRegex },
                    { doctorName: searchRegex },
                    { patientEmail: searchRegex },
                    { doctorEmail: searchRegex },
                    { specialty: searchRegex },
                    { patientPhone: searchRegex },
                ];
            }

            if (role && role.trim()) {
                const roleValue = role.trim().toLowerCase();
                if (roleValue === 'doctor') {
                    filter.doctorEmail = { $exists: true, $ne: null };
                } else if (roleValue === 'patient') {
                    filter.patientEmail = { $exists: true, $ne: null };
                }
            }

            const validSortFields = [
                'created_at',
                'updated_at',
                'appointmentDate',
                'patientName',
                'doctorName',
                'createdAt',
                'updatedAt',
            ];
            let sortField = sortBy;

            if (sortBy === 'createdAt') sortField = 'created_at';
            if (sortBy === 'updatedAt') sortField = 'updated_at';

            if (!validSortFields.includes(sortField)) {
                sortField = 'created_at';
            }

            const sort: { [key: string]: SortOrder } = {};
            sort[sortField] = sortDirection === 'asc' ? 1 : -1;

            const validatedPage = Math.max(1, page);
            const validatedLimit = Math.min(Math.max(1, limit), 100);
            const skip = (validatedPage - 1) * validatedLimit;

            const [appointmentsRaw, totalCount] = await Promise.all([
                AppointmentModel.find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(validatedLimit)
                    .lean()
                    .exec(),
                AppointmentModel.countDocuments(filter).exec(),
            ]);

            const appointments: Appointment[] = appointmentsRaw.map((doc) => ({
                id: doc._id?.toString() || '',
                patientName: doc.patientName || '',
                doctorEmail: doc.doctorEmail || '',
                patientPhone: doc.patientPhone || '',
                appointmentDate: doc.appointmentDate || '',
                appointmentTime: doc.appointmentTime || '',
                notes: doc.notes || '',
                doctorName: doc.doctorName || '',
                specialty: doc.specialty || '',
                patientEmail: doc.patientEmail || '',
                status: doc.status || 'scheduled',
                message: doc.message || '',
                payment_method: doc.payment_method || 'cash',
                paymentStatus: doc.paymentStatus || 'pending',
                amount: doc.amount?.toString() || '0',
                doctorAmount: doc.doctorAmount || '0',
                adminAmount: doc.adminAmount || '0',
                userRefoundAmount: doc.userRefoundAmount || '0',
                userId: doc.userId || '',
                doctorId: doc.doctorId || '',
                Prescription: doc.Prescription || '',
                createdAt: doc.created_at || new Date(),
                updatedAt: doc.updated_at || new Date(),
            }));

            const totalPages = Math.ceil(totalCount / validatedLimit);

            return {
                appointments,
                success: true,
                message: 'Appointments fetched successfully',
                totalCount,
                totalPages,
                currentPage: validatedPage,
            };
        } catch (error) {
            return {
                appointments: [],
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to filter appointments',
                totalCount: 0,
                totalPages: 0,
                currentPage: params.page || 1,
            };
        }
    }

    updateAppointmentAfterConsultation = async (
        appointmentId: string,
        endedBy: string
    ): Promise<AppointmentUpdateResponse> => {
        try {
            // First, fetch the appointment to get the userId
            const appointment = await AppointmentModel.findById(appointmentId);

            if (!appointment) {
                return {
                    success: false,
                    error: 'Appointment not found',
                };
            }

            // Extract userId from the appointment
            const patientEmail = appointment.patientEmail;

            // Only update if ended by doctor
            if (endedBy === 'doctor') {
                const updatedAppointment =
                    await AppointmentModel.findByIdAndUpdate(
                        appointmentId,
                        {
                            status: 'completed',
                        },
                        { new: true }
                    );

                return {
                    success: true,
                    patientEmail: patientEmail?.toString() || '',
                };
            }

            return {
                success: true,
                patientEmail: patientEmail?.toString() || '',
            };
        } catch (error) {
            console.error('Repository error updating appointment:', error);
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Database error occurred',
            };
        }
    };
}
