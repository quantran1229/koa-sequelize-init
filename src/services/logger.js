import {
  createLogger,
  format,
  transports,
  addColors
} from 'winston';
import {
  format as date_format
} from 'date-fns';
import {
  cfg
} from '../config';

import moment from 'moment'

const {
  combine,
  colorize,
  timestamp,
  splat,
  printf,
  align
} = format;

const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    sql: 3,
    http: 4,
    debug: 5
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    sql: "blue",
    http: "cyan",
    debug: "grey"
  }
};
addColors(logLevels.colors);

const LOG_LEVEL = cfg('APP_LOG_LEVEL', String);

const myFormat = printf(info => {
  let {
    timestamp,
    level,
    label,
    message
  } = info;
  label = label || '';
  timestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
  return `${timestamp} [${level}] ${label.toUpperCase()}: ${message}`;
});

const logger = createLogger({
  levels: logLevels.levels,
  transports: [
    new transports.Console({
      level: LOG_LEVEL,
      format: combine(
        colorize(),
        timestamp(),
        align(),
        splat(),
        myFormat,
      )
    }),
    new transports.File({
      level: 'error',
      filename: cfg('APP_FILE_ERROR_LOG', String),
      format: combine(
        timestamp(),
        align(),
        splat(),
        myFormat,
      )
    }),
    new transports.File({
      filename: cfg('APP_FILE_COMBINED_LOG', String),
      level: 'info',
      format: combine(
        timestamp(),
        align(),
        splat(),
        myFormat,
      )
    })
  ]
});

// if (LOG_LEVEL == 'debug') {
//   logger.add(new transports.File({
//     level: 'debug',
//     filename: cfg('APP_FILE_DEBUG_LOG', String),
//     format: combine(
//       timestamp(),
//       splat(),
//       myFormat,
//     )
//   }));
// }


export function getLogger(label = '') {
  const levels = Object.keys(logLevels.levels);
  const funcs = {};
  for (let i = 0; i < levels.length; i++) {
    funcs[levels[i]] = function (message, ...args) {
      let meta = args[args.length - 1];
      if (typeof meta == 'object' && meta.hasOwnProperty('label')) {
        label = meta.label;
      }
      logger.log({
        level: levels[i],
        message: message,
        [Symbol.for('splat')]: args,
        label: label
      })
    };
  }
  funcs.log = function () {
    logger.log.apply(logger, arguments);
  }
  return funcs;
}

export default logger;