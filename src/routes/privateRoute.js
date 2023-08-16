import express from "express";
import userController from "../controller/user-controller.js";
import { ensureAuthenticated } from "../middleware/passportMiddlewares.js";
import { ResponseError } from "../error/ResponseError.js";
import subjectController from "../controller/subject-controller.js";

const privateRoute = express.Router();

privateRoute.delete("/api/user/logout", userController.logout);

privateRoute.post("/api/subject", subjectController.createSubjectAndTopic);
privateRoute.patch("/api/subject", subjectController.updateSubjectAndTopic);
// privateRoute.get("/", (req, res, next) => {
//   console.log(req.user);
//   console.log(req.session.passport.user.refreshToken);
//   res.send("hello wordl");
// });

export default privateRoute;
