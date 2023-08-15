import express from 'express'
import userController from "../controller/user-controller.js";
import { ensureAuthenticated, passportAuthMiddleware } from '../middleware/passportMiddlewares.js';

const publicRoute = express.Router();

/* prettier-ignore-start */
publicRoute.post("/api/users/register", ensureAuthenticated, userController.register);
publicRoute.post("/api/users/login", ensureAuthenticated, userController.login);
publicRoute.delete("/api/users/logout", ensureAuthenticated, userController.logout);

publicRoute.get("/api/user/refresh-token", passportAuthMiddleware, userController.refreshToken);
/* prettier-ignore-end */

export default publicRoute