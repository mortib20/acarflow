export default interface DumpVdl2 {
    vdl2: Vdl2
}

export interface Vdl2 {
    app: App
    station: string
    t: T
    freq: number
    burst_len_octets: number
    hdr_bits_fixed: number
    octets_corrected_by_fec: number
    idx: number
    sig_level: number
    noise_level: number
    freq_skew: number
    avlc: Avlc
}

export interface App {
    name: string
    ver: string
}

export interface T {
    sec: number
    usec: number
}

export interface Avlc {
    src: Src
    dst: Dst
    cr: string
    frame_type: string
    rseq: number
    sseq: number
    poll: boolean
    acars: Acars
}

export interface Src {
    addr: string
    type: string
    status: string
}

export interface Dst {
    addr: string
    type: string
}

export interface Acars {
    err: boolean
    crc_ok: boolean
    more: boolean
    reg: string
    mode: string
    label: string
    blk_id: string
    ack: string
    flight: string
    msg_num: string
    msg_num_seq: string
    msg_text: string
}
