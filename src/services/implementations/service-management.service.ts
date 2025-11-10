import { inject, injectable } from 'inversify';
import { IServiceManageMentService } from '../interfaces/IService-management.service';
import { TYPES } from '../../types/inversify';
import { IService } from '../../entities/serviceModel';
import { SERVICE_MESSAGES } from '../../constants/messages.constant';

@injectable()
export class ServiceManageMentService implements IServiceManageMentService {
    constructor(
        @inject(TYPES.ServiceManageMentRepository)
        private _serviceManageMent: IServiceManageMentService
    ) {}

    createService = async (
        name: string,
        description: string
    ): Promise<boolean> => {
        try {
            const response = await this._serviceManageMent.createService(
                name,
                description
            );

            return response;
        } catch (error) {
            console.error(SERVICE_MESSAGES.ERROR.SERVICE_LAYER_ERROR, error);
            return false;
        }
    };

    fetchService = async (): Promise<IService[]> => {
        try {
            const response = await this._serviceManageMent.fetchService();
            return response;
        } catch (error) {
            console.error(SERVICE_MESSAGES.ERROR.SERVICE_LAYER_ERROR, error);
            throw error;
        }
    };

    deleteService = async (serviceId: string): Promise<boolean> => {
        try {
            const response = await this._serviceManageMent.deleteService(
                serviceId
            );

            return response;
        } catch (error) {
            console.error(SERVICE_MESSAGES.ERROR.SERVICE_LAYER_ERROR, error);
            return false;
        }
    };

    editService = async (
        serviceId: string,
        name?: string,
        description?: string
    ): Promise<boolean> => {
        try {
            const response = await this._serviceManageMent.editService(
                serviceId,
                name,
                description
            );

            return response;
        } catch (error) {
            console.error(SERVICE_MESSAGES.ERROR.SERVICE_LAYER_ERROR, error);
            return false;
        }
    };
}
