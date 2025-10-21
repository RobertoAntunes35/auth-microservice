export interface IRepositoryCRUD<T> {
    create(data: T): Promise<T | null>;
    findById(id: string): Promise<T>;
    findByEmail(email: string): Promise<T>;
    update(id: number, data: T): Promise<T | null>;
    delete(id: number): Promise<boolean>;
}