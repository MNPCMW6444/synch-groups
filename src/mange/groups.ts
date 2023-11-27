export interface Yaba {
    room25: {
        manager: { back: string },
        movDirector: { back: string },
        fDirector: { back: string },
        roomOperator: { operator: string },
        fHigh: { back: string, front: string, operator: string },
        fLow: { back: string, front: string, operator: string },
        treasure1: { front: string },
        treasure2: { front: string },
        treasure3: { front: string },
        treasure5: { front: string },
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
            tStand: {
                front: string,
            },
            treasure4: { front: string }
        },
    },
    room12: {
        manager: { back: string },
        seaDirector: { back: string },
        groundDirector: { back: string },
        bayDirector: { back: string },
        // sitting....
        interA: { front: string, operator: string },
        interB: { front: string, operator: string },
        interC: { front: string, operator: string },
        interD: { front: string, operator: string },
        interE: { front: string, operator: string },
        interF: { front: string, operator: string },
        interG: { front: string, operator: string },
    }
}

