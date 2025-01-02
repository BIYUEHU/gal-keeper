import React from 'react'
import ReactDOM from 'react-dom/client'
import { initializeIcons } from '@fluentui/font-icons-mdl2'
import '@/index.css'
import 'virtual:uno.css'
import App from '@/App'
import { useSharedStore } from './store'

initializeIcons()
useSharedStore.getState().initialize()

document.addEventListener('contextmenu', (e) => e.preventDefault())
document.addEventListener('keydown', (e) => {
  if (['F3', 'F5', 'F7'].includes(e.key.toUpperCase())) {
    e.preventDefault()
  }

  if (e.ctrlKey && ['r', 'u', 'p', 'l', 'j', 'g', 'f', 's'].includes(e.key.toLowerCase())) {
    e.preventDefault()
  }
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
