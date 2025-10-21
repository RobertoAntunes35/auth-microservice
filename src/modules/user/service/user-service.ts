// 
import qrcode from 'qrcode'
import bcrypt from 'bcryptjs'

// 
import jwt from 'jsonwebtoken'

// 
import dotenv from 'dotenv'

// 
import speakeasy from 'speakeasy'

// 
import RedisRepository from '../repository/redis-repository';
import UserRepository from '../repository/user-repository'

// 
import { RedisException } from '../../exception/redis-exception';
import { UserException } from '../../exception/user-excepetion';
import { AuthException } from '../../exception/auth-exception';

// 
import { IResponse, IResponseLogout, IUserError, RequestWithUser, IUserResponse, ILogInfo } from '../../../types';
import { UserModel } from '../model/user-model'
import { UserPayload } from '../../../config/interface/user-payload';

// 
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import emailService from './email-service'

// 
import { REDIS } from '../../../config/const/index'

// 
import { logEntry, rabbitmq } from '../../../app'

// 
import {v4 as uuidv4} from 'uuid'
import { RoutingKeyTypes } from 'shared-lib'

// 
import fs from 'fs';


class UserService {

    constructor() {
        dotenv.config()
    }


    private generate2FACode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    /**
     * 
     * @param req 
     */
    public async get2FACode(req: RequestWithUser): Promise<void> {
        const secret = speakeasy.generateSecret({ length: 20 });
        console.log(secret.base32);

        qrcode.toDataURL(secret.otpauth_url!, (err, image_url) => {
            console.log(image_url);  // Você pode enviar essa URL para ser exibida no front-end
        });
    }

    /**
     * 
     * @param req 
     * @returns 
     */
    public async login(req: RequestWithUser): Promise<IResponse> {
        try {
            const { email, password } = req.body;
            console.log('CEHGOU AQUI')

            const randomId = uuidv4()
            const log:ILogInfo = await logEntry.generateLog({
                logId: randomId,
                timestamp: new Date().toISOString(),
                device:'auth-service',
                event: 'solicitado autenticacao',
                level: 'info',
                sourceIp: '127.0.0.1',
                status: 'successfully',
                userId: email,
                details: {
                    reason: "N/A",
                    targetUser: "N/A"
                }
            });

            await rabbitmq.sendLog(log, RoutingKeyTypes.INFO);

            this.validadeDataEmail(email);

            let user = await UserRepository.findByEmail(email);
            await this.validatePassword(password, user.password);

            let tokenToFind2FA = this.generateRefreshToken(user.id)

            let generateToken2fa = `${REDIS.REDIS_2FA}:${tokenToFind2FA}`
            await RedisRepository.generate2faToken(generateToken2fa, this.generate2FACode());

            let token2fa = await RedisRepository.getTokenInRedis(generateToken2fa);

            let envio_email = await emailService.sendEmail(user, token2fa);

            return {
                status: envio_email.status,
                message: envio_email.message,
                accessToken: tokenToFind2FA
            }

        } catch (err: any) {
            return {
                status: err.status ? err.status : StatusCodes.INTERNAL_SERVER_ERROR,
                message: err.message ? err.message : ReasonPhrases.INTERNAL_SERVER_ERROR,
            }
        }
    }

