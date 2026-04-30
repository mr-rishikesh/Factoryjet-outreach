import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'toast-dark',
          duration: 3500,
          style: {
            background: '#161616',
            color: '#ededed',
            border: '1px solid #232323',
            borderRadius: '8px',
            fontSize: '13px',
            padding: '10px 14px',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
