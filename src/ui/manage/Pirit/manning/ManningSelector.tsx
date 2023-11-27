import {Autocomplete, TextField} from "@mui/material";

export interface User {
    label: string,
    id: string
}


const ManningSelector = ({value, path, users, setManning}: {
    value: string,
    path: string[],
    users: User[],
    setManning: (path: string[], id: string) => void
}) => {
    const label = path.join(" > "); // For displaying the hierarchy in the label

    if (value) {
        console.log("value: ", value)
        console.log("user: ", (users.find(({id}) => id === value)))
    }

    return (
        ((users.find(({id}) => id === value)) || users[0]) &&  <Autocomplete
            disablePortal
            options={users}
            value={((users.find(({id}) => id === value)) || users[0])}
            sx={{width: 250}}
            onChange={(_: any, value) => {
                if (value) {
                    const index = value.id.indexOf("##");
                    const id = value.id.substring(index + 1);
                    setManning(path, id);
                }
            }}
            renderInput={(params) => (
                <TextField {...params} label={`בחר איוש ל${label}`}/>
            )}
        />
    );
};

export default ManningSelector;