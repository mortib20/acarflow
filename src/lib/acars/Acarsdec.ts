export default interface Acarsdec {
    ack: boolean
    app: App
    assstat: string
    block_id: string
    channel: number
    error: number
    flight: string
    freq: number
    label: string
    level: number
    mode: string
    msgno: string
    station_id: string
    tail: string
    text: string
    timestamp: number
}

export interface App {
    name: string
    ver: string
}

export interface CurrentLink {
    code: string
    descr: string
    established: boolean
    time: Time
}

export interface Time {
    hour: number
    min: number
    sec: number
}

export interface LinksAvail {
    code: string
    descr: string
}
