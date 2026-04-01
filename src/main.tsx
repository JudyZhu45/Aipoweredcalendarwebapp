
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app/App.tsx";
import "./styles/index.css";
import "./lib/amplify"; // Initialize AWS Amplify
import { Toaster } from "./app/components/ui/sonner";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
    <Toaster position="bottom-right" />
  </BrowserRouter>
);
