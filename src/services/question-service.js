import { validate } from "../validation/validate.js";
import { prisma } from "../application/prisma.js";
import { ResponseError } from "../error/ResponseError.js";
import {
  createQuestionSchema,
  getQuestionSchema,
} from "../validation/question-validate.js";

const createQuestion = async (request) => {
  const result = validate(createQuestionSchema, request);

  const countSubject = await prisma.subject.count({
    where: {
      id_subject: result.id_subject,
    },
  });

  if (countSubject < 1) {
    throw new ResponseError(404, "Subject or topic is not exist");
  }

  const countQuestion = await prisma.questions.count({
    where: {
      question: result.question,
    },
  });

  if (countQuestion > 0) {
    throw new ResponseError(409, "Question is already exist");
  }

  return prisma.questions.create({ data: result });
};

const getQuestion = async (params) => {
  const result = validate(getQuestionSchema, params);

  const question = await prisma.questions.findMany({
    where: {
      id_subject: result.id_subject,
    },
  });
  if (question.length < 1) {
    throw new ResponseError(404, "Question is not exist");
  }
  return question;
};

export default {
  createQuestion,
  getQuestion,
};
