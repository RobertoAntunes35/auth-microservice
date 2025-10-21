
//
import express, { Request, Response } from 'express';

//
import { createInitialDate } from './config/database/initial-date';

//
import router from './modules/user/routes/user-routes'; './src/modules/user/routes/user-routes'

//
import limiter from './modules/middleware/rateLimit/rate-limit'

//
import cors from 'cors'

//
import cookieParser from 'cookie-parser';

//
import { RabbitmqConnection, LogEntry } from 'shared-lib'

//
let rabbitmq: RabbitmqConnection;
let logEntry: LogEntry;

async function main() {
    const app = express();

    app.use(cors({
        origin: ['http://192.168.0.116:3000'],
        credentials: true
    }))
    const PORT: number = Number(process.env.PORT) || 8080;

    //
    app.use(cookieParser())

    //
    app.use(express.json())

    //
    // app.use(limiter)

    //
    rabbitmq = new RabbitmqConnection();
    await rabbitmq.init();

    logEntry = new LogEntry()

    createInitialDate()

    app.use(router)

    app.get('/', (req: Request, resp: Response) => {
        resp.send('Hello, ts + express')
    });

    app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at PORT: ${PORT}`);
});
}

main().catch(console.error);
export { rabbitmq, logEntry }



