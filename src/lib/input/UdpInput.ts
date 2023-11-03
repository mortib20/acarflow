import { createSocket as CreateUdpSocket, Socket as UdpSocket } from "dgram";
import { isIPv4 } from "net";
import Logger from "../Logger";
import AcarsHandler from "../AcarsHandler";

export default class UdpInput {
    private logger: Logger;
    public socket: UdpSocket;

    constructor(private readonly address: string, private readonly port: number) {
        this.logger = new Logger(`input:udp:${this.address}:${this.port}`);
        this.socket = CreateUdpSocket(isIPv4(address) ? 'udp4' : 'udp6');

        this.socket.on('error', (err) => this.logger.error(err.message));
        this.socket.on('connect', () => this.logger.info('Listening'));

        this.socket.bind(this.port, this.address);
    }

    public static create(port: number) {
        return new UdpInput('0.0.0.0', port);
    }
}