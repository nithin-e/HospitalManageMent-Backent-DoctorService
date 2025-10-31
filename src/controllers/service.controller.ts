import { inject, injectable } from 'inversify';
import { TYPES } from '../types/inversify';
import { Response, Request } from 'express';
import { HttpStatusCode } from '../types/Doctor.interface';
import {IServiceManageMentService} from '../services/interfaces/IService-management.service';

@injectable()
export class ServiceController {
    constructor(
        @inject(TYPES.ServiceManageMentService)
        private _serviceManageMent: IServiceManageMentService
    ) {}

    createService = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, description } = req.body;

            const success = await this._serviceManageMent.createService(
                name,
                description
            );

            res.status(HttpStatusCode.CREATED).json({
                success: success,
                message: success
                    ? 'Service created successfully'
                    : 'Failed to create service',
            });
        } catch (error) {
            console.error('REST createService error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error',
            });
        }
    };

    fetchService = async (req: Request, res: Response): Promise<void> => {
        try {
            const services = await this._serviceManageMent.fetchService();

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: 'Services fetched successfully',
                data: services,
            });
        } catch (error) {
            console.error('REST fetchService error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error while fetching services',
            });
        }
    };

    deleteService = async (req: Request, res: Response): Promise<void> => {
        try {
            const { serviceId } = req.params;

            const success = await this._serviceManageMent.deleteService(
                serviceId
            );

            res.status(HttpStatusCode.OK).json({
                success,
                message: success
                    ? 'Service deleted successfully'
                    : 'Failed to delete service',
            });
        } catch (error) {
            console.error('REST deleteService error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error while deleting service',
            });
        }
    };

    editService = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, description } = req.body;
            const { serviceId } = req.params;

            const success = await this._serviceManageMent.editService(
                serviceId,
                name,
                description
            );

            res.status(HttpStatusCode.OK).json({
                success,
                message: success
                    ? 'Service updated successfully'
                    : 'Failed to update service',
            });
        } catch (error) {
            console.error('REST editService error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error while updating service',
            });
        }
    };
}
