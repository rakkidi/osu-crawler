import winston from "winston";
const { combine } = winston.format;
const logConfiguration = {
  format: combine(winston.format.colorize(), winston.format.json()),

  transports: [
    new winston.transports.Console({
      level: "info",
      timestamp: function () {
        return new Date().toLocaleTimeString();
      },
    }),
    new winston.transports.File({
      level: "error",
      // Create the log directory if it does not exist
      filename: "logs/errors.log",
    }),
  ],
};

const logger = winston.createLogger(logConfiguration);

export default logger;
