import { Destination, Source, Time } from "./generic";

interface Acars {
    label: string;
    msg_text: string;
    mode: string;
    msg_num: string | undefined;
    msg_num_seq: string | undefined;
    flight: string | undefined;
    reg: string | undefined;
}

export default class Message {
    type: 'VDL2' | 'SATCOM' | 'HFDL';
    src: Source;
    dst: Destination;
    t: Time;
    acars: Acars;

    constructor(type: 'VDL2' | 'SATCOM' | 'HFDL', src: Source, dst: Destination, t: Time, acars: Acars) {
        this.type = type;
        this.src = src;
        this.dst = dst;
        this.t = t;
        this.acars = acars;
    }

    setDestination(addr: string, type: string) {
        this.dst.addr = addr;
        this.dst.type = type;

        return this;
    }
}