import { Source, Destination, UDPBase, Time } from './generic';

interface Acars {
    ack: string;
    blk_id: string;
    label: string;
    mode: string;
    msg_text: string;
    reg: string;
}

interface Isu {
    qno: string;
    refno: string

    acars: Acars;
    dst: Destination;
    src: Source;
}

export default interface Satcom extends UDPBase {
    isu: Isu;
    t: Time;
}