import subjectService from "../services/subject-service.js";

export const createSubjectAndTopic = async (req, res, next) => {
  try {
    const result = await subjectService.createSubjectAndTopic(req.body);
    res
      .status(201)
      .json({
        statusCode: 201,
        status: "OK",
        message: "new topic and subject has been created",
        data: result,
      })
      .end();
  } catch (error) {}
};
