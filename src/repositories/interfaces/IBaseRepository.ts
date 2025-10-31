import { FilterQuery } from 'mongoose';

export interface IBaseRepository<T> {
    create(data: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    findByEmail(email: string): Promise<T | null>;
    updateById(id: string, updateData: Partial<T>): Promise<T | null>;
    findOne(email: string): Promise<T | null>;
    find(filter: FilterQuery<T>): Promise<T[]>;
    deleteById(id: string): Promise<T | null>;
}
