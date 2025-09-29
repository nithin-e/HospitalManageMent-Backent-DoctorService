import { IService } from "../../entities/serviceModel";

export interface IServiceManageMentRepository{
  createService(name: string, description: string): Promise<boolean>;
  fetchService(): Promise<IService[]>;
  deleteService(serviceId: string): Promise<boolean>;
  editService(
    serviceId: string,
    name?: string,
    description?: string
  ): Promise<boolean>;
}