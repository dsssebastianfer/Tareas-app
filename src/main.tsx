import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/nunito';
import './styles/index.css';
import { AuthGate } from './auth/AuthGate';

registerSW({ immediate: true });

// Pide al navegador no borrar los datos de la app por falta de espacio.
void navigator.storage?.persist?.();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate />
  </StrictMode>,
);
