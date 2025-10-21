import { IDetails } from "./log-type";

export interface CreateLogDto {
    logId: string,
    level: string,
    timestamp: string,
    userId: string | number ,
    event: string, 
    details?: IDetails,
    sourceIp: string,
    device: string,
    status: string,
}