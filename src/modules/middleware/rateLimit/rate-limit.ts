import { rateLimit } from 'express-rate-limit'
const limiter = rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 3,
    message: 'You have exceeded the number of requests. Please try again after 3 minutes.',
    standardHeaders: true,
    legacyHeaders: false
})

export default limiter