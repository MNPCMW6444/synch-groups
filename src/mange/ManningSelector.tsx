import {Autocomplete, TextField} from "@mui/material";

export interface User {
    label: string,
    id: string
}


const ManningSelector = ({ path, users, setManning }: { path: string[], users: User[], setManning: (path: string[], id: string) => void }) => {
    const label = path.join(" > "); // For displaying the hierarchy in the label

    return (
        <Autocomplete
            disablePortal
            options={users}
            sx={{ width: 300 }}
            onChange={(_:any, value) => {
                if(value) {
                    const index = value.id.indexOf("##");
                    const id = value.id.substring(index + 2);
                    setManning(path, id);
                }
            }}
            renderInput={(params) => (
                <TextField {...params} label={`בחר איוש ל${label}`} />
            )}
        />
    );
};

export default ManningSelector;