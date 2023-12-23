import {Group} from "../index";

export const EMPTY_YABA = {
    "מכלול 25": {
        "צוות למסער":
            {
                "מסער 1":
                    {
                        "אחורי":
                            "", "קדמי":
                            "", "מפעיל":
                            "",
                    }
                ,
                "מסער 2":
                    {
                        "אחורי":
                            "", "קדמי":
                            "", "מפעיל":
                            "",
                    }
                ,
                "פיצול בת״ק":
                    {
                        "אחורי":
                            "", "קדמי":
                            "", "מפעיל":
                            "",
                    }
                ,
                "פיצול שוהות":
                    {
                        "קדמי":
                            "", "מפעיל":
                            "",
                    }
                ,
                "אוצר 2":
                    {
                        "בקר":
                            ""
                    }
                ,
                "אוצר 3":
                    {
                        "בקר":
                            ""
                    }
                ,
                "מ״ע תמרון":
                    {
                        "בקר":
                            ""
                    }
                ,
                "מסק״ר 2":
                    {
                        "אחורי":
                            "",
                        "קדמי":
                            "",
                        "מפעיל":
                            ""
                    }
                ,
            }
    }
}

export const yabaToArray = (yaba: typeof EMPTY_YABA): Group[] => {
    const arr: Group[] = [];

    // Helper function to collect all profiles in a branch
    const collectProfiles = (obj: any): string[] => {
        let profiles: string[] = [];
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
                arr.push({display_name: newPrefix, profiles: collectProfiles(obj[key])});
                // Continue traversing deeper
                traverse(obj[key], newPrefix);
            }
        });
    }
    traverse(yaba);
    return arr;
}

export const arrayToYaba = (arr: Group[]): typeof EMPTY_YABA => {
    const yaba = JSON.parse(JSON.stringify(EMPTY_YABA)); // Clone the EMPTY_YABA object

    arr.forEach(group => {
        const paths = group.display_name.split('/');
        let current: any = yaba;

        paths.forEach((path, index) => {
            // Check if we are at the last element of the path
            if (index === paths.length - 1) {
                // If the group has profiles, assign them to the leaf node
                if (Array.isArray(group.profiles) && group.profiles.length > 0) {
                    current[path] = group.profiles;
                } else {
                    // If no profiles, ensure the path leads to an object (non-leaf node)
                    if (!current[path] || typeof current[path] !== 'object') {
                        current[path] = {};
                    }
                }
            } else {
                // For non-leaf nodes, ensure the node exists and is an object
                if (!current[path]) {
                    current[path] = {};
                }
                // Move to the next level in the hierarchy
                current = current[path];
            }
        });
    });
    Object.keys(yaba).forEach(resKey => {
        if (!Object.keys(EMPTY_YABA).some(key => key === resKey)) delete yaba[resKey]
    })
    return yaba;
};





