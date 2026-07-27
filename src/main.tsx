import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Fonts are self-hosted rather than pulled from Google Fonts: no third-party
// request on first paint, and the feed's typographic hierarchy is doing the
// work that images would normally do, so it must not FOUT.
import '@fontsource-variable/newsreader/index.css'
import '@fontsource-variable/inter/index.css'

import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
