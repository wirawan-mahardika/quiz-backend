import express from "express";
import userController from "../controller/user-controller.js";
import subjectController from "../controller/subject-controller.js";
import questionController from "../controller/question-controller.js";

const privateRoute = express.Router();

// prettier-ignore
privateRoute.delete("/api/user/logout", userController.logout);
privateRoute.post("/api/user/answer", userController.getUserTestResult);
privateRoute.get("/api/user/scores",userController.getUserScore);

privateRoute.get("/api/questions/:id_subject", questionController.getQuestion);

export default privateRoute;
