import { Socket as TcpSocket, isIP, isIPv4 } from "net";
import { Socket as UdpSocket, createSocket as CreateUdpSocket } from "dgram";
import Logger from "./Logger";
import { InOutParams, Protocol } from "../interface/InOutStuff";
import { resolve } from "dns/promises";

function MakeTcpOutput(params: InOutParams) {
    let logger = new Logger(`OUTPUT TCP ${params.hostname}:${params.port}`);
    let tcp = new TcpSocket();
    tcp.connect({ host: params.hostname, port: params.port });

    tcp.on('connect', () => {
        logger.info(`Connected`);
    });

    tcp.on('error', (err) => {
        logger.error(err.message);
    });

    tcp.on('close', (hadError) => {
        if (hadError) {
            logger.error("Closed");
        } else {
            logger.info("Closed");
        }
        setTimeout(() => {
            tcp.destroy();
            tcp.connect({ host: params.hostname, port: params.port });
        }, 20000);
    });

    return { socket: tcp, protocol: Protocol.TCP };
}

function MakeUdpOutput(params: InOutParams) {
    let logger = new Logger(`OUTPUT UDP ${params.hostname}:${params.port}`);
    const udp = CreateUdpSocket('udp4');
    udp.connect(params.port, params.hostname);

    udp.on('connect', () => {
        logger.info(`Connected`);
    });

    return { socket: udp, protocol: Protocol.UDP };
}

export default class Output {
    output: { socket: TcpSocket | UdpSocket; protocol: Protocol; };

    constructor(output: InOutParams) {
        if (output.protocol == Protocol.TCP) {
            this.output = MakeTcpOutput(output);
        } else {
            this.output = MakeUdpOutput(output);
        }
    }

    public send(data: Buffer) {
        if (this.output.protocol == Protocol.TCP) {
            const tcp = this.output.socket as TcpSocket;
            tcp.write(data);
        } else {
            const udp = this.output.socket as UdpSocket;
            udp.send(data);
        }
    }
}
