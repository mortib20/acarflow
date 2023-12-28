import * as dgram from 'dgram'
import * as dns from 'dns/promises'
import IOutput from './IOutput'
import Logger from '../Logger'

export default class UdpOutput implements IOutput {
    private readonly socket: dgram.Socket

    public constructor(private address: string, private type: dgram.SocketType, private port: number, private readonly logger: Logger) {
        this.socket = dgram.createSocket(this.type)
        this.socket.connect(port, address)

        this.socket.on('connect', () => this.logger.info('Connected'))
        this.socket.on('error', (err) => this.logger.error(err.message))
        this.socket.on('close', () => setTimeout(() => this.reconnect(), 5000))
    }

    private reconnect(): void {
        this.socket.connect(this.port, this.address)
    }

    public send(buffer: Buffer): void {
        this.socket.send(buffer)
    }

    public static async create(address: string, port: number, name?: string): Promise<UdpOutput> {
        const found = await dns.lookup(address)
        return new UdpOutput(address, found.family === 4 ? 'udp4' : 'udp6', port, new Logger(`${this.name}${name ? `:${name}` : ''}:${address}:${port}`))
    }
}