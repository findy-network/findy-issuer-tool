import config from 'config';
import { createLogger, format, transports } from 'winston';

const { Console } = transports;

const outputFormat = format.printf(
  (info) => `[${info.timestamp}] ${info.level}: ${info.message}`,
);
const logConfig = {
  level: config.log.level,
  format: config.log.colorize
    ? format.combine(format.colorize(), format.timestamp(), outputFormat)
    : format.combine(format.timestamp(), outputFormat),
  transports: [new Console()],
  exceptionHandlers: [new Console()],
  exitOnError: false,
};

export default createLogger(logConfig);
