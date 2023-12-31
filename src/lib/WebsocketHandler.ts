import { Server } from 'socket.io'
import * as Http from 'http'
import Logger from './Logger'

export default class WebsocketHandler {
    private constructor(port: number, private readonly io: Server, private readonly logger: Logger) {
        this.logger.info(`Listening on 0.0.0.0:${port}`)
    }

    public send(name: string, data: any) {
        this.io.compress(true).emit(name, data)
    }

    public static create(port: number, http: Http.Server) {
        return new WebsocketHandler(port, new Server(http, { httpCompression: true }), new Logger(this.name))
    }
}