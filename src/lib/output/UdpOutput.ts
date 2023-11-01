import { Socket, Socket as UdpSocket, createSocket } from 'dgram';
import { isIPv4 } from "net";
import * as dns from "dns/promises";
import IOutput from "./IOutput";
import Logger from "../Logger";
import { log } from 'console';


export default class UdpOutput implements IOutput {
    logger: Logger;
    socket: UdpSocket | undefined;

    constructor(host: string, port: number) {
        this.logger = new Logger(`OUTPUT UDP ${host}:${port}`);

        (dns.resolve(host)).then((_) => {
            this.socket = createSocket(!isIPv4(host) ? 'udp4' : 'udp6');
            this.socket.connect(port, host);

            this.connect();

            this.reconnect(port, host);

            this.error();
        });
    }

    private error() {
        if (this.socket) {
            this.socket.on('error', (err) => this.logger.error(err.message));
        }
    }

    private connect() {
        if (this.socket) {
            this.socket.on('connect', () => {
                this.logger.info(`Connected`);
            });
        }
    }

    private reconnect(port: number, host: string) {
        if (this.socket) {
            this.socket.on('close', () => {
                setTimeout(() => {
                    if(this.socket) {
                        this.socket.connect(port, host);
                    }
                }, 20000);
            });
        }
    }

    Send(buffer: Buffer): void {
        if (this.socket) {
            this.socket.send(buffer);
        } else {
            this.logger.error("Failed so send");
        }
    }
}