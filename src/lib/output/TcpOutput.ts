import * as net from "net";
import IOutput from "./IOutput";
import Logger from "../Logger";

export default class TcpOutput implements IOutput {
    private readonly logger: Logger;
    private readonly socket: net.Socket;

    public constructor(private address: string, private port: number) {
        this.logger = new Logger(`output:tcp:${address}:${port}`);
        this.socket = net.connect(port, address);

        this.socket.on('connect', () => this.logger.info('Connected'));
        this.socket.on('error', (err) => this.logger.error(err.message));
        this.socket.on('close', (had) => setTimeout(() => this.reconnect(had), 5000));
    }

    private reconnect(error: boolean) {
        if (error) {
            this.socket.connect(this.port, this.address);
        }
    }

    public connect() {
        this.socket.connect(this.port, this.address, () => {});
    }

    public send(buffer: Buffer): void {
        this.socket.write(buffer);
    }

    public static async create(address: string, port: number): Promise<TcpOutput> {
        return new TcpOutput(address, port);
    }
}
