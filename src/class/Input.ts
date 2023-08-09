import { createServer as CreateTcpServer, Server as TcpServer, isIP, isIPv4 } from "net";
import { Socket as UdpSocket, createSocket as CreateUdpSocket } from "dgram";
import EventEmitter from "events";
import Logger from "./Logger";
import { InOutParams, Protocol, Remote } from "../interface/InOutStuff";

export default class Input extends EventEmitter {
    logger: Logger;
    input: { socket: TcpServer | UdpSocket; protocol: Protocol; };

    constructor(input: InOutParams) {
        super();
        if(!isIP(input.hostname)) throw new Error("Not an IP...");

        this.input = {
            socket: input.protocol == Protocol.TCP ? CreateTcpServer() :
                CreateUdpSocket(isIPv4(input.hostname) ? 'udp4' : 'udp6'),
            protocol: input.protocol
        };

        if (input.protocol == Protocol.TCP) {
            this.logger = new Logger(`INPUT TCP ${input.hostname}:${input.port}`);
            const tcp = this.input.socket as TcpServer;
            tcp.listen(input.port, input.hostname, undefined, () => this.logger.info(`Server started`));

            tcp.on('connection', (client) => {
                let remote: Remote = { address: client.remoteAddress || "", port: client.remotePort || 0 };
                this.logger.info(`Client connected ${remote.address}:${remote.port}`);

                client.on('data', (data) => {
                    this.emit('data', data, remote);
                });

                client.on('close', (hadError) => {
                    this.logger.info(`Client disconnected ${remote.address}:${remote.port}`);
                });

            });

            tcp.on('error', (err) => this.emit('error', err));
        } else {
            this.logger = new Logger(`INPUT UDP ${input.hostname}:${input.port}`);
            const udp = this.input.socket as UdpSocket;
            udp.bind(input.port, input.hostname, () => this.logger.info(`Server started`));

            udp.on('message', (data, rinfo) => {
                const remote: Remote = { address: rinfo.address, port: rinfo.port };
                //this.logger.info(`Client message from ${remote.address}:${remote.port}`);
                this.emit('data', data, remote);
            });

            udp.on('error', (err) => this.emit('error', err));
        }

    }
}
