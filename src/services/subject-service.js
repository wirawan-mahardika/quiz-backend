import { createSubjectAndTopicSchema } from "../validation/subject-validate.js";
import { validate } from "./validate.js";
import { prisma } from "../application/prisma.js";

const createSubjectAndTopic = async (request) => {
  const result = validate(createSubjectAndTopicSchema, request);

  return prisma.subject.create({ data: result });
};

export default {
  createSubjectAndTopic,
};
