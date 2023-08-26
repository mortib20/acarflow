import { AcarsType } from "./acars/TypesEnum";
import { MakeHFDLMessage, MakeOldAcarsMessage, MakeSATCOMMessage, MakeVDL2Message } from "./acars/MakeMsg";
import { StatsD } from "node-statsd";
import HFDL from "./acars/interface/HFDL";
import SATCOM from "./acars/interface/SATCOM";
import VDL2 from "./acars/interface/VDL2";
import TLACARS from "./acars/interface/ACARS";
import Output from "./class/output/TcpOutput";
import IOutput from "./interface/IOutput";

export function SendMessage(outs: IOutput[], data: Buffer) {
    outs.forEach(out => {
        out.Send(data);
    })
}

export function IncreaseStats(stats: StatsD, type: AcarsType, json: any) {
    switch (type) {
        case AcarsType.ACARS:
            const acars = json as TLACARS;
            stats.histogram(`acars.${acars.station_id}.${acars.freq}`, 1);
            stats.increment(`count.acars.${acars.station_id}.${acars.freq}`, 1);
            break;
        case AcarsType.VDL2:
            const vdl2 = json.vdl2 as VDL2;
            stats.histogram(`vdl2.${vdl2.station}.${vdl2.freq}`, 1);
            stats.increment(`count.vdl2.${vdl2.station}.${vdl2.freq}`, 1);
            break;
        case AcarsType.HFDL:
            const hfdl = json.hfdl as HFDL;
            stats.histogram(`hfdl.${hfdl.station}.${hfdl.freq}`, 1);
            stats.increment(`count.hfdl.${hfdl.station}.${hfdl.freq}`, 1);
            break;
        case AcarsType.SATCOM:
            const satcom = json as SATCOM;
            stats.histogram(`satcom.${satcom.station}.${satcom.app.ver}`, 1);
            stats.increment(`count.satcom.${satcom.station}.${satcom.app.ver}`, 1);
            break;
    }
}

export function MakeWsMessage(type: AcarsType, json: any) {
    switch (type) {
        case AcarsType.ACARS:
            return MakeOldAcarsMessage(json);
        case AcarsType.VDL2:
            return MakeVDL2Message(json.vdl2);
        case AcarsType.HFDL:
            return MakeHFDLMessage(json.hfdl);
        case AcarsType.SATCOM:
            return MakeSATCOMMessage(json);
        default:
            return null;
    }
}
