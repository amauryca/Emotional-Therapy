import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add script tag for Face API (emotion detection)
const faceApiScript = document.createElement('script');
faceApiScript.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
document.head.appendChild(faceApiScript);

// Add puter.js script
const puterScript = document.createElement('script');
puterScript.src = 'https://js.puter.com/v2/';
document.head.appendChild(puterScript);

// Add title
document.title = "Therapeutic AI Assistant";

createRoot(document.getElementById("root")!).render(<App />);
