import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {Box} from "@mui/material";




// In your Vite app's entry file or an initialization script
async function fetchConfig() {
    const response = await fetch('/config');
    return await response.json();
}

const render = (config: any) => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <Box width="100vw" height="100vh">
                <App x={{x: config?.IAF_TOKEN, u: config?.USR, p: config?.PASSWD, env:config?.ENV}}/>
            </Box>
        </React.StrictMode>,
    )
}

fetchConfig().then((config) => {

    render(config)


}).catch(() => {

    render(undefined)

});