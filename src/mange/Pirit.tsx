import {Grid} from "@mui/material";
import {User} from "./UserSelector.tsx";
import useAll from "./useAll.ts";
import {useEffect, useState} from "react";
import {Yaba} from "./groups.ts";
import ManningSelector from "./ManningSelector.tsx";


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
            room25: {
                manager: {back: ""},
                movDirector: {back: ""},
                fDirector: {back: ""},
                roomOperator: {operator: ""},
                fHigh: {back: "", front: "", operator: ""},
                fLow: {back: "", front: "", operator: ""},
                treasure1: {front: ""},
                treasure2: {front: ""},
                treasure3: {front: ""},
                treasure5: {front: ""},
                hStand1: {back: "", front: "", operator: ""},
                hStand2: {back: "", front: "", operator: ""},
                hStand4: {back: "", front: "", operator: ""},
                stayingStand: {back: "", front: "", operator: ""},
                doubleStayingStand: {back: "", front: "", operator: ""},
                rescueTeam: {
                    hStand: {
                        back: "",
                        front: "",
                        operator: "",
                    },
                    fStand: {
                        back: "",
                        front: "",
                        operator: "",
                    },
                    tStand: {
                        front: "",
                    },
                    treasure4: {front: ""}
                },
            },
            room12: {
                manager: {back: ""},
                seaDirector: {back: ""},
                groundDirector: {back: ""},
                bayDirector: {back: ""},
                // sitting....
                interA: {front: "", operator: ""},
                interB: {front: "", operator: ""},
                interC: {front: "", operator: ""},
                interD: {front: "", operator: ""},
                interE: {front: "", operator: ""},
                interF: {front: "", operator: ""},
                interG: {front: "", operator: ""},
            }
        });

    useEffect(() => {
        getAllData().then(res => {
            if (res?.users) {
                const users = res?.users?.map(({first_name, last_name, id}: any) => ({
                    label: `${first_name} ${last_name} ##${id}`, // assuming 'id' is a string
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
            currentLevel[path[path.length - 1]] = {...currentLevel[path[path.length - 1]], id};
            return newState;
        });
    };

    const renderMannings = (mannings: any, path: string[] = [], depth: number = 0) => {
        const direction = depth % 2 === 0 ? "row" : "column";

        return (
            <Grid container direction={direction} justifyContent="center" alignItems="center" spacing={2} wrap="nowrap">
                {Object.keys(mannings).map(key => {
                    if (typeof mannings[key] === 'object' && mannings[key] !== null) {
                        return renderMannings(mannings[key], path.concat(key), depth + 1);
                    } else {
                        return (
                            <Grid item key={path.concat(key).join("_")}>
                                <ManningSelector path={path.concat(key)} users={users} setManning={setManning}/>
                            </Grid>
                        );
                    }
                })}
            </Grid>
        );
    };

    return (
        <Grid container direction="column" height="100vh" width="100vw" justifyContent="center" alignItems="center" spacing={2} wrap="nowrap">
            {renderMannings(piritManning)}
        </Grid>
    );
}


export default Pirit;