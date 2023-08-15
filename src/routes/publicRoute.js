import express from 'express'
import userController from "../controller/user-controller.js";
import { ensureAuthenticated } from '../middleware/passportMiddlewares.js';

const publicRoute = express.Router();

publicRoute.post("/api/users/register", ensureAuthenticated, userController.register);
publicRoute.post("/api/users/login", ensureAuthenticated, userController.login);
publicRoute.delete("/api/users/logout", ensureAuthenticated, userController.logout);

// publicRoute.get("/", (req, res, next) => {
//   console.log(req.user);
//   console.log(req.session.passport.user.refreshToken);
//   res.send("hello wordl");
// });

export default publicRoute