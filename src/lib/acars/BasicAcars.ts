import Acarsdec from './Acarsdec'
import DumpHfdl from './DumpHfdl'
import DumpVdl2 from './DumpVdl2'
import Jaero from './Jaero'

export default class BasicAcars {
    constructor(public type: string, public channel: string, public receiver: string, public timestamp: number, public label: string, public text: string, public reg: string, public flight: string, public icao: string) {
    }

    public static fromDumpVDL2(dumpvdl2: DumpVdl2): BasicAcars {
        const type = 'dumpvdl2'
        const freq = dumpvdl2.vdl2.freq.toString()
        const station = dumpvdl2.vdl2.station
        const timestamp = dumpvdl2.vdl2.t.sec
        const label = dumpvdl2.vdl2.avlc.acars.label
        const msg_text = dumpvdl2.vdl2.avlc.acars.msg_text
        const reg = dumpvdl2.vdl2.avlc.acars.reg
        const flight = dumpvdl2.vdl2.avlc.acars.flight
        const addr = dumpvdl2.vdl2.avlc.src.addr

        return new BasicAcars(type, freq, station, timestamp, label, msg_text, reg, flight, addr)
    }

    public static fromDumpHFDL(dumphfdl: DumpHfdl) {
        const type = 'dumphfdl'
        const freq = dumphfdl.hfdl.freq.toString()
        const station = dumphfdl.hfdl.station
        const timestamp = dumphfdl.hfdl.t.sec
        const label = dumphfdl.hfdl.lpdu.hfnpdu.acars.label
        const msg_text = dumphfdl.hfdl.lpdu.hfnpdu.acars.msg_text
        const reg = dumphfdl.hfdl.lpdu.hfnpdu.acars.reg
        const flight = dumphfdl.hfdl.lpdu.hfnpdu.acars.flight
        const addr = dumphfdl.hfdl.lpdu.src.ac_info?.icao || ''

        return new BasicAcars(type, freq, station, timestamp, label, msg_text, reg, flight, addr)
    }

    public static fromAcarsdec(acarsdec: Acarsdec) {
        const type = 'acarsdec'
        const freq = acarsdec.freq.toString().replace('.', '') + '000'
        const station = acarsdec.station_id
        const timestamp = acarsdec.timestamp
        const label = acarsdec.label
        const msg_text = acarsdec.text
        const reg = acarsdec.tail
        const flight = acarsdec.flight
        const addr = ''

        return new BasicAcars(type,freq, station, timestamp, label, msg_text, reg, flight, addr)
    }

    public static fromJaero(jaero: Jaero) {
        const type = 'jaero'
        const freq = jaero.app.ver
        const station = jaero.station
        const timestamp = jaero.t.sec
        const label = jaero.isu.acars.label
        const msg_text = jaero.isu.acars.msg_text
        const reg = jaero.isu.acars.reg
        const flight = ''
        const addr = jaero.isu.dst.addr

        return new BasicAcars(type,freq, station, timestamp, label, msg_text, reg, flight, addr)
    }
}