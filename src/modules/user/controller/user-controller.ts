
import { Response } from 'express';


import { RequestWithUser } from '../../../types';
import UserService from '../service/user-service'


class UserController {
    
    /**
     * 
     * @param req 
     * @param res 
     */
    public async findByEmail(req: RequestWithUser, res: Response): Promise<void> {
        const user = await UserService.findByEmail(req);
        res.status(user.status).json(user);
    }


    /**
     * 
     * @param req 
     * @param res 
     */
    public async login(req: RequestWithUser, res: Response): Promise<void> {
        let response = await UserService.login(req);

        res.cookie('refreshToken', response.refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
        }).status(response.status).json(response);
    }

    /**
     * 
     * @param req 
     * @param res 
     */
    public async logout(req: RequestWithUser, res: Response): Promise<void> {
        let response = await UserService.logout(req);

        res.status(response.status).json(response);
    }

    /**
     * 
     * @param req 
     * @param res 
     */
    public async refreshToken(req: RequestWithUser, res: Response): Promise<void> {

        let response = await UserService.refreshToken(req);

        res.cookie('refreshToken', response.refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: true
        }).json(response)
    }

    public async login2FA(req: RequestWithUser, res: Response): Promise<void> {

        let response = await UserService.loginAccessToken(req);

        res.cookie('refreshToken', response.refreshToken, {
            httpOnly: true, 
            sameSite: 'strict',
            secure: true
        }).status(response.status).json(response);
    }
}

export default new UserController();
