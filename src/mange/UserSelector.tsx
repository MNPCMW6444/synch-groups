import {Dispatch, SetStateAction} from "react";
import {Autocomplete, TextField} from "@mui/material";

export interface User {
    label: string,
    id: string
}


const UserSelector = ({users,setter}: { users: User[],setter:Dispatch<SetStateAction<string>> }) =>
    <Autocomplete
        key={25}
        disablePortal
        options={users}
        sx={{width: 300}}
        renderInput={(params) => <TextField onSelect={(e:any)=> {
            const str = e.target.value;
            const index = str.indexOf("##");
            return setter(str.substring(index+2,str.length))
        }} {...params} label="Crew Member"/>}
    />

export default  UserSelector;