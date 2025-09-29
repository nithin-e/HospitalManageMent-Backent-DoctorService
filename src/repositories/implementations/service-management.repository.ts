import { injectable } from 'inversify';
import serviceModel, { IService } from '../../entities/serviceModel';
import { updateData } from '../../types/Doctor.interface';
import { IServiceManageMentRepository } from '../interfaces/IService-managementRepository';
import { BaseRepository } from './base.repository';

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
            console.error('Error creating service in repository:', error);
            return false;
        }
    };

    fetchService = async (): Promise<IService[]> => {
        try {
            return await this.find({});
        } catch (error) {
            console.error('Error fetching services from repository:', error);
            throw error;
        }
    };

    deleteService = async (serviceId: string): Promise<boolean> => {
        try {
            const deletedService = await this.deleteById(serviceId);

            if (!deletedService) {
                console.warn('Service not found:', serviceId);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error deleting service in repository:', error);
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
                console.error('Service not found with ID:', serviceId);
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
                console.error('Failed to update service');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error editing service in repository:', error);
            return false;
        }
    };
}
