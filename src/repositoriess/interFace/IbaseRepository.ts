export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findByEmail(email: string): Promise<T | null>;
  findById(id: string): Promise<T | null>;
  updateById(id: string, updateData: Partial<T>): Promise<T | null>;
  
}