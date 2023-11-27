import {Button, Grid, Typography} from "@mui/material";
import ManningSelector, {User} from "./manning/ManningSelector.tsx";
import {Dispatch, SetStateAction} from "react";
import {Yaba} from "../../../index";
import {ArrowBack, ArrowForward} from "@mui/icons-material";

interface PiritProps {
    piritManning?: Yaba
    index: number
    setIndex: Dispatch<SetStateAction<number>>
    setPiritManning: Dispatch<SetStateAction<Yaba[]>>
    users: User[]
}

const getPirit = (shifter: number): string => {
    const now = new Date();
    const hours = [1, 4, 7, 10, 13, 16, 19, 22];
    let lastHour = hours[hours.length - 1];

    // Find the last rounded hour that matches one of the specified hours
    for (let i = 0; i < hours.length; i++) {
        if (now.getHours() >= hours[i]) {
            lastHour = hours[i];
        } else {
            break;
        }
    }

    // Apply the shifter
    const startHourIndex = (hours.indexOf(lastHour) + shifter) % hours.length;
    const endHourIndex = (startHourIndex + 1) % hours.length;
    const startHour = hours[startHourIndex];
    const endHour = hours[endHourIndex];

    // Format time
    const formatTime = (hour: number) => hour.toString().padStart(2, '0') + ':00';
    return formatTime(startHour) + ' - ' + formatTime(endHour);
}


const Pirit = ({piritManning, index,setIndex, setPiritManning, users}: PiritProps) => {


    const setManning = (path: string[], id: string) => {
        setPiritManning(prevState => {
            debugger;
            const newArray = [...prevState];
            const newState = {...prevState[index]};
            let currentLevel: any = newState;
            for (let i = 0; i < path.length - 1; i++) {
                currentLevel = currentLevel[path[i]];
            }
            currentLevel[path[path.length - 1]] = id;
            newArray[index] = newState;
            return newArray
        });
    };

    const renderMannings = (mannings: any, path: string[] = [], depth: number = 0) => {
        const isLastLevel = Object.values(mannings).every(value => typeof value !== 'object' || value === null);

        // Set direction based on whether it's the last level or not
        const direction = isLastLevel ? "row" : "column";
        const header = <Typography variant={("h" + (depth + 3)) as any}>
            {path[path.length - 1] || "איוש לפיריט " + getPirit(index) + ": "}
        </Typography>;

        return (
            <Grid item container key={path.concat(depth + "").join("_")} direction={direction}
                  justifyContent="center"
                  alignItems="center" spacing={1}>
                {path.length > 0 ? header :
                    <Grid item container justifyContent="center" alignItems="center" columnSpacing={2}
                          key={path.concat(depth + "x").join("_")}>
                        <Grid item>
                            {header}
                        </Grid>
                        <Grid item>
                            <Button disabled={index===0} onClick={()=>setIndex(i=>i-1)} variant="contained"><ArrowForward/></Button>
                        </Grid>
                        <Grid item>
                            <Button onClick={()=>setIndex(i=>i+1)} variant="contained"><ArrowBack/></Button>
                        </Grid>
                    </Grid>}
                {Object.keys(mannings).map(key => {
                    if (typeof mannings[key] === 'object' && mannings[key] !== null) {
                        // Recursive call for nested objects
                        return renderMannings(mannings[key], path.concat(key), depth + 1);
                    } else {
                        // Handling non-object values (i.e., your leaf nodes)
                        return (
                            <Grid item key={path.concat(key).join("_")}
                                  sx={{padding: '8px', minWidth: '250px', minHeight: '100px'}}>
                                <Typography variant={("h" + (depth + 4)) as any}>
                                    {key}
                                </Typography>
                                <ManningSelector path={path.concat(key)} users={users} setManning={setManning}/>
                            </Grid>
                        );
                    }
                })}
            </Grid>
        );
    };


    return (
        <Grid container direction="column" justifyContent="center"
              alignItems="center" spacing={2} wrap="nowrap">
            {piritManning && renderMannings(piritManning)}
            {index === 0 && <Grid item>
                <Button sx={{padding: "30px 50px", margin: "20px", fontSize: "200%"}} variant="contained">
                    שא-גר
                </Button>
            </Grid>}
        </Grid>
    );
}


export default Pirit;