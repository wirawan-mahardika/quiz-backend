import jwt from "jsonwebtoken";
import { ResponseError } from "../error/ResponseError.js";

export function jwtAuthMiddleware(req, res, next) {
  let token = req.headers["authorization"];
  token = token?.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      throw new ResponseError(401, "access denied due to missing access token");
    }
    return next();
  });
}
