//@ts-check
import dgram from 'dgram';
import dotenv from 'dotenv';
import { StatsD } from 'node-statsd';
import path from 'path';
import { Server } from "socket.io";
import { isHFDL, isSATCOM, isVDL2 } from './check';
import Logger from "./class/logger";
import Config from "./interface/config";
import HFDL from './interface/hfdl';
import Satcom from './interface/satcom';
import VDL2 from './interface/vdl2';
import { MakeHFDLMessage, MakeSATCOMMessage, MakeVDL2Message } from './make';

/* Environment */
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
console.log(process.env);

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
    types: {
        VDL2: 0,
        SATCOM: 0,
        HFDL: 0
    }
}

setInterval(() => {
    logger.info(`STATS: MSGS: ${constats.msgs} (VDL2: ${constats.types.VDL2}, SATCOM: ${constats.types.SATCOM}, HFDL: ${constats.types.HFDL})`)
    constats = {
        msgs: 0, types: { VDL2: 0, SATCOM: 0, HFDL: 0 }
    }
}, 60000);

/* Stats */
const stats = new StatsD(config.stats.host, config.stats.port);

/* Output */
const output = new Server(config.output.port);
logger.info(`OUTPUT: Should listen on port :${config.output.port}`);


/* Input */
const input = dgram.createSocket('udp4');
input.bind(config.input.port);

input.on('listening', async () => logger.info(`INPUT: Listening on port :${config.input.port}`));

input.on('message', HandleMessage)

async function HandleMessage(msg: Buffer, rinfo: dgram.RemoteInfo) {
    try {
        const json = JSON.parse(msg.toString('utf-8'));
        let outputMsg: any = undefined;

        if (isVDL2(json)) {
            let vdl2 = json.vdl2 as VDL2;
            //logger.info(`VDL2 with ACARS`);
            stats.histogram(`vdl2.${vdl2.station}.${vdl2.freq}`, 1);
            constats.msgs++;
            constats.types.VDL2++;
            outputMsg = MakeVDL2Message(json.vdl2);
        }

        if (isSATCOM(json)) {
            let satcom = json as Satcom;
            //logger.info(`SATCOM with ACARS`);
            stats.histogram(`satcom.${satcom.station}.${satcom.app.ver}`, 1);
            constats.msgs++;
            constats.types.SATCOM++;
            outputMsg = MakeSATCOMMessage(satcom);
        }

        if (isHFDL(json)) {
            let hfdl = json.hfdl as HFDL;
            //logger.info(`HFDL with ACARS`);
            stats.histogram(`hfdl.${hfdl.station}.${hfdl.app.ver}`, 1);
            constats.msgs++;
            constats.types.HFDL++;
            outputMsg = MakeHFDLMessage(hfdl);
        }

        if (outputMsg) {
            //logger.info("Message emitted");
            output.emit('NewData', outputMsg);
        }
    } catch (err) {
        logger.error((err as Error).message);
    }
}