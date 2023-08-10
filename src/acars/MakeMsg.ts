import TLAcars from "./interface/ACARS";
import HFDL from "./interface/HFDL";
import Satcom from "./interface/SATCOM";
import VDL2 from "./interface/VDL2";

import { Destination, Source, Time } from "./interface/JsonBase";

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
    type: 'VDL2' | 'SATCOM' | 'HFDL' | 'ACARS';
    src: Source;
    dst: Destination;
    t: Time;
    acars: Acars;

    constructor(type: 'VDL2' | 'SATCOM' | 'HFDL' | 'ACARS', src: Source, dst: Destination, t: Time, acars: Acars) {
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

export function MakeVDL2Message(vdl2: VDL2) {
    const src = {
        addr: vdl2.avlc.src.addr,
        type: vdl2.avlc.src.type
    };

    const dst = {
        addr: vdl2.avlc.dst.addr,
        type: vdl2.avlc.dst.type
    }

    const t = {
        sec: vdl2.t.sec,
        usec: vdl2.t.usec
    }

    const acars = {
        msg_text: vdl2.avlc.acars.msg_text,
        msg_num: vdl2.avlc.acars.msg_num,
        msg_num_seq: vdl2.avlc.acars.msg_num_seq,
        mode: vdl2.avlc.acars.mode,
        label: vdl2.avlc.acars.label,
        reg: vdl2.avlc.acars.reg,
        flight: vdl2.avlc.acars.flight
    };

    return new Message('VDL2', src, dst, t, acars);
}

export function MakeSATCOMMessage(satcom: Satcom) {
    const src = {
        addr: satcom.isu.src.addr,
        type: satcom.isu.src.type
    };

    const dst = {
        addr: satcom.isu.dst.addr,
        type: satcom.isu.dst.type
    }

    const t = {
        sec: satcom.t.sec,
        usec: satcom.t.usec
    }

    const acars = {
        msg_text: satcom.isu.acars.msg_text,
        mode: satcom.isu.acars.mode,
        label: satcom.isu.acars.label,
        reg: satcom.isu.acars.reg,
        msg_num_seq: undefined,
        msg_num: undefined,
        flight: undefined
    };

    return new Message('SATCOM', src, dst, t, acars);
}

export function MakeHFDLMessage(hfdl: HFDL) {
    const src = {
        addr: hfdl.lpdu.src.id.toString(),
        type: hfdl.lpdu.src.type
    };

    const dst = {
        addr: hfdl.lpdu.dst.id.toString(),
        type: hfdl.lpdu.dst.type
    }

    const t = {
        sec: hfdl.t.sec,
        usec: hfdl.t.usec
    }

    const acars = {
        msg_text: hfdl.lpdu.hfnpdu.acars.msg_text,
        mode: hfdl.lpdu.hfnpdu.acars.mode,
        label: hfdl.lpdu.hfnpdu.acars.label,
        reg: hfdl.lpdu.hfnpdu.acars.reg,
        msg_num_seq: hfdl.lpdu.hfnpdu.acars.msg_num_seq,
        msg_num: hfdl.lpdu.hfnpdu.acars.msg_num,
        flight: hfdl.lpdu.hfnpdu.acars.flight
    };

    return new Message('HFDL', src, dst, t, acars);
}

export function MakeOldAcarsMessage(tlacars: TLAcars) {
    const src = {
        addr: "",
        type: ""
    };

    const dst = {
        addr: "",
        type: ""
    }

    const t = {
        sec: tlacars.timestamp,
        usec: 0
    }

    const acars = {
        msg_text: tlacars.text,
        mode: tlacars.mode,
        label: tlacars.label,
        reg: tlacars.tail,
        msg_num_seq: "",
        msg_num: tlacars.msgno,
        flight: tlacars.flight
    };

    return new Message('ACARS', src, dst, t, acars);
}