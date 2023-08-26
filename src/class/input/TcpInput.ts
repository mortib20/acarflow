import EventEmitter from "events";
import { createServer as CreateTcpServer, Server as TcpServer, isIP } from "net";
import IInput from "../../interface/IInput";
import Remote from "../../interface/Remote";
import Logger from "../Logger";

export default class Input implements IInput {
    logger: Logger;
    socket: TcpServer;
    emitter: EventEmitter;

    constructor(host: string, port: number) {
        if (!isIP(host)) throw new Error("Not an IP...");

        // Initialize variables
        this.logger = new Logger(`INPUT TCP ${host}:${port}`);
        this.socket = CreateTcpServer();
        this.emitter = new EventEmitter();

        // Start listening
        this.socket.listen(port, host, undefined, () => this.logger.info(`Server started`));

        // Handle new clients
        this.socket.on('connection', (client) => {
            let remote: Remote = { address: client.remoteAddress || "", port: client.remotePort || 0 };
            this.logger.info(`Client connected ${remote.address}:${remote.port}`);

            // Emit data to listeners
            client.on('data', (data) => {
                this.emitter.emit('data', data, remote);
            });

            // Close connection
            client.on('close', (hadError) => {
                this.logger.info(`Client disconnected ${remote.address}:${remote.port}`);
            });
        });

        // Send error
        this.socket.on('error', (err) => this.emitter.emit('error', err));
    }

    onData(listener: (data: Buffer, remote: Remote) => void) {
        this.emitter.on('data', listener);
    }
}
