import * as grpc from '@grpc/grpc-js';
import {
    CreateServiceRequest,
    CreateServiceResponse,
    FetchServiceRequest,
    FetchServiceResponse,
    DeleteServiceRequest,
    EditServiceRequest,
} from '../types/Doctor.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/inversify';
import { IServiceManageMentRepository } from '../repositories/interfaces/IService-managementRepository';

@injectable()
export class ServiceController {
    constructor(
        @inject(TYPES.ServiceManageMentService)
        private _serviceManageMent: IServiceManageMentRepository
    ) {}

    createService = async (
        call: { request: CreateServiceRequest },
        callback: (
            error: grpc.ServiceError | null,
            response?: CreateServiceResponse
        ) => void
    ) => {
        try {
            const { name, description } = call.request;

            const success = await this._serviceManageMent.createService(
                name,
                description
            );

            const response: CreateServiceResponse = { success };

            callback(null, response);
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: (error as Error).message,
            };
        }
    };

    fetchService = async (
        call: grpc.ServerUnaryCall<FetchServiceRequest, FetchServiceResponse>,
        callback: grpc.sendUnaryData<FetchServiceResponse>
    ) => {
        try {
            const services = await this._serviceManageMent.fetchService();

            const response: FetchServiceResponse = {
                services: services,
                success: true,
                message: 'Services fetched successfully',
            };

            // Send successful response
            callback(null, response);
        } catch (error) {
            console.error('Error fetching services:', error);

            // Create gRPC error
            const grpcError = {
                name: 'ServiceError',
                message: (error as Error).message || 'Failed to fetch services',
                code: grpc.status.INTERNAL,
                details: 'Internal server error while fetching services',
            };

            // Send error response
            // callback(grpcError, null);
        }
    };

    deleteService = async (
        call: { request: DeleteServiceRequest },
        callback: (
            error: grpc.ServiceError | null,
            response?: CreateServiceResponse
        ) => void
    ) => {
        try {
            const { serviceId } = call.request;

            const result = await this._serviceManageMent.deleteService(
                serviceId
            );

            const response: CreateServiceResponse = {
                success: result,
            };

            callback(null, response);
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: (error as Error).message,
            };
        }
    };

    editService = async (
        call: { request: EditServiceRequest },
        callback: (
            error: grpc.ServiceError | null,
            response?: CreateServiceResponse
        ) => void
    ) => {
        try {
            const { serviceId, name, description } = call.request;

            const result = await this._serviceManageMent.editService(
                serviceId,
                name,
                description
            );

            const response: CreateServiceResponse = {
                success: result,
            };

            callback(null, response);
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: (error as Error).message,
            };
        }
    };
}
