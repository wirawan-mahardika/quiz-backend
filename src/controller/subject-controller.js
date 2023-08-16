import subjectService from "../services/subject-service.js";

const createSubjectAndTopic = async (req, res, next) => {
  try {
    const result = await subjectService.createSubjectAndTopic(req.body);
    res
      .status(201)
      .json({
        statusCode: 201,
        status: "OK",
        message: "new topic and/or subject has been created",
        data: result,
      })
      .end();
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

export default {
  createSubjectAndTopic,
  updateSubjectAndTopic,
};