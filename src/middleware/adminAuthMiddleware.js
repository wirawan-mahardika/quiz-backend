import { ResponseError } from "../error/ResponseError.js";

export const adminAuthMiddleware = (req, res, next) => {
  const role = req.user?.role;
  if (role && role === "admin") {
    return next();
  }
  throw new ResponseError(401, "Access denied");
};
