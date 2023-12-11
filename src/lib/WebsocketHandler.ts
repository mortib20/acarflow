import { Server } from 'socket.io'
import Logger from './Logger'

export default class WebsocketHandler {
    private constructor(port: number, private readonly io: Server, private readonly logger: Logger) {
        this.logger.info('Exposed')
        io.listen(port)
    }

    public send(name: string, data: any) {
        this.io.compress(true).emit(name, data)
    }

    public static create(port: number) {
        return new WebsocketHandler(port, new Server({ httpCompression: true }), new Logger(`ws:0.0.0.0:${port}`))
    }
}