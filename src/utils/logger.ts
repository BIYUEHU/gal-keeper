import { IS_DEV } from '@/constant'
import Logger, { ConsoleTransport, LoggerLevel } from '@kotori-bot/logger'

export const logger = new Logger({
  level: IS_DEV ? LoggerLevel.DEBUG : LoggerLevel.SILENT,
  transports: new ConsoleTransport({ template: '<bold>%time%</bold> <italic>%level%</italic> %labels%: %msg%' })
})

export default console
