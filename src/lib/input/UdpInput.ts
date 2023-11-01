import { createSocket as CreateUdpSocket, RemoteInfo, Socket as UdpSocket } from "dgram";
import { isIP, isIPv4 } from "net";
import Logger from "../Logger";

export default class UdpInput {
    private logger: Logger;
    private socket: UdpSocket;
    public onMessage?: (data: Buffer, rinfo: RemoteInfo) => void;

    constructor(private address: string, private port: number) {
        if (!isIP(address)) {
            throw new Error('address was not a IP');
        }

        this.logger = new Logger(`INPUT UDP ${this.address}:${this.port}`);

        this.socket = CreateUdpSocket(isIPv4(address) ? 'udp4' : 'udp6');
        this.onError();
    }

    private onError(): void {
        this.socket.on('error', (err) => this.logger.error(err.message));
    }

    public listen(): void {
        this.socket.on('message', (buffer, rinfo) => {
            if (this.onMessage) {
                this.onMessage(buffer, rinfo);
            }
        });

        this.socket.bind(this.port, this.address, () => this.logger.info('Listening'));
    }
}