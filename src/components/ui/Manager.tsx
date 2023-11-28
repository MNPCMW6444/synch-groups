import {Button, Grid, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {Yaba} from "../../index";
import {ArrowBack, ArrowForward} from "@mui/icons-material";
import ManningSelector from "./manager/ManningSelector.tsx";

const EMPTY_YABA = {
    "מכלול 25": {
        "צוות מסער": {
            "מסער": {"אחורי": "", "קדמי": "", "מפעיל": "",},
            "חצ/סי": {"אחורי": "", "קדמי": "", "מפעיל": "",},
            "אוצר4": ""
        },
        "ניהול": {
            "מנהל": "",
            "מע ת": "",
            "מע ק": "",
            "משק מכלולי": "",
        },
        "2 עמדות שוהות": {
            "שוהות": {"אחורי": "", "קדמי": "", "מפעיל": ""},
            "פיצול שוהות": {"אחורי": "", "קדמי": "", "מפעיל": ""},
        },
        "2 עמדות מהירות": {

            "מהיר גבוה": {"אחורי": "", "קדמי": "", "מפעיל": ""},
            "מהיר נמוך": {"אחורי": "", "קדמי": "", "מפעיל": ""},
        },
        "3 עמדות מרחפים": {
            "מרחפים1": {"אחורי": "", "קדמי": "", "מפעיל": ""},
            "מרחפים2": {"אחורי": "", "קדמי": "", "מפעיל": ""},
            "מרחפים4": {"אחורי": "", "קדמי": "", "מפעיל": ""},
        },
        "4 אוצרות": {
            "אוצר1": "",
            "אוצר2": "",
            "אוצר3": "",
            "אוצר5": "",
        }
    },
    "מכלול 12": {
        "ניהול": {
            "מנהל": "",
            "מע ים": "",
            "מי יבשה": "",
            "מע מפרץ": "",
        },
// sitting....
        "ירוט א": {"קדמי": "", "מפעיל": ""},
        "ירוט ב": {"קדמי": "", "מפעיל": ""},
        "ירוט ג": {"קדמי": "", "מפעיל": ""},
        "ירוט ד": {"קדמי": "", "מפעיל": ""},
        "ירוט ה": {"קדמי": "", "מפעיל": ""},
        "ירוט ו": {"קדמי": "", "מפעיל": ""},
        "ירוט ז": {"קדמי": "", "מפעיל": ""},
    }
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


const Manager = ({users}:any) => {

    const [piritManning, setPiritManning] = useState<Yaba[]>([]);
    const [index, setIndex] = useState<number>(0);

    useEffect(() => {
        if (index > piritManning.length - 1) {
            setPiritManning([...piritManning, EMPTY_YABA])
        }
    }, [index]);


    const setManning = (path: string[], id: string) => {
        setPiritManning(prevState => {
            const newArray = JSON.parse(JSON.stringify(prevState));
            const newState = JSON.parse(JSON.stringify(prevState[index]));
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
                            <Button disabled={index === 0} onClick={() => setIndex(i => i - 1)}
                                    variant="contained"><ArrowForward/></Button>
                        </Grid>
                        <Grid item>
                            <Button onClick={() => setIndex(i => i + 1)} variant="contained"><ArrowBack/></Button>
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
                                <ManningSelector path={path.concat(key)} value={mannings[key]} users={users}
                                                 setManning={setManning}/>
                            </Grid>
                        );
                    }
                })}
            </Grid>
        );
    };

    const send = () => {
    }
    const save = () => {
    }


    return (
        <Grid container direction="column" justifyContent="center"
              alignItems="center" spacing={2} wrap="nowrap">
            {piritManning[index] && renderMannings(piritManning[index])}
            <Grid item>
                <Button sx={{padding: "30px 50px", margin: "20px", fontSize: "200%"}} variant="contained"
                        onClick={index === 0 ? send : save}>
                    {index === 0 ? "שא - גר" : "שמור תכנון"}
                </Button>
            </Grid>
        </Grid>
    );
}


export default Manager;