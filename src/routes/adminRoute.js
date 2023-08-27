import express from "express";
import subjectController from "../controller/subject-controller.js";
import questionController from "../controller/question-controller.js";

const adminRoute = express.Router();

// prettier-ignore

adminRoute.post("/api/subject", subjectController.createSubjectAndTopic);
adminRoute.patch("/api/subject", subjectController.updateSubjectAndTopic);
adminRoute.post("/api/question", questionController.createQuestion);

export default adminRoute;
