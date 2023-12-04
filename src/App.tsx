import UI from "./components/UI.tsx";
import Sidur from "./components/Sidur.tsx";

const App = ({x}: any) => {
    return (
        x.is ? <Sidur x={x}/> : <UI x={x}/>
    );
}

export default App;

