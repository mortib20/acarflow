export default interface DumpHfdl {
    hfdl: Hfdl
}

export interface Hfdl {
    app: App
    bit_rate: number
    freq: number
    freq_skew: number
    lpdu: Lpdu
    noise_level: number
    sig_level: number
    slot: string
    station: string
    t: T
}

export interface App {
    name: string
    ver: string
}

export interface Lpdu {
    dst: Dst
    err: boolean
    hfnpdu: Hfnpdu
    src: Src
    type: Type2
}

export interface Dst {
    id: number
    type: string
}

export interface Hfnpdu {
    acars: Acars
    err: boolean
    type: Type
}

export interface Acars {
    ack: string
    blk_id: string
    crc_ok: boolean
    err: boolean
    flight: string
    label: string
    "media-adv": MediaAdv
    mode: string
    more: boolean
    msg_num: string
    msg_num_seq: string
    msg_text: string
    reg: string
}

export interface MediaAdv {
    current_link: CurrentLink
    err: boolean
    links_avail: LinksAvail[]
    version: number
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

export interface Type {
    id: number
    name: string
}

export interface Src {
    ac_info: AcInfo
    id: number
    type: string
}

export interface AcInfo {
    icao?: string
}

export interface Type2 {
    id: number
    name: string
}

export interface T {
    sec: number
    usec: number
}
