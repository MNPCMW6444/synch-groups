import {createTheme, ThemeProvider} from "@mui/material";
import {Global, css} from "@emotion/react";
import Manage from "./mange/Manage.tsx";

const globalStyles = css`
  * {
    box-sizing: border-box;
  }
`;

const theme = createTheme({
    palette: {
        mode: new Date().getHours() > 20 || new Date().getHours() < 6 ? "dark" : "light",
        primary: {
            main: '#dc1072',
            contrastText: '#ffffff',
            light: '#e33f8e',
            dark: '#9a0b4f',
        },
        secondary: {
            main: '#b48ccb',
            light: '#dd1173',
            dark: '#ab90b7',
            contrastText: '#ffffff',
        },
    },
    typography: {
        fontSize: 14,
        fontWeightLight: 200,
        fontFamily: 'Source Sans Pro',
    },
});

function App() {

    return (
        <ThemeProvider theme={theme}>
            <Global styles={globalStyles}/>
            <Manage/>
        </ThemeProvider>
    );
}

export default App;
