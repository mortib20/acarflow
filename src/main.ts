//@ts-check
import dgram from 'dgram';
import dotenv from 'dotenv';
import { StatsD } from 'node-statsd';
import path from 'path';
import { Server } from "socket.io";
import { isHFDL, isOldAcars, isSATCOM, isVDL2 } from './check';
import Logger from "./class/logger";
import Config from "./interface/config";
import HFDL from './interface/hfdl';
import Satcom from './interface/satcom';
import VDL2 from './interface/vdl2';
import { MakeHFDLMessage, MakeOldAcarsMessage, MakeSATCOMMessage, MakeVDL2Message } from './make';
import Message from './interface/message';
import Position from './interface/position';
import TLAcars from './interface/acars';

/* Environment */
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/* Config */
const config: Config = {
    output: {
        port: Number(process.env.OUTPUT_PORT) || 21001
    },
    input: {
        port: Number(process.env.INPUT_PORT) || 21000
    },
    stats: {
        host: process.env.STATS_HOST || "127.0.0.1",
        port: Number(process.env.STATS_PORT) || 8125
    }
}

/* Logger */
const logger = new Logger();

/* Console Stats */
var constats = {
    msgs: 0,
    types: { VDL2: 0, SATCOM: 0, HFDL: 0, ACARS: 0 }
}

setInterval(() => {
    logger.info(`STATS: MSGS: ${constats.msgs} (VDL2: ${constats.types.VDL2}, SATCOM: ${constats.types.SATCOM}, HFDL: ${constats.types.HFDL}, ACARS: ${constats.types.ACARS})`)
    constats = {
        msgs: 0, types: { VDL2: 0, SATCOM: 0, HFDL: 0, ACARS: 0 }
    }
}, 600000); // 10min

/* Stats */
const stats = new StatsD(config.stats.host, config.stats.port);

/* Output */
const output = new Server(config.output.port);
output.listen(3000)
logger.info(`OUTPUT: Should listen on port :${config.output.port}`);


/* Input */
const input = dgram.createSocket('udp4');
input.bind(config.input.port);

input.on('listening', async () => logger.info(`INPUT: Listening on port :${config.input.port}`));

input.on('message', HandleMessage)

async function HandleMessage(msg: Buffer, rinfo: dgram.RemoteInfo) {
    try {
        const json = JSON.parse(msg.toString('utf-8'));
        let outputMsg: any = undefined;;

        if (isVDL2(json)) {
            let vdl2 = json.vdl2 as VDL2;
            //logger.info(`VDL2 with ACARS`);
            stats.histogram(`vdl2.${vdl2.station}.${vdl2.freq}`, 1);
            stats.increment(`count.vdl2.${vdl2.station}.${vdl2.freq}`, 1);

            constats.msgs++;
            constats.types.VDL2++;
            outputMsg = MakeVDL2Message(json.vdl2);
        }

        if (isSATCOM(json)) {
            let satcom = json as Satcom;
            //logger.info(`SATCOM with ACARS`);
            stats.histogram(`satcom.${satcom.station}.${satcom.app.ver}`, 1);
            stats.increment(`count.satcom.${satcom.station}.${satcom.app.ver}`, 1);

            constats.msgs++;
            constats.types.SATCOM++;
            outputMsg = MakeSATCOMMessage(satcom);
        }

        if (isHFDL(json)) {
            let hfdl = json.hfdl as HFDL;
            //logger.info(`HFDL with ACARS`);
            stats.histogram(`hfdl.${hfdl.station}.${hfdl.freq}`, 1);
            stats.increment(`count.hfdl.${hfdl.station}.${hfdl.freq}`, 1);

            constats.msgs++;
            constats.types.HFDL++;
            outputMsg = MakeHFDLMessage(hfdl);
        }

        if (isOldAcars(json)) {
            let acars = json as TLAcars;
            //logger.info(`ACARS with ACARS`);
            stats.histogram(`acars.${acars.station_id}.${acars.freq}`, 1);
            stats.increment(`count.acars.${acars.station_id}.${acars.freq}`, 1);

            constats.msgs++;
            constats.types.ACARS++;
            outputMsg = MakeOldAcarsMessage(acars);
        }

        if (outputMsg) {
            //logger.info("Message emitted");
            output.emit('NewData', outputMsg);

            //const pos = DetectPosition(outputMsg);
            //if(pos) {
            //    stats.gauge("position.lat", pos.lat);
            //    stats.gauge("position.lon", pos.lon);
            //}
        }
    } catch (err) {
        logger.error((err as Error).message);
    }
}

function DetectPosition(msg: Message) {
    const label = msg.acars.label;
    const msg_text = msg.acars.msg_text;

    if (['10', '16', '17', '24', '41', '42', '44', '36', '2P', '80', 'H1', '1P', '2P'].includes(label)) {
      const posRegx = [
        /N ([0-9]{2,3}.[0-9]{0,4})\DE[\s]{1,2}([0-9]{1,3}.[0-9]{0,4})/, // N 50.465,E 10.226
        /N[0]{0,3}([0-9]{1,2}.[0-9]{1,3})\WE[0]{0,3}([0-9]{1,2}.[0-9]{1,3})/, // N49.38/E009.62
        /,[ ]{1,2}([0-9]{2}.[0-9]{1,3}),[ ]{1,2}([0-9]{2}.[0-9]{1,3})/, //, 49.33,  11.40
      ];

      for (let regex of posRegx) {
        let match = msg_text.match(regex);
          if (match) return { lat: Number(match[1]), lon: Number(match[2]) } as Position;
      }
    }

    return null;
  }