import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import BlogPage from './blog/BlogPage.tsx'

const pathname = window.location.pathname || '/'
const isBlogRoute = pathname === '/blog' || pathname.startsWith('/blog/')
const RootComponent = isBlogRoute ? BlogPage : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
)
