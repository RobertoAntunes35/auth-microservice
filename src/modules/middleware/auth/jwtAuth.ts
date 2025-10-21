// 
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

// 
import { Response, NextFunction, RequestHandler } from 'express'
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

// 
import { RequestWithUser } from '../../../types';
import { AuthException } from '../../exception/auth-exception';

//
import fs from 'fs'; 

/**
 * 
 * @param token 
 * @param secretKey 
 * @returns 
 */
function verifyToken(token: string, secretKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token, 
            secretKey,
            {algorithms: ['RS256']}, 
            (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded)
        })
    })
}

dotenv.config();

const jwtAuth = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void | RequestHandler | Response> => {
    try {

        const authorization = req.headers.authorization ? req.headers.authorization : req.cookies.token;
        
        if (!authorization) throw new AuthException(`Access token was not informed or is wrong`, StatusCodes.UNAUTHORIZED);

        const [, token] = authorization.split(" ")

        try {
            const PUBLIC_KEY = fs.readFileSync('./keys/public.pem', 'utf-8');
            if (!PUBLIC_KEY) throw new AuthException("PUBLIC_KEY is not defined.", StatusCodes.UNAUTHORIZED);

            const decoded = await verifyToken(token, PUBLIC_KEY) as any;
            console.log(req.authUser)
            req.authUser = decoded.authUser;
            next();

        } catch (err: any) {
            res.status(StatusCodes.UNAUTHORIZED).json({
                status: err.status ? err.status : StatusCodes.INTERNAL_SERVER_ERROR,
                message: err.message ? err.message : ReasonPhrases.INTERNAL_SERVER_ERROR
            });
            return;
        }


    } catch (err: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: err.status ? err.status : StatusCodes.INTERNAL_SERVER_ERROR,
            message: err.message ? err.message : ReasonPhrases.INTERNAL_SERVER_ERROR
        })
    }
}

export default jwtAuth