import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import App from './App.tsx'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

const theme = createTheme({
    palette: {
        primary: { main: '#5c6bc0' },
        background: { default: '#f0f2f5' },
    },
    shape: { borderRadius: 12 },
    typography: { fontFamily: '"Noto Sans KR", "Roboto", sans-serif' },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
