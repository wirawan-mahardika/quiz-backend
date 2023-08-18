import { ResponseError } from "../error/ResponseError.js";
import subjectService from "../services/subject-service.js";

const createSubjectAndTopic = async (req, res, next) => {
  try {
    const result = await subjectService.createSubjectAndTopic(req.body);
    res.status(201).json({
      statusCode: 201,
      status: "OK",
      message: "new topic and/or subject has been created",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateSubjectAndTopic = async (req, res, next) => {
  try {
    const result = await subjectService.updateSubjectAndTopic(req.body);
    res.json({
      statusCode: 200,
      status: "OK",
      message: "update successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getSubjectsAndTopics = async (req, res, next) => {
  try {
    const datas = await subjectService.getSubjectsAndTopics(req.query.name);
    if (datas.length < 1) {
      throw new ResponseError(404, `Topic ${req.query.name} is not found`);
    }
    res.json({
      statusCode: 200,
      status: "OK",
      message: "subjects get succesfully",
      data: datas,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createSubjectAndTopic,
  updateSubjectAndTopic,
  getSubjectsAndTopics,
};
