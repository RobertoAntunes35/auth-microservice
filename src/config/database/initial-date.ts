import bcrypt from 'bcryptjs';
import {UserModel} from '../../modules/user/model/user-model';
import { DatabaseException } from '../../modules/exception/database-exception';
import speakeasy from 'speakeasy'



export async function createInitialDate() {
    try {
        await UserModel.sync({force: true});

        let password = await bcrypt.hash('123456', 10)
        let createdAt = new Date()
        let updatedAt = new Date()
        
        console.log(password)
        
        await UserModel.create({
            name: "Roberto Antunes",
            email: "roh.antunes35@gmail.com",
            password: password,
            roule: 'root',
            createdAt: createdAt,
            updatedAt: updatedAt
        })
    } catch (err: any) {
        console.error(err.message)
    }
}
    