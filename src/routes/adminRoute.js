import express from "express";
import subjectController from "../controller/subject-controller.js";
import questionController from "../controller/question-controller.js";
import multer from "multer";

const adminRoute = express.Router();
const mult = multer();

adminRoute.post("/api/subject", subjectController.createSubjectAndTopic);
adminRoute.patch("/api/subject", subjectController.updateSubjectAndTopic);
adminRoute.post("/api/question", questionController.createQuestion);
// prettier-ignore
adminRoute.post("/api/questions", mult.single("datas"),questionController.createManyQuestion);

export default adminRoute;
