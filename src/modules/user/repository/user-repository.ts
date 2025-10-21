import { StatusCodes } from 'http-status-codes';

import { IRepositoryCRUD } from '../interfaces/repository-interface';
import { UserModel } from '../model/user-model'
import { UserDTO } from '../DTO/User'
import { UserException } from '../../exception/user-excepetion';

class UserRepository implements IRepositoryCRUD<UserDTO> {

    async findById(id: string|number): Promise<UserModel> {
        try {
            let user = await UserModel.findOne({ where: { id } })

            if (!user) throw new UserException(`User not found with ID ${id}`, StatusCodes.NOT_FOUND)

            return user;
        } catch (err: any) {
            throw new UserException(err.message, err.status)
        }
    }

    async findByEmail(email: string): Promise<UserModel> {
        try {
            let user = await UserModel.findOne({ where: { email } });
            
            if (!user) throw new UserException(`User not found with e-mail '${email}'`, StatusCodes.NOT_FOUND);
            
            return user;

        } catch (err: any) {
            throw new UserException(err.message, err.status);
        }
    }

    async create(data: UserDTO): Promise<UserModel | null> {
        return null;
    }

    async update(id: number, data: UserDTO): Promise<UserModel | null> {
        return null;
    }

    async delete(id: number): Promise<boolean> {
        return true;
    }
}

export default new UserRepository();

