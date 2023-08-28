import { logger } from "../application/logger.js";
import { ResponseError } from "../error/ResponseError.js";

export function errorMiddleware(err, req, res, next) {
  if (!err) {
    return next();
  }
  if (err instanceof ResponseError) {
    logger.warn({ ...err, message: err.message });
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      status: err.status,
      message: err.message,
      data: err.data,
      detail: err.detail,
    });
  } else {
    logger.error(err);
    return res.status(500).json({
      statusCode: 500,
      status: "NOT OK",
      message: "INTERNAL SERVER ERROR",
    });
  }
}

//  else if (err instanceof PrismaClientKnownRequestError) {
//   const response = {};
//   switch (err.code) {
//     case "P2001":
//     case "P2015":
//     case "P2025":
//     case "P2025":
//     case "P2030":
//       response.statusCode = 404;
//       response.message = "File not found";
//       break;
//     case "2014":
//       response.statusCode = 409;
//       response.message = "Conflict data";
//       break;
//     case "P2034":
//       response.statusCode = 409;
//       response.message = "there is a conflict";
//       break;
//     default:
//       response.statusCode = 409;
//       response.message = "there is a conflictor possibly deadlock";
//       break;
//   }
//   return res.status(response.statusCode).json({
//     statusCode: response.statusCode,
//     status: "NOT OK",
//     message: response.message,
//   });
// }
