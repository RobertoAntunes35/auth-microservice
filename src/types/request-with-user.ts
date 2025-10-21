import { Request } from 'express';
import { UserPayload } from '../config/interface/user-payload';

export interface RequestWithUser extends Request {
    authUser?:UserPayload;
}