import { rateLimit } from "express-rate-limit"

export const mainRateLimit = rateLimit({
    windowMs: 1000 * 60 * 15,
    max: 300,
    message: "Too many request, please try again later"
})