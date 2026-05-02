import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Dynamically disable debugging logs in production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
  // Keeping console.error active for critical failure tracking
}

createRoot(document.getElementById("root")!).render(<App />);
