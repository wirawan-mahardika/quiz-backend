import questionService from "../services/question-service";

const createQuestion = async (req, res, next) => {
  try {
    const data = await questionService.createQuestion(req.body);
    res.status(201).json({
      statusCode: 201,
      status: "OK",
      message: "Question successfully created",
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

const getQuestion = async (req, res, next) => {
  try {
    const questions = await questionService.getQuestion(req.params);
    res.json({
      statusCode: 200,
      status: "OK",
      message: "Success get all questions",
      data: {
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createQuestion,
  getQuestion,
};
