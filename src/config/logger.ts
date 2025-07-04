import { createLogger, format, transports } from 'winston';

// Konfigurasi logger menggunakan winston
// Logger ini akan mencatat log ke konsol dan file
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.colorize(),
        format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level}: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/app.log' })
    ],
});

export default logger;
