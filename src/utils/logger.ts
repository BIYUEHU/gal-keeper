import { IS_DEV } from '@/constant'
import Logger, { ConsoleTransport, LoggerLevel } from '@kotori-bot/logger'
import ErrorReporter from './ErrorReporter'

const logger = new Logger({
  level: IS_DEV ? LoggerLevel.DEBUG : LoggerLevel.SILENT,
  transports: [
    new ConsoleTransport({ template: '<bold>%time%</bold> <italic>%level%</italic> %labels%: %msg%' }),
    new ErrorReporter()
  ]
})

export const dbLogger = logger.label('DATABASE')

export const invokeLogger = logger.label('INVOKE')

export const httpLogger = logger.label('HTTP')

export default logger
