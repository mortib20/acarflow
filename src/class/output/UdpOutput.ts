import { Socket as UdpSocket, createSocket } from 'dgram';
import { isIPv4 } from "net";
import IOutput from "../../interface/IOutput";
import Logger from "../Logger";


export default class UdpOutput implements IOutput {
    logger: Logger;
    socket: UdpSocket;

    constructor(host: string, port: number) {
        this.logger = new Logger(`OUTPUT UDP ${host}:${port}`)
        this.socket = createSocket(isIPv4(host) ? 'udp4' : 'udp6');

        this.socket.connect(port, host);

        this.socket.on('connect', () => {
            this.logger.info(`Connected`);
        });

        this.socket.on('error', (err) => this.logger.error(err.message));
    }

    Send(buffer: Buffer): void {
        this.socket.send(buffer);
    }
}