import * as tcp from 'net'
import Logger from './Logger'

export default class TcpOutputHandler {
    private server: tcp.Server
    private connectedSockets: tcp.Socket[] = []
    
    private constructor(port: number, logger: Logger) {
        logger.info(`Listening on 0.0.0.0:${port}`)
        this.server = tcp.createServer()
        this.server.listen(port)
        this.server.on('connection', (client) => {
            this.connectedSockets.push(client)
            client.on('end', () => {
                this.connectedSockets = this.connectedSockets.filter(x => x != client)
            })
        })
    }
    
    public write(data: string) {
        const buffer = Buffer.from(data, 'utf-8')
        this.connectedSockets.forEach(socket => socket.write(buffer))
    }
    
    public static create(port: number) {
        return new TcpOutputHandler(port, new Logger(this.name))
    }
}