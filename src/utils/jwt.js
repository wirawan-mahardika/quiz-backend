import jwt from "jsonwebtoken";
import { ResponseError } from "../error/ResponseError";
import dotenv from "dotenv";

dotenv.config();
export function createJwtToken(data, isRefreshToken) {
  const token = jwt.sign(
    data,
    isRefreshToken ? process.env.REFRESH_JWT_SECRET : process.env.JWT_SECRET,
    { expiresIn: isRefreshToken ? "4d" : "30s" }
  );

  return token;
}

export function generateTokenWithRefreshToken(token) {
  try {
    const user = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
    return createJwtToken({ email: user.email }, false);
  } catch (error) {
    throw new ResponseError(
      401,
      "access denied due to missing or invalid access token"
    );
  }
}