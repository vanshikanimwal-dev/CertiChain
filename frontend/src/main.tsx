import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { RecordsProvider } from "./state/records";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <RecordsProvider>
        <App />
      </RecordsProvider>
    </BrowserRouter>
  </StrictMode>,
);
