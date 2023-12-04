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

    // Helper function to collect all profiles in a branch
    const collectProfiles = (obj: any): string[] => {
        let profiles:string[] = [];
        if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach(key => {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    profiles = profiles.concat(collectProfiles(obj[key]));
                } else {
                    profiles.push(obj[key]);
                }
            });
        } else {
            profiles.push(obj);
        }
        return profiles;
    };

    const traverse = (obj: any, prefix: string = '') => {
        Object.keys(obj).forEach(key => {
            const newPrefix = prefix ? `${prefix}/${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                // Add the current node to the array with all its profiles
                arr.push({ display_name: newPrefix, profiles: collectProfiles(obj[key]) });
                // Continue traversing deeper
                traverse(obj[key], newPrefix);
            }
        });
    }
    traverse(yaba);
    return arr;
}

export const arrayToYaba = (arr: Group[]): Yaba => {
    const yaba = JSON.parse(JSON.stringify(EMPTY_YABA)); // Initialize the Yaba structure

    // Helper function to set profiles at the correct node
    const setProfiles = (ref: any, keys: string[], profiles: string[], currentIndex: number = 0) => {
        if (currentIndex === keys.length - 1) {
            ref[keys[currentIndex]] = profiles;
        } else {
            if (!ref[keys[currentIndex]]) ref[keys[currentIndex]] = {};
            setProfiles(ref[keys[currentIndex]], keys, profiles, currentIndex + 1);
        }
    };

    arr.forEach(item => {
        const keys = item.display_name.split('/');
        setProfiles(yaba, keys, item.profiles);
    });

    return yaba;
};

