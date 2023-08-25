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

const register = async (request) => {
  const user = validate(userRegisterValidate, request);
  passwordStrengthTest(user.password);
  const countUser = await prisma.user.count({ where: { email: user.email } });
  if (countUser > 0) {
    throw new ResponseError(409, "email already registered");
  }

  const salt = await bcrypt.genSalt(11);
  user.password = await bcrypt.hash(user.password, salt);

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

const getUserTestResult = async (requestBody) => {
  const result = validate(testResultValidate, requestBody);
  const { id_subject, data } = result;

  const questions = await prisma.questions.findMany({
    where: { id_subject },
  });
  const gradeTemp = data.map((q) => {
    const questionFromDb = questions.find(
      (d) => d.id_question === q.id_question
    );
    if (q.answer === questionFromDb.answer) return 1;
    return 0;
  });

  const gradeResult = gradeTemp.reduce(a, (b) => a + b, 0) / data.length;
  return gradeResult;
};

export default {
  register,
  login,
  refreshToken,
  getUserTestResult,
};
