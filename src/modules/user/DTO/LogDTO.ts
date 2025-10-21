// //
// import crypto from 'crypto'

// //
// import { ILogInfo } from '../../../types'

// //
// import { CreateLogDto } from '../../../types/create-log';

// //
// import { getLastLogFromElastic } from '../../../config/elasticsearch/elastic-search';



// class LogEntry {
//     private static lastLog: ILogInfo | null;


//     public async generateLog(log: CreateLogDto) {
//         console.log('ABC')

//         LogEntry.lastLog = await getLastLogFromElastic();

//         const logIndex = LogEntry.lastLog ? LogEntry.lastLog.logIndex + 1 : 0;

//         const previousHash = LogEntry.lastLog ? LogEntry.lastLog.digestValue : '0';

//         const partialLog: Omit<ILogInfo, 'digestValue' | 'signature'> = {
//             ...log,
//             logIndex,
//             previousHash
//         }

//         const digestValue = this.generateHash(partialLog);
//         const signature = this.signDigest(digestValue);

//         const newLog: ILogInfo = {
//             ...partialLog,
//             digestValue,
//             signature
//         }
//         return newLog;
//     }


//     private generateHash(data: object) {
//         return crypto.createHash('sha1').update(JSON.stringify(data)).digest('hex');
//     }

//     private signDigest(hash: string) {
//         return crypto.createHmac('sha256', process.env.HMAC_SECRET || 'DEFAULT_SECRET')
//             .update(hash)
//             .digest('hex');
//     }
// }

// export default new LogEntry();


