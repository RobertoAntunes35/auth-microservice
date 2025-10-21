// 
import { StatusCodes } from "http-status-codes";

// 
import { RedisException } from "../../exception/redis-exception";
import redisClient from "../../../config/database/configRedis"



class RedisRepository {

    /**
     * 
     * @param userId 
     * @param token 
     * @returns 
     */
    async setTokenInRedis(search: number|string, token: string): Promise<boolean> {
        try {

            const timeEx = 7 * 24 * 60 * 60

            console.log('SEARCH: ', search);
            console.log('TOKEN: ', token);

            const insert = await redisClient.setEx(`refresh:${search}`, timeEx, token);
            if (!insert) throw new RedisException('Failed to insert token in redis', StatusCodes.BAD_REQUEST);
            return true;

        } catch (err: any) {
            let message = err.message ? err.message : "Can't to insert token in redis.";;
            let status = err.status ? err.status : StatusCodes.BAD_REQUEST;
            throw new RedisException(message, status);
        }
    }
    /**
     * 
     * @param userId 
     * @param token 
     * @returns 
     */
    async generate2faToken(search: string, token: string): Promise<boolean> {
        try {
            const timeEx = 10 * 60; // sec
            const generate = await redisClient.setEx(search, timeEx, token)
            if (!generate) throw new RedisException('Failed to insert 2fa token in redis', StatusCodes.BAD_REQUEST);
            return true; 
        } catch (err: any) {
            let message = err.message ? err.message : "Can't to generate 2fa token in redis.";;
            let status = err.status ? err.status : StatusCodes.BAD_REQUEST;
            throw new RedisException(message, status);
        }

    }

    /**
     * 
     * @param userId 
     * @returns 
     */
    async getTokenInRedis(search: string): Promise<string> {
        try {


            console.log("TOKEN: ", search);
            const storedToken = await redisClient.get(search);
            if (!storedToken) throw new RedisException('Stored token not found.', StatusCodes.NOT_FOUND);
            return storedToken;
        } catch (err: any) {
            let message = err.message ? err.message : "Can't to insert token in redis.";;
            let status = err.status ? err.status : StatusCodes.BAD_REQUEST;
            throw new RedisException(message, status);
        }
    }

    /**
     * 
     * @param userId 
     * @returns 
     */
    async deleteTokenInRedis(search: string):Promise<boolean> {
        try {
            const deleteToken = await redisClient.del(search);
            if (!deleteToken) throw new RedisException('Stored token not found.', StatusCodes.NOT_FOUND);
            return true;
        } catch (err: any) {
            let message = err.message ? err.message : "Can't to insert token in redis.";;
            let status = err.status ? err.status : StatusCodes.BAD_REQUEST;
            throw new RedisException(message, status);
        }
    }

    

}

export default new RedisRepository();

