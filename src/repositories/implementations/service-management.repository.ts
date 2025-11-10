import { injectable } from 'inversify';
import serviceModel, { IService } from '../../entities/serviceModel';
import { updateData } from '../../types/Doctor.interface';
import { IServiceManageMentRepository } from '../interfaces/IService-management-repository';
import { BaseRepository } from './base.repository';
import { SERVICE_MESSAGES } from '../../constants/messages.constant';

@injectable()
export class ServiceManageMentRepository
    extends BaseRepository<IService>
    implements IServiceManageMentRepository
{
    constructor() {
        super(serviceModel);
    }

    createService = async (
        name: string,
        description: string
    ): Promise<boolean> => {
        try {
            const newService: IService = new serviceModel({
                name,
                description,
            });
            await newService.save();
            return true;
        } catch (error) {
            console.error(SERVICE_MESSAGES.ERROR.CREATE_FAILED, error);
            return false;
        }
    };

    fetchService = async (): Promise<IService[]> => {
        try {
            return await this.find({});
        } catch (error) {
            console.error(SERVICE_MESSAGES.ERROR.FETCH_FAILED, error);
            throw error;
        }
    };

    deleteService = async (serviceId: string): Promise<boolean> => {
        try {
            const deletedService = await this.deleteById(serviceId);

            if (!deletedService) {
                console.warn(
                    `${SERVICE_MESSAGES.DELETE.NOT_FOUND}: ${serviceId}`
                );
                return false;
            }

            return true;
        } catch (error) {
            console.error(SERVICE_MESSAGES.ERROR.DELETE_FAILED, error);
            return false;
        }
    };

    editService = async (
        serviceId: string,
        name?: string,
        description?: string
    ): Promise<boolean> => {
        try {
            const existingService = await serviceModel.findById(serviceId);

            if (!existingService) {
                console.error(
                    `${SERVICE_MESSAGES.UPDATE.NOT_FOUND}: ${serviceId}`
                );
                return false;
            }

            const updateData: updateData = {};

            const updatedService = await serviceModel.findByIdAndUpdate(
                serviceId,
                updateData,
                {
                    new: true,
                    runValidators: true,
                }
            );

            if (!updatedService) {
                console.error(
                    `${SERVICE_MESSAGES.UPDATE.FAILED}: ${serviceId}`
                );
                return false;
            }

            return true;
        } catch (error) {
            console.error(SERVICE_MESSAGES.ERROR.UPDATE_FAILED, error);
            return false;
        }
    };
}
