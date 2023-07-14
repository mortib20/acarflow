import { Destination, Source, Time, UDPBase } from './generic';

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
    sublabel: string;
    msg_text: string;
}

interface Avlc {
    cr: string;
    frame_type: string;
    rseq: number;
    sseq: number;
    poll: boolean;
    src: Source;
    dst: Destination;
    acars: Acars;
}

export default interface VDL2 extends UDPBase {
    freq: number;
    burst_len_octets: number;
    hdr_bits_fixed: number;
    octets_corrected_by_fec: number;
    idx: number;
    sig_level: number;
    noise_level: number;
    freq_skew: number;

    avlc: Avlc;
    t: Time;
}