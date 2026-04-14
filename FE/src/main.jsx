import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider 
      locale={viVN}
      theme={{
        token: {
          borderRadius: 2,
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
