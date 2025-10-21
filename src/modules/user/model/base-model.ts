export abstract class BaseModel {
    id?: number;

    constructor(id: number) {
        this.id = id;
    }

    abstract validate(): void; 
}