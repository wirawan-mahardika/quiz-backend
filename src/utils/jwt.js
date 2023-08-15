import jwt from "jsonwebtoken";

export function createJwtToken(data, isRefreshToken) {
  const token = jwt.sign(
    data,
    isRefreshToken ? process.env.REFRESH_JWT_SECRET : process.env.JWT_SECRET,
    { expiresIn: isRefreshToken ? "4d" : "30s" }
  );

  return token;
}
