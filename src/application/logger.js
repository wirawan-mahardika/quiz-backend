import * as winston from "winston";
import "winston-daily-rotate-file";

export const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: "error.log",
      handleRejections: true,
      dirname: "./log/rotate-file/error",
      maxSize: "1m",
      maxFiles: "14d",
      level: "error",
    }),
    new winston.transports.File({
      filename: "warning&error.log",
      dirname: "./log/warning&error",
      level: "warn",
      handleRejections: true,
      handleExceptions: true,
    }),
    new winston.transports.File({
      filename: "exception.log",
      handleExceptions: true,
      dirname: "./log/exception",
    }),
    new winston.transports.File({
      filename: "rejection.log",
      handleRejections: true,
      dirname: "./log/rejection",
    }),
  ],
});
