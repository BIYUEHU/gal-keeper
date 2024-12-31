import React from 'react'
import ReactDOM from 'react-dom/client'
import { initializeIcons } from '@fluentui/font-icons-mdl2'
import '@/index.css'
import 'virtual:uno.css'
import App from '@/App'

initializeIcons()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
