import {
  createSubjectAndTopicSchema,
  updateSubjectAndTopicSchema,
} from "../validation/subject-validate.js";
import { validate } from "../validation/validate.js";
import { prisma } from "../application/prisma.js";
import { ResponseError } from "../error/ResponseError.js";

const createSubjectAndTopic = async (request) => {
  const result = validate(createSubjectAndTopicSchema, request);

  const countTopic = await prisma.subject.count({
    where: { topic: result.topic, name: result.name },
  });
  if (countTopic > 0) {
    throw new ResponseError(409, "Conflict entity, topic is already exist");
  }

  return prisma.subject.create({
    data: result,
    select: { name: true, topic: true, id_subject: true },
  });
};

const updateSubjectAndTopic = async (request) => {
  const result = validate(updateSubjectAndTopicSchema, request);
  const countTopic = await prisma.subject.count({
    where: { topic: result.topic, name: result.name },
  });
  if (countTopic > 0) {
    throw new ResponseError(409, "Conflict entity, topic is already exist");
  }

  return prisma.subject.update({
    where: {
      id_subject: result.id_subject,
    },
    data: {
      name: result.name,
      topic: result.topic,
    },
    select: { name: true, topic: true },
  });
};

export default {
  createSubjectAndTopic,
  updateSubjectAndTopic,
};
