import {createSocket as CreateUdpSocket, Socket as UdpSocket} from 'dgram'
import {isIPv4} from 'net'
import Logger from '../Logger'

export default class UdpInput {
    private socket: UdpSocket
    private logger: Logger

    constructor(private readonly address: string, private readonly port: number) {
        this.logger = new Logger(`input:udp:${this.address}:${this.port}`)
        this.socket = CreateUdpSocket(isIPv4(address) ? 'udp4' : 'udp6')

        this.socket.on('error', (err) => this.logger.error(err.message))
        this.socket.on('connect', () => this.logger.info('Listening'))

        this.socket.bind(this.port, this.address)
    }

    public onMessage(listener: (buffer: Buffer) => void) {
        this.socket.on('message', (buffer) => listener(buffer))
    }
}