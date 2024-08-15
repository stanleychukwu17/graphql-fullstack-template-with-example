import fs from 'fs';
import pino from 'pino'; // pino will be used to log error messages into an error file
import logger from 'pino' // logger will be used for my logging, instead of using of console.log()
import dayjs from 'dayjs'

const args = {
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss'
        }
    },
    base: {pid: false},
    timestamp: () => `, "time":"${dayjs().format()}"`
}
export const log = logger(args)


//*--START-- the below is for logging of errors to a file
// Creates the log folder for storing all of the logging files
const folderPath = (process.env.NODE_ENV === 'production') ? './.logs' : './.logs';
if (!fs.existsSync(folderPath)) {
    fs.mkdir(folderPath, () => {})
    log.info('new folder created')
}

const errorLogStream = fs.createWriteStream('./.logs/error.log', { flags: 'a' });

// Create a custom logger for error logs
// export const errorLogger = pino({ level: 'error'}, errorLogStream); // Set the log level to 'error' to log only error-level messages
export const errorLogger: any = pino({}, errorLogStream);
//*--END--