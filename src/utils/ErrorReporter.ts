import { type LoggerData, Transport, LoggerLevel } from '@kotori-bot/logger'
import events from './events'

class ErrorReporter extends Transport {
  public constructor() {
    super({})
  }

  public handle(data: LoggerData): void {
    if (data.level >= LoggerLevel.WARN) {
      events.emit('error', data)
    }
  }
}

export default ErrorReporter
