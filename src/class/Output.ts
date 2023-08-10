import { createSocket as CreateUdpSocket, Socket as UdpSocket } from "dgram";
import { Socket as TcpSocket } from "net";
import { InOutParams, Protocol } from "../interface/InOutStuff";
import Logger from "./Logger";

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

    udp.on('error', (err) => logger.error(err.message));

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
