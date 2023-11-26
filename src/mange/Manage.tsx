import useAll from "./useAll.ts";

const Manage = () => {

    const x = useAll()

    return <>{JSON.stringify(x)}</>
}

export  default  Manage;
