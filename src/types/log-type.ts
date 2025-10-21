export interface ILogEntry {
    timestamp: string,
    service: string,
    level: 'info' | 'warn' | 'error';
    message: string,
    meta?: Record<string, any> 
}

export interface IDetails {
    targetUser: string,
    reason: string
}

export interface ILogInfo {
    logId: string,
    logIndex: number,
    level: string,
    timestamp: string,
    userId: string | number ,
    event: string, 
    details?: IDetails,
    sourceIp: string,
    device: string,
    status: string,
    digestValue: string,
    signature: string,
    previousHash: string
}