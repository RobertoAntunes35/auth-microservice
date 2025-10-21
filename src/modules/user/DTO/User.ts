import { BaseModel } from '../model/base-model'

export class UserDTO extends BaseModel {
    name: string
    email: string 
    password: string 

    constructor(id: number, name: string , email: string, password: string) {
        super(id)
        this.name = name;
        this.email = email;
        this.password = password;
    }

    validate(): void {
        if (!this.name || !this.email || this.password) {
            throw new Error('Campos obrigatórios não preenchidos')
        }
    }
}