import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css"; // 전역 스타일
import DebugOverlay from "./components/DebugOverlay";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <DebugOverlay />
      <App />
    </HashRouter>
  </React.StrictMode>
);
