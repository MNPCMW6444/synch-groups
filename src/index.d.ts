import {EMPTY_YABA} from "./util/yabaAndGroups.ts";

export type Yaba = typeof EMPTY_YABA

interface Member {
    id: string,
    manager: boolean
}

interface Group {
    display_name: string,
    profiles: string[]
}


export interface GroupCreationRequest {
    organization_id: string;
    display_name: string
    description?: string
    client_field?: string
    media: "audio" | "video"
    department: string
    priority: 1 | 2 | 3 | 4 | 5
    ptt_lock: boolean
    members: Member[]
}