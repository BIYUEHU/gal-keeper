import type { LoggerData } from '@kotori-bot/logger'
import EventsEmiter from 'fluoro/dist/context/events'

export interface EventsMapping {
  updateGame(id: string): void
  error(data: LoggerData): void
}

const events = new EventsEmiter<EventsMapping>()

export default events
