
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("ERRO CRÍTICO: O elemento #root não foi encontrado no DOM.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("ERRO AO RENDERIZAR A APP:", error);
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: 'Fredoka', sans-serif; text-align: center; padding: 20px;">
        <h1 style="color: #ef4444; font-size: 24px;">Ops! Algo correu mal.</h1>
        <p style="color: #64748b; margin-bottom: 20px;">Não conseguimos iniciar a app das Estrelas.</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          Tentar Novamente
        </button>
      </div>
    `;
  }
}
