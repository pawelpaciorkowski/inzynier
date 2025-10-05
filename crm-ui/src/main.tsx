// Import biblioteki React - główna biblioteka do tworzenia interfejsów użytkownika
import React from 'react';
// Import ReactDOM - biblioteka do renderowania komponentów React w DOM przeglądarki
import ReactDOM from 'react-dom/client';
// Import BrowserRouter z React Router - zapewnia routing po stronie klienta
import { BrowserRouter } from 'react-router-dom';
// Import głównego komponentu aplikacji App
import App from './App';
// Import globalnych stylów CSS aplikacji
import './index.css';

// Znajdź element DOM o id "root" i utwórz punkt wejścia React do renderowania aplikacji
// Wykrzyknik (!) oznacza, że element na pewno istnieje (Type assertion w TypeScript)
ReactDOM.createRoot(document.getElementById('root')!).render(
  // React.StrictMode - tryb deweloperski, który pomaga wykrywać potencjalne problemy
  // Uruchamia dodatkowe sprawdzenia i ostrzeżenia tylko w trybie development
  <React.StrictMode>
    {/* BrowserRouter opakowuje całą aplikację, umożliwiając routing */}
    {/* Używa HTML5 History API do zarządzania URL bez przeładowywania strony */}
    {/* Future flags dla React Router v7 - włączamy nowe funkcjonalności wcześniej */}
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      {/* Renderowanie głównego komponentu aplikacji */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);