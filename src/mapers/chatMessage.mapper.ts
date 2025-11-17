import {
    ChatMessageGrpcRequest,
    ChatMessageGrpcResponse,
    ChatMessageServiceResponse,
    ChatMessageStorageRequest,
    filteringDoctorAppoinmentsRequest,
    filteringDoctorAppoinmentsResponse,
} from '../types/Doctor.interface';

// Mapper
export class ChatMessageMapper {
    static toStorageRequest(
        req: ChatMessageGrpcRequest
    ): ChatMessageStorageRequest {
        return {
            appointmentId: req.appointmentId,
            messageType: req.messageType,
            content: req.content,
            senderType: req.senderType,
            timestamp:
                req.timestamp instanceof Date
                    ? req.timestamp.toISOString()
                    : req.timestamp,
            senderId: req.senderId,
            fileUrl: req.fileUrl || '',
            receverId: req.receverId,
        };
    }

    static toGrpcResponse(
        res: ChatMessageServiceResponse
    ): ChatMessageGrpcResponse {
        return {
            success: res.success,
            message: res.message,
            messageId: res.messageId || '',
            conversationId: res.conversationId || '',
            doctorId: res.doctorId || '',
        };
    }
}

export class FilteringDoctorAppointmentsMapper {
    static toServiceParams(req: filteringDoctorAppoinmentsRequest): {
        searchQuery: string;
        sortBy: string;
        sortDirection: 'asc' | 'desc';
        page: number;
        limit: number;
        role: string;
    } {
        let sortDirection: 'asc' | 'desc' = 'desc';

        if (typeof req.sortDirection === 'string') {
            const direction = req.sortDirection.toLowerCase();
            if (direction === 'asc' || direction === 'desc') {
                sortDirection = direction as 'asc' | 'desc';
            }
        } else if (typeof req.sortDirection === 'number') {
            sortDirection = req.sortDirection >= 0 ? 'asc' : 'desc';
        }

        return {
            searchQuery: req.searchQuery || '',
            sortBy: req.sortBy || 'createdAt',
            sortDirection,
            page: req.page || 1,
            limit: req.limit || 50,
            role: req.role || '',
        };
    }

    static toGrpcResponse(serviceRes: {
        appointments: Array<any>;
        success: boolean;
        message: string;
        totalCount: number;
        totalPages: number;
        currentPage: number;
    }): filteringDoctorAppoinmentsResponse {
        return {
            appointments: serviceRes.appointments.map((appt) => ({
                id: appt.id,
                patientName: appt.patientName,
                doctorEmail: appt.doctorEmail,
                patientPhone: appt.patientPhone,
                appointmentDate: appt.appointmentDate,
                appointmentTime: appt.appointmentTime,
                notes: appt.notes,
                doctorName: appt.doctorName,
                specialty: appt.specialty,
                patientEmail: appt.patientEmail,
                status: appt.status,
                message: appt.message,
                payment_method: appt.payment_method,
                paymentStatus: appt.paymentStatus,
                amount: appt.amount,
                doctorAmount: appt.doctorAmount,
                adminAmount: appt.adminAmount,
                userRefoundAmount: appt.userRefoundAmount || '',
                userId: appt.userId,
                doctorId: appt.doctorId,
                Prescription: appt.Prescription || '',
            })),
            success: serviceRes.success,
            message: serviceRes.message,
            totalCount: serviceRes.totalCount,
            totalPages: serviceRes.totalPages,
            currentPage: serviceRes.currentPage,
        };
    }

    static toGrpcError(message: string): filteringDoctorAppoinmentsResponse {
        return {
            appointments: [],
            success: false,
            message,
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
        };
    }
}
