import type games from '@/data/games.json'

export type Game = (typeof games)[number]

export interface SidebarItem {
  key: string
  icon: string
  text: string
}
