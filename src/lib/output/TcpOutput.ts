import * as net from 'net'
import IOutput from './IOutput'
import Logger from '../Logger'

export default class TcpOutput implements IOutput {
    private readonly socket: net.Socket

    private constructor(private address: string, private port: number, private readonly logger: Logger) {
        this.socket = net.connect(port, address)

        this.socket.on('connect', () => this.logger.info('Connected'))
        this.socket.on('error', (err) => this.logger.error(err.message))
        this.socket.on('close', (had) => setTimeout(() => this.reconnect(had), 5000))
    }

    private reconnect(error: boolean) {
        if (!error) {
            return
        }
        this.connect()
    }

    public connect() {
        this.socket.connect(this.port, this.address, () => {
        })
    }

    public send(buffer: Buffer): void {
        this.socket.write(buffer)
    }

    public static create(address: string, port: number, name?: string): TcpOutput {
        return new TcpOutput(address, port, new Logger(`${this.name}${name ? `:${name}` : ''}:${address}:${port}`))
    }
}
