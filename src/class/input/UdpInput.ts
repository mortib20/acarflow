import { isIP, isIPv4 } from "net";
import IInput from "../../interface/IInput";
import { Socket as UdpSocket, createSocket as CreateUdpSocket } from "dgram";
import Remote from "../../interface/Remote";
import Logger from "../Logger";
import EventEmitter from "events";

export default class UdpInput implements IInput {
    logger: Logger;
    socket: UdpSocket;
    emitter: EventEmitter;

    constructor(host: string, port: number) {
        if(!isIP(host)) throw new Error("Not an IP...");

        this.logger = new Logger(`INPUT UDP ${host}:${port}`);
        this.socket = CreateUdpSocket(isIPv4(host) ? 'udp4' : 'udp6');
        this.emitter = new EventEmitter();
        
        this.socket.bind(port, host, () => this.logger.info(`Server started`));

        this.socket.on('message', (data, rinfo) => {
            const remote: Remote = { address: rinfo.address, port: rinfo.port };
            this.emitter.emit('data', data, remote);
        });

        this.socket.on('error', (err) => this.logger.error(err.message));
    }

    onData(listener: (data: Buffer, remote: Remote) => void): void {
        this.emitter.on('data', listener);
    }
}