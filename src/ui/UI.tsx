import ConnectivityOC from "./ConnectivityOC.tsx";
import Manager from "./manage/Manager.tsx";
import useSync from "../hooks/useSync.ts";

const UI = ({x}: any) => {
    const sync = useSync(x)


    return <>
        <ConnectivityOC sync={sync}/>
        <Manager users={sync.users}/>
    </>
}

export default UI