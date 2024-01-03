import Logger from './Logger'
import {createServer, Server} from 'http'

export default class HttpHandler {
    private readonly _server: Server
    
    public get server() {
        return this._server
    }

    private constructor(port: number, private readonly logger: Logger) {
        this._server = createServer()
        this._server.listen(port, () => logger.info(`Listening on ${port}`))
    }

    public static create(port: number) {
        return new HttpHandler(port, new Logger(this.name))
    }
}