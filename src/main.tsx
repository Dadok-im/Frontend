import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { MedicationProvider } from "./contexts/MedicationContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MedicationProvider>
      <App />
    </MedicationProvider>
  </React.StrictMode>
);
