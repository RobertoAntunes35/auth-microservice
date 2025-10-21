
// 
import { NextFunction, RequestHandler } from 'express'
import {RequestWithUser} from '../../../types'




const logMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void | RequestHandler | Response> => {
    try  {

    } catch(err: any) {
        
    }
}