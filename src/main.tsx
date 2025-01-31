import React from 'react'
import ReactDOM from 'react-dom/client'
import { initializeIcons } from '@fluentui/font-icons-mdl2'
import '@/index.css'
import 'virtual:uno.css'
import App from '@/App'
import useStore from './store'
import logger from '@/utils/logger'
import { IS_DEV, IS_TAURI } from '@/constant'
import { type Event, listen } from '@tauri-apps/api/event'

/* Initialize */
initializeIcons()

if (IS_DEV) {
  ;(globalThis as unknown as { store: typeof useStore }).store = useStore
}

/* Events */
document.addEventListener('contextmenu', (e) => e.preventDefault())
document.addEventListener('keydown', (e) => {
  if (['F3', 'F5', 'F7'].includes(e.key.toUpperCase())) {
    e.preventDefault()
  }

  if (e.ctrlKey && ['r', 'u', 'p', 'l', 'j', 'g', 'f', 's'].includes(e.key.toLowerCase())) {
    e.preventDefault()
  }
})
document.addEventListener('dragstart', (e) => e.preventDefault())

if (IS_TAURI) {
  listen('increase', (data: Event<[string, number, number]>) => {
    useStore.getState().increasePlayTimeline(...data.payload)
    logger.debug('increase', data.payload)
  })
}

/* Render */
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
