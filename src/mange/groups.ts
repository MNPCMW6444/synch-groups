/*export interface YabaEng {
    room25: {
        manager: string,
        movDirector: string,
        fDirector: string,
        roomOperator: string,
        fHigh: { back: string, front: string, operator: string },
        fLow: { back: string, front: string, operator: string },
        treasure1: string,
        treasure2: string,
        treasure3: string,
        treasure5: string,
        hStand1: { back: string, front: string, operator: string },
        hStand2: { back: string, front: string, operator: string },
        hStand4: { back: string, front: string, operator: string },
        stayingStand: { back: string, front: string, operator: string },
        doubleStayingStand: { back: string, front: string, operator: string },
        rescueTeam: {
            hStand: {
                back: string,
                front: string,
                operator: string,
            },
            fStand: {
                back: string,
                front: string,
                operator: string,
            },
            tStand: string,
            treasure4: string
        },
    },
    room12: {
        manager: string,
        seaDirector: string,
        groundDirector: string,
        bayDirector: string,
        // sitting....
        interA: { front: string, operator: string },
        interB: { front: string, operator: string },
        interC: { front: string, operator: string },
        interD: { front: string, operator: string },
        interE: { front: string, operator: string },
        interF: { front: string, operator: string },
        interG: { front: string, operator: string },
    }
}*/



export interface Yaba {
    "מכלול 25": {
        "מנהל": string,
        "מע ת": string,
        "מע ק": string,
        "משק מכלולי": string,
        "מהיר גבוה": { "אחורי": string, "קדמי": string, "מפעיל": string },
        "מהיר נמוך": { "אחורי": string, "קדמי": string, "מפעיל": string },
        "אוצר1": string,
        "אוצר2": string,
        "אוצר3": string,
        "אוצר5": string,
        "מרחפים1": { "אחורי": string, "קדמי": string, "מפעיל": string },
        "מרחפים2": { "אחורי": string, "קדמי": string, "מפעיל": string },
        "מרחפים4": { "אחורי": string, "קדמי": string, "מפעיל": string },
        "שוהות": { "אחורי": string, "קדמי": string, "מפעיל": string },
        "פיצול שוהות": { "אחורי": string, "קדמי": string, "מפעיל": string },
        "צוות מסער": {
            "מסער": { "אחורי": string, "קדמי": string, "מפעיל": string, },
            "חצ/סי": { "אחורי": string, "קדמי": string, "מפעיל": string, },
            "אוצר4": string
        },
    },
    "מכלול 12": {
        "מנהל": string,
        "מע ים": string,
        "מי יבשה": string,
        "מע מפרץ": string,
// sitting....
        "ירוט א": { "קדמי": string, "מפעיל": string },
        "ירוט ב": { "קדמי": string, "מפעיל": string },
        "ירוט ג": { "קדמי": string, "מפעיל": string },
        "ירוט ד": { "קדמי": string, "מפעיל": string },
        "ירוט ה": { "קדמי": string, "מפעיל": string },
        "ירוט ו": { "קדמי": string, "מפעיל": string },
        "ירוט ז": { "קדמי": string, "מפעיל": string },
    }
}