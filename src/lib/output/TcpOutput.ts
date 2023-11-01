import { Socket as TcpSocket } from "net";
import IOutput from "./IOutput";
import Logger from "../Logger";


export default class TcpOutput implements IOutput {
    logger: Logger;
    socket: TcpSocket;

    constructor(host: string, port: number) {
        this.logger = new Logger(`OUTPUT TCP ${host}:${port}`)
        this.socket = new TcpSocket({ allowHalfOpen: true });

        this.socket.connect(port, host);

        // Connected
        this.socket.on('connect', () => {
            this.logger.info(`Connected`);
        });

        // Error
        this.socket.on('error', (err) => {
            this.logger.error(err.message);
        });

        // Conection closed
        this.socket.on('close', (hadError) => {
            hadError ? this.logger.error("Closed") : this.logger.info("Closed");

            // Reconnect
            setTimeout(() => {
                this.socket.destroy();
                this.socket.connect(port, host);
            }, 20000);
        });
    }

    public Send(data: Buffer) {
        this.socket.write(data);
    }
}
