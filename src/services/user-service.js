import {
  testResultValidate,
  userLoginValidate,
  userRegisterValidate,
} from "../validation/user-validate.js";
import { validate } from "../validation/validate.js";
import { prisma } from "../application/prisma.js";
import { ResponseError } from "../error/ResponseError.js";
import bcrypt from "bcrypt";
import { passwordStrengthTest } from "../utils/passStrengthCheck.js";
import { generateTokenWithRefreshToken } from "../utils/jwt.js";
import dayjs from "dayjs";


const register = async (request) => {
  const user = validate(userRegisterValidate, request);
  passwordStrengthTest(user.password);
  const countUser = await prisma.user.count({ where: { email: user.email } });
  if (countUser > 0) {
    throw new ResponseError(409, "email already registered");
  }

  const salt = await bcrypt.genSalt(11);
  user.password = await bcrypt.hash(user.password, salt);
  user.role = "user";

  return prisma.user.create({
    data: user,
    select: {
      username: true,
      email: true,
      name: true,
    },
  });
};

const login = (request) => {
  return validate(userLoginValidate, request);
};

const refreshToken = (token) => {
  const accessToken = generateTokenWithRefreshToken(token);
  return accessToken;
};

const getUserTestResult = async (requestBody, id_user) => {
  const result = validate(testResultValidate, requestBody);
  const { id_subject, data } = result;

  const countUser = await prisma.user_Score.count({
    where: { id_user, id_subject },
  });
  if (countUser > 0) {
    throw new ResponseError(409, "Questions already answered");
  }
  
  const questions = await prisma.questions.findMany({
    where: { id_subject },
  });

  const gradeTemp = data.map((q) => {
    const questionFromDb = questions.find(
      (d) => d.id_question === q.id_question
    );
    if (questionFromDb && q.answer === questionFromDb.answer) return 1;
    return 0;
  });

  const gradeResult =
    (gradeTemp.reduce((a, b) => a + b, 0) * 100) / questions.length;

  const { score, id_score } = await prisma.user_Score.create({
    data: {
      id_user: id_user,
      id_subject: id_subject,
      score: gradeResult,
      createdAt: dayjs().toISOString(),
    },
  });
  return { score, id_score };
};

const getUserScores = async (id_user, subject, topic) => {
  return prisma.user_Score.findMany({
    where: {
      id_user: id_user,
      subject: {
        name: {
          contains: subject,
        },
        topic: {
          contains: topic,
        },
      },
    },
    select: {
      id_score: true,
      score: true,
      createdAt: true,
      subject: {
        select: {
          name: true,
          topic: true,
        },
      },
    },
  });
};

export default {
  register,
  login,
  refreshToken,
  getUserTestResult,
  getUserScores,
};
