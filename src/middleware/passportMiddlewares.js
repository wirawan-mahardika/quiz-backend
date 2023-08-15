import { ResponseError } from "../error/ResponseError.js";

export function passportAuthMiddleware(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return next(new ResponseError(401, "Login is needed"));
}

export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(new ResponseError(403, "You're already logged in"));
  }
  return next();
}
