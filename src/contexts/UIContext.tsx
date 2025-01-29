import { DefaultGroup } from '@/types'
import { t } from '@/utils/i18n'
import { createContext, useContext, useReducer } from 'react'

interface UIState {
  alert: {
    isOpen: boolean
    text: string
    title: string
  }
  fullLoading: boolean
  sidebarOpen: boolean
  currentGroupId: string
}

type UIAction =
  | { type: 'OPEN_ALERT'; payload: { text: string; title?: string } }
  | { type: 'CLOSE_ALERT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_CURRENT_GROUP'; payload: string }

interface UIContextType {
  state: UIState
  openAlert: (text: string, title?: string) => void
  closeAlert: () => void
  openFullLoading: () => () => void
  toggleSidebar: () => void
  setCurrentGroupId: (group: string) => void
}

const initialState: UIState = {
  alert: {
    isOpen: false,
    text: '',
    title: t`alert.title`
  },
  fullLoading: false,
  sidebarOpen: true,
  currentGroupId: DefaultGroup.DEVELOPER
}

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'OPEN_ALERT':
      return {
        ...state,
        alert: {
          isOpen: true,
          text: action.payload.text,
          title: action.payload.title || t`alert.title`
        }
      }
    case 'CLOSE_ALERT':
      return {
        ...state,
        alert: {
          ...state.alert,
          isOpen: false
        }
      }
    case 'SET_LOADING':
      return {
        ...state,
        fullLoading: action.payload
      }
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      }
    case 'SET_CURRENT_GROUP':
      return {
        ...state,
        currentGroupId: action.payload
      }
    default:
      return state
  }
}

const UIContext = createContext<UIContextType | null>(null)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState)

  const openAlert = (text: string, title?: string) => dispatch({ type: 'OPEN_ALERT', payload: { text, title } })

  const closeAlert = () => dispatch({ type: 'CLOSE_ALERT' })

  const openFullLoading = () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    return () => dispatch({ type: 'SET_LOADING', payload: false })
  }

  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' })

  const setCurrentGroupId = (group: string) => dispatch({ type: 'SET_CURRENT_GROUP', payload: group })

  return (
    <UIContext.Provider value={{ state, openAlert, closeAlert, openFullLoading, toggleSidebar, setCurrentGroupId }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error('useUI must be used within UIProvider')
  }
  return context
}
