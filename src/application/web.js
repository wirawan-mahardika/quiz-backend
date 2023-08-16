import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import { corsConfig } from '../config/cors.js'
import { mainRateLimit } from '../config/rate-limit.js'
import { sessionConfig } from "../config/session.js";
import { intializePassport } from "../config/passport.js";
import { errorMiddleware } from "../middleware/errorMiddleware.js";
import publicRoute from "../routes/publicRoute.js";
import { passportAuthMiddleware } from "../middleware/passportMiddlewares.js";
import { jwtAuthMiddleware } from "../middleware/jwtMiddleware.js";
import dotenv from "dotenv";
import privateRoute from "../routes/privateRoute.js";

dotenv.config();
const web = express();

web.use(mainRateLimit);
web.use(helmet());
web.use(cors(corsConfig));
web.use(express.json());
web.use(cookieParser(process.env.SESSION_COOKIE_SECRET));
web.use(session(sessionConfig(session)));
web.use(passport.initialize());
web.use(passport.session());
intializePassport(passport);

web.use(publicRoute);
web.use(passportAuthMiddleware);
web.use(jwtAuthMiddleware);
web.use(privateRoute);
web.use(errorMiddleware)

export default web