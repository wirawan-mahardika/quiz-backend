import express from "express";
import userController from "../controller/user-controller.js";
import subjectController from "../controller/subject-controller.js";
import questionController from "../controller/question-controller.js";

const privateRoute = express.Router();

privateRoute.delete("/api/user/logout", userController.logout);
privateRoute.post("/api/user/answer", userController.getUserTestResult);

privateRoute.post("/api/subject", subjectController.createSubjectAndTopic);
privateRoute.patch("/api/subject", subjectController.updateSubjectAndTopic);
privateRoute.post("/api/question", questionController.createQuestion);
privateRoute.get("/api/question/:id_subject", questionController.getQuestion);
// privateRoute.get("/", (req, res, next) => {
//   console.log(req.user);
//   console.log(req.session.passport.user.refreshToken);
//   res.send("hello wordl");
// });

export default privateRoute;