    /**
     * 
     * @param req 
     * @returns 
     */
    public async loginAccessToken(req: RequestWithUser): Promise<IResponse> {
        try {

            const { token, code } = req.body;
            const redisKey = `${REDIS.REDIS_2FA}:${token}`;

            const storedToken = await RedisRepository.getTokenInRedis(redisKey);

            if (!storedToken) throw new AuthException("Código expirado ou não encontrado.", StatusCodes.UNAUTHORIZED);

            if (storedToken !== code) throw new AuthException("Código 2FA Invalido.", StatusCodes.UNAUTHORIZED);

            const decoded = this.verifyRefreshToken(token);
            let user = await UserRepository.findById(decoded.userId);
            this.validadeDataUser(user);
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user.id);
            await RedisRepository.setTokenInRedis(user.id, refreshToken);

            return {
                status: StatusCodes.OK,
                message: ReasonPhrases.ACCEPTED,
                accessToken: accessToken,
                refreshToken: refreshToken
            }

        } catch (err: any) {
            return {
                status: err.status ? err.status : StatusCodes.INTERNAL_SERVER_ERROR,
                message: err.message ? err.message : ReasonPhrases.INTERNAL_SERVER_ERROR,
                accessToken: '',
                refreshToken: ''
            }
        }
    }


    /**
     * 
     * @param req 
     * @returns 
     */
    public async findByEmail(req: RequestWithUser): Promise<IUserResponse | IUserError> {
        try {

            const { email } = req.params;

            const authUser = req.authUser

            console.log(`AUTHUSER: ${authUser}`)

            let user = await UserRepository.findByEmail(email);

            this.validadeDataUser(user);

            this.validadeDataEmail(email);

            this.validadeAuthUser(user, authUser);

            return {
                status: StatusCodes.OK,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            }

        } catch (err: any) {
            return {
                status: err.status ? err.status : StatusCodes.BAD_REQUEST,
                message: err.message ? err.message : ReasonPhrases.BAD_REQUEST
            }
        }
    }


    /**
     * 
     * @param req 
     * @returns 
     */
    public async refreshToken(req: RequestWithUser): Promise<IResponse> {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                throw new AuthException('No refresh token', StatusCodes.UNAUTHORIZED);
            }

            const { userId } = this.verifyRefreshToken(refreshToken);
            const userIDSearch = `${REDIS.REDIS_REFRESH}:${userId}`

            const storedToken = await RedisRepository.getTokenInRedis(userIDSearch);
            if (!storedToken || storedToken !== refreshToken) throw new AuthException('Invalid refresh token', StatusCodes.UNAUTHORIZED);

            let user = await UserRepository.findById(userId);
            this.validadeDataUser(user);

            const newAccessToken = this.generateAccessToken(user);

            return {
                status: StatusCodes.OK,
                message: ReasonPhrases.ACCEPTED,
                accessToken: newAccessToken,
            }
        } catch (err: any) {
            return {
                status: err.status ? err.status : StatusCodes.INTERNAL_SERVER_ERROR,
                message: err.message ? err.message : ReasonPhrases.INTERNAL_SERVER_ERROR,
            }
        }
    }


    /**
     * 
     * @param req 
     * @returns 
     */
    public async logout(req: RequestWithUser): Promise<IResponseLogout> {
        try {
            const refreshToken = req.cookies.refreshToken;
            const authUser = req.authUser;

            console.log(refreshToken)

            if (!authUser) {
                throw new AuthException('Invalid authUser', StatusCodes.UNAUTHORIZED);
            }

            let searchTokenRedis = `${REDIS.REDIS_REFRESH}:${authUser.id}`;

            const storedToken = await RedisRepository.getTokenInRedis(searchTokenRedis);
            if (!storedToken || storedToken !== refreshToken) {
                throw new AuthException('Invalid refresh token', StatusCodes.UNAUTHORIZED);
            }

            let user = await UserRepository.findById(authUser.id);
            this.validadeDataUser(user);

            let stringSearchUser = `${REDIS.REDIS_REFRESH}:${user.id}`;

            let userDeleted = await RedisRepository.deleteTokenInRedis(stringSearchUser);
            if (!userDeleted) {
                throw new RedisException("Erro ao deletar token do redis", StatusCodes.FORBIDDEN);
            }

            return {
                status: StatusCodes.OK,
                message: 'Logoff make with success',
            }
        } catch (err: any) {
            return {
                status: err.status ? err.status : StatusCodes.INTERNAL_SERVER_ERROR,
                message: err.message ? err.message : ReasonPhrases.INTERNAL_SERVER_ERROR,
            }
        }

    }

    /**
     * 
     * @param token 
     * @returns 
     */
    private verifyRefreshToken(token: string): { userId: string } {
        const PUBLIC_KEY = fs.readFileSync('./keys/public.pem', 'utf-8');
        this.validateSecretKey(PUBLIC_KEY);
        const decoded = jwt.verify(token, PUBLIC_KEY, {algorithms: ['RS256']}) as { userId: string }
        return decoded;
    }


    /**
     * 
     * @param userId 
     * @returns 
     */
    private generateRefreshToken(userId: number | string): string {
        const PRIVATE_KEY = fs.readFileSync('./keys/private.pem', 'utf-8');
        console.log('AQUIIIII', PRIVATE_KEY);
        this.validateSecretKey(PRIVATE_KEY);
        return jwt.sign({ userId }, PRIVATE_KEY, {algorithm: 'RS256', expiresIn: "15min"});
    }

    /**
     * 
     * @param user 
     * @returns 
     */
    private generateAccessToken(user: UserPayload): string {
        try {
            let authUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                roule: user.roule
            }
            console.log('AQUI');
            // SECRET_KEY ira sair, para utilizar criptografia assimetrica
            const PRIVATE_KEY = fs.readFileSync('./keys/private.pem', 'utf-8');
            this.validateSecretKey(PRIVATE_KEY);

            return jwt.sign({authUser}, PRIVATE_KEY, {algorithm: 'RS256', expiresIn: "15min"});
        } catch (err: any) {
            throw new UserException('Error to generate accessToken.', StatusCodes.BAD_REQUEST);
        }
    }

    /**
     * Validações de dados
     */
    private validadeDataEmail(email: string) {
        if (!email) throw new AuthException('E-mail not provided.', StatusCodes.BAD_REQUEST)
    }

    private validadeDataUser(user: UserModel) {
        if (!user) throw new AuthException('User not found.', StatusCodes.NOT_FOUND);
    }

    private validadeAuthUser(user: UserModel, authUser: UserPayload | undefined) {
        if (!authUser || user.id !== authUser.id) throw new AuthException("Error to auth user.", StatusCodes.UNAUTHORIZED);
    }

    private validateDataAccessToken(email: string, password: string) {
        if (!email || !password) throw new AuthException("E-mail and password are required.", StatusCodes.UNAUTHORIZED);
    }

    private async validatePassword(password: string, userPassword: string) {
        if (!await bcrypt.compare(password, userPassword)) throw new AuthException("Password doens't match", StatusCodes.UNAUTHORIZED);
    }

    private validateSecretKey(secretKey?: string) {
        if (!secretKey) throw new AuthException("SECRET_KEY is not defined in environment variables.", StatusCodes.UNAUTHORIZED);
    }




}

export default new UserService(); 