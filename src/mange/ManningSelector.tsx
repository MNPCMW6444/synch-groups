import {Autocomplete, TextField} from "@mui/material";
import {User} from "./UserSelector.tsx";

const ManningSelector = ({ path, users, setManning }: { path: string[], users: User[], setManning: (path: string[], id: string) => void }) => {
    const label = path.join(" > "); // For displaying the hierarchy in the label

    return (
        <Autocomplete
            disablePortal
            options={users}
            sx={{ width: 300 }}
            renderInput={(params) => (
                <TextField onSelect={(e: any) => {
                    const str = e.target.value;
                    const index = str.indexOf("##");
                    const id = str.substring(index + 2, str.length);
                    setManning(path, id);
                }} {...params} label={`Select for ${label}`} />
            )}
        />
    );
};

export default ManningSelector;