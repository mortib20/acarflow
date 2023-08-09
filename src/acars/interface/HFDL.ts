import { Time, UDPBase } from "./JsonBase";

interface Acars {
    err: boolean;
    crc_ok: boolean;
    more: boolean;
    reg: string;
    mode: string;
    label: string;
    blk_id: string;
    ack: string;
    flight: string;
    msg_num: string;
    msg_num_seq: string;
    msg_text: string;
}

interface Type {
    id: number;
    name: string;
}

interface Hfnpdu {
    err: boolean;
    type: Type;
    acars: Acars;
}

interface Source {
    type: string;
    id: number;
}

interface Destination {
    type: string;
    id: number;
}

interface Lpdu {
    src: Source;
    dst: Destination;
    error: boolean;
    hfnpdu: Hfnpdu
}

export default interface HFDL extends UDPBase {
    t: Time;
    freq: number;
    bit_rate: number;
    sig_level: number;
    noise_lebel: number;
    freq_skew: number;
    slot: string;
    lpdu: Lpdu;
}