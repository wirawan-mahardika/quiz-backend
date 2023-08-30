import { validate } from "../validation/validate.js";
import { prisma } from "../application/prisma.js";
import { ResponseError } from "../error/ResponseError.js";
import {
  createManyQuestionSchema,
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

const createManyQuestion = async (requestBody, file, id_user) => {
  if (!file) {
    throw new ResponseError(400, "File is needed");
  }
  if (file.mimetype !== "application/json") {
    throw new ResponseError(400, "File extension is not valid");
  }
  const datas = JSON.parse(file.buffer);
  const id_subject = requestBody.id_subject;
  const result = validate(createManyQuestionSchema, { datas, id_subject });

  return prisma.questions.createMany({
    data: result.datas.map((q) => {
      return { ...q, id_subject: id_subject };
    }),
    skipDuplicates: true,
  });
};

export default {
  createQuestion,
  getQuestion,
  createManyQuestion,
};
