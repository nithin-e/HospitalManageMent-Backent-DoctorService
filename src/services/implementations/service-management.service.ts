import { inject, injectable } from 'inversify';
import { IServiceManageMentService } from '../interfaces/IService-management.service';
import { TYPES } from '../../types/inversify';
import { IService } from '../../entities/serviceModel';

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
            console.error('Error creating service:', error);
            return false;
        }
    };

    fetchService = async (): Promise<IService[]> => {
        try {
            const response = await this._serviceManageMent.fetchService();
            return response;
        } catch (error) {
            console.error('Error fetching service:', error);
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
            console.error('Error creating service:', error);
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
            console.error('Error creating service:', error);
            return false;
        }
    };
}
