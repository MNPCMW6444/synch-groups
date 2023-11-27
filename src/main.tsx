import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {Box} from "@mui/material";


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(function (registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function (error) {
            console.log('Service Worker registration failed:', error);
        });
}

// In your Vite app's entry file or an initialization script
async function fetchConfig() {
    const response = await fetch('/config');
    return await response.json();
}

fetchConfig().then((config) => {


    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <Box width="100vw" height="100vh">
                <App x={config.IAF_TOKEN}/>
            </Box>
        </React.StrictMode>,
    )

})