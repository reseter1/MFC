import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from "./components/ToastProvider"
import { Provider } from 'react-redux'
import { store, persistor } from './store'
import { PersistGate } from 'redux-persist/integration/react'
import { LoadingProvider } from './contexts/LoadingContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastProvider>
          <LoadingProvider>
            <App />
          </LoadingProvider>
        </ToastProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
