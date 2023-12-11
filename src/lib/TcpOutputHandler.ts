import * as tcp from 'net'
import Logger from './Logger'

export default class TcpOutputHandler {
    private static readonly logger = new Logger(this.name)
    private server: tcp.Server
    private connectedSockets: tcp.Socket[] = []
    
    constructor(port: number) {
        TcpOutputHandler.logger.info(`Listening on ${port}`)
        this.server = tcp.createServer()
        this.server.listen(port)
        this.server.on('connection', (client) => {
            this.connectedSockets.push(client)
            client.on('end', () => {
                this.connectedSockets = this.connectedSockets.filter(x => x != client)
            })
        })
    }
    
    public write(data: any) {
        this.connectedSockets.forEach(socket => socket.write(data))
    }
    
    public static create(port: number) {
        return new TcpOutputHandler(port)
    }
}