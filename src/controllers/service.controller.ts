import { inject, injectable } from 'inversify';
import { TYPES } from '../types/inversify';
import { Response, Request } from 'express';
import { HttpStatusCode } from '../types/Doctor.interface';
import { IServiceManageMentService } from '../services/interfaces/IService-management.service';
import { SERVICE_MESSAGES } from '../constants/messages.constant';

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
                    ? SERVICE_MESSAGES.CREATE.SUCCESS
                    : SERVICE_MESSAGES.CREATE.FAILED,
            });
        } catch (error) {
            console.error('REST createService error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : SERVICE_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            });
        }
    };

    fetchService = async (req: Request, res: Response): Promise<void> => {
        try {
            const services = await this._serviceManageMent.fetchService();

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: SERVICE_MESSAGES.FETCH.SUCCESS,
                data: services,
            });
        } catch (error) {
            console.error('REST fetchService error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : SERVICE_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
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
                    ? SERVICE_MESSAGES.DELETE.SUCCESS
                    : SERVICE_MESSAGES.DELETE.NOT_FOUND,
            });
        } catch (error) {
            console.error('REST deleteService error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : SERVICE_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
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
                    ? SERVICE_MESSAGES.UPDATE.SUCCESS
                    : SERVICE_MESSAGES.UPDATE.NOT_FOUND,
            });
        } catch (error) {
            console.error('REST editService error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : SERVICE_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            });
        }
    };
}
