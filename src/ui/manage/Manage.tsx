import {Box} from "@mui/material";
import Pirit from "./Pirit/Pirit.tsx";
import useSync from "../../hooks/useSync.ts";
import {useEffect, useState} from "react";
import {Yaba} from "../../index";

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

const Manage = () => {
    const {users} = useSync()
    const [piritManning, setPiritManning] = useState<Yaba[]>([]);
    const [index, setIndex] = useState<number>(0);

    useEffect(() => {
        if(index>piritManning.length-1){
            setPiritManning(prevState => [...prevState, EMPTY_YABA])
        }
    },[index]);

    return <Box overflow="scroll" padding="5%">
        <Pirit piritManning={piritManning[index]} index={index} setIndex={setIndex} setPiritManning={setPiritManning} users={users}/>
    </Box>
}

export default Manage;



