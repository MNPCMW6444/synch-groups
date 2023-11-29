import {Group, Yaba} from "../index";

export const EMPTY_YABA = {
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

export const yabaToArray = (yaba: Yaba): Group[] => {
    const arr: Group[] = [];
    const traverse = (obj: any, prefix: string = '') => {
        Object.keys(obj).forEach(key => {
            const newPrefix = prefix ? `${prefix}/${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                traverse(obj[key], newPrefix);
            } else {
                arr.push({display_name: newPrefix, profiles: obj[key]});
            }
        });
    }
    traverse(yaba);
    return arr;
}


export const arrayToYaba = (arr: Group[]): Yaba => {
    const yaba = EMPTY_YABA; // Initialize the Yaba structure

    arr.forEach(item => {
        const keys = item.display_name.split('/');
        let ref: any = yaba;
        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                ref[key] = item.profiles;
            } else {
                if (!ref[key]) ref[key] = {};
                ref = ref[key];
            }
        });
    });
    return yaba;
}
