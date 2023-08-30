import express from 'express'
import userController from "../controller/user-controller.js";
import { ensureAuthenticated, passportAuthMiddleware } from '../middleware/passportMiddlewares.js';
import subjectController from "../controller/subject-controller.js";

const publicRoute = express.Router();

publicRoute.post("/api/users/register",ensureAuthenticated,userController.register);
publicRoute.post("/api/users/login", ensureAuthenticated, userController.login);
// prettier-ignore
publicRoute.get("/api/user/refresh-token", passportAuthMiddleware, userController.refreshToken);
publicRoute.get("/api/subjects", subjectController.getSubjectsAndTopics);

export default publicRoute