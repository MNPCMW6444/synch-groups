import {Autocomplete, TextField} from "@mui/material";
import {Dispatch, SetStateAction} from "react";

export interface User {
    label: string,
    id: string
}


const ManningSelector = ({value, path, users, setManning, color, disabled, sidur, setter}: {
    value: string,
    path: string[],
    users: User[],
    setManning: (path: string[], id: string) => void,
    color: { state: string, plan: string, synch: string }
    disabled?: boolean,
    sidur?: boolean
    setter?: Dispatch<SetStateAction<string>>
}) => {
    const label = path.join(" > "); // For displaying the hierarchy in the label



    return (
        ((users.find(({id}) => id === value)) || users[0]) &&
        <Autocomplete disabled={disabled} disablePortal options={users}
                      value={((users.find(({id}) => id === value)) || users[0])}
                      sx={color?.state !== color?.plan && color?.state !== color?.synch ? {
                          width: 250,
                          backgroundColor: "yellow"
                      } : color?.state !== color?.plan ? {
                          width: 250,
                          backgroundColor: "#6bf36b"
                      } : color?.state !== color?.synch ? {width: 250, backgroundColor: "cyan"} : {width: 250}}
                      onChange={sidur ? (


                          (_: any, value) => {
                              if (value) {
                                  const index = value.id.indexOf("##");
                                  const id = value.id.substring(index + 1);
                                  setter && setter(id);
                              }
                          }


                      ) : ((_: any, value) => {
                          if (value) {
                              const index = value.id.indexOf("##");
                              const id = value.id.substring(index + 1);
                              setManning(path, id);
                          }
                      })}
                      renderInput={(params) => (
                          <TextField {...params} label={`בחר איוש ל${label}`}/>
                      )}
        />
    );
};

export default ManningSelector;