import {Button, Grid, Typography} from "@mui/material";
import useAll from "./useAll.ts";
import {useEffect, useState} from "react";
import {Yaba} from "./groups.ts";
import ManningSelector, {User} from "./ManningSelector.tsx";


const removeDuplicatesById = (users: User[]): User[] => {
    const unique = new Map<string, User>();
    users.forEach(user => {
        if (!(unique.has(user.id) && unique.has(user.label))) {
            user.id && user.id !== "null" && user.label && user.label !== "null" && unique.set(user.id, user);
        }
    });
    return Array.from(unique.values());
}


const Pirit = () => {
    const {getAllData} = useAll()
    const [users, setUsers] = useState<User[]>([]);
    const [piritManning, setPiritManning] = useState<Yaba>(
        {
            "מכלול 25": {
                "צוות מסער": {
                    "מסער": {"אחורי": "", "קדמי": "", "מפעיל": "",},
                    "חצ/סי": {"אחורי": "", "קדמי": "", "מפעיל": "",},
                    "אוצר4": ""
                },
                "השאר": {
                    "מנהל": "",
                    "מע ת": "",
                    "מע ק": "",
                    "משק מכלולי": "",
                    "מהיר גבוה": {"אחורי": "", "קדמי": "", "מפעיל": ""},
                    "מהיר נמוך": {"אחורי": "", "קדמי": "", "מפעיל": ""},
                    "אוצר1": "",
                    "אוצר2": "",
                    "אוצר3": "",
                    "אוצר5": "",
                    "מרחפים1": {"אחורי": "", "קדמי": "", "מפעיל": ""},
                    "מרחפים2": {"אחורי": "", "קדמי": "", "מפעיל": ""},
                    "מרחפים4": {"אחורי": "", "קדמי": "", "מפעיל": ""},
                    "שוהות": {"אחורי": "", "קדמי": "", "מפעיל": ""},
                    "פיצול שוהות": {"אחורי": "", "קדמי": "", "מפעיל": ""},
                }
            },
            "מכלול 12": {
                "מנהל": "",
                "מע ים": "",
                "מי יבשה": "",
                "מע מפרץ": "",
// sitting....
                "ירוט א": {"קדמי": "", "מפעיל": ""},
                "ירוט ב": {"קדמי": "", "מפעיל": ""},
                "ירוט ג": {"קדמי": "", "מפעיל": ""},
                "ירוט ד": {"קדמי": "", "מפעיל": ""},
                "ירוט ה": {"קדמי": "", "מפעיל": ""},
                "ירוט ו": {"קדמי": "", "מפעיל": ""},
                "ירוט ז": {"קדמי": "", "מפעיל": ""},
            }
        });

    useEffect(() => {
        getAllData().then(res => {
            if (res?.users) {
                const users = res?.users?.map(({first_name, last_name, id}: any) => ({
                    label: `${first_name} ${last_name} ##${id}`, // assuming 'id' is a ""
                    id
                }));
                setUsers(removeDuplicatesById(users))
            }
        });
    }, []);


    const setManning = (path: string[], id: string) => {
        setPiritManning(prevState => {
            const newState = {...prevState};
            let currentLevel: any = newState;
            for (let i = 0; i < path.length - 1; i++) {
                currentLevel = currentLevel[path[i]];
            }
            currentLevel[path[path.length - 1]] = id;
            return newState;
        });
    };

    const renderMannings = (mannings: any, path: string[] = [], depth: number = 0) => {
        const direction = depth % 2 === 0 ? "row" : "column";

        return (
            <Grid item container key={path.concat(depth + "").join("_")} direction={direction}
                  justifyContent="flex-start"
                  alignItems="flex-start" spacing={1}>
                <Grid item key={path.concat(depth + "x").join("_")}>
                    <Typography variant={("h" + (depth + 3)) as any}>
                        {path[path.length - 1] || "איוש לפיריט" + ": "}
                    </Typography>
                </Grid>
                {Object.keys(mannings).map(key => {
                    if (typeof mannings[key] === 'object' && mannings[key] !== null) {
                        return renderMannings(mannings[key], path.concat(key), depth + 1);
                    } else {
                        return (
                            <Grid item key={path.concat(key).join("_")}
                                  sx={{padding: '8px', minWidth: '300px', minHeight: '100px'}}>
                                <ManningSelector path={path.concat(key)} users={users} setManning={setManning}/>
                            </Grid>
                        );
                    }
                })}
            </Grid>
        );
    };


    return (
        <Grid container direction="column" height="100vh" width="100vw" justifyContent="flex-start"
              alignItems="center" spacing={2} wrap="nowrap">
            {renderMannings(piritManning)}
            <Grid item>
                <Button sx={{padding: "30px 50px", margin: "20px", fontSize: "200%"}} variant="contained">
                    שא-גר
                </Button>
            </Grid>
        </Grid>
    );
}


export default Pirit;