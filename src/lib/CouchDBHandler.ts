import Logger from './Logger'
import Nano, {MaybeDocument} from 'nano'
import MinimizedAcars from './acars/MinimizedAcars'

interface iCouchDBAcars extends MaybeDocument {
    frame: MinimizedAcars
}

class CouchDBAcars implements iCouchDBAcars {
    _id: string | undefined
    _rev: string | undefined
    frame: MinimizedAcars

    constructor(frame: MinimizedAcars) {
        this._id = undefined
        this._rev = undefined
        this.frame = frame
    }
}

export default class CouchDBHandler {

    private constructor(private nano: Nano.ServerScope, private logger: Logger) {
        logger.info('Starting')
    }

    writeFrame(acars: MinimizedAcars) {
        const document = new CouchDBAcars(acars)
        this.nano.use('acarflow').insert(document).catch(reason => this.logger.error(reason))
    }

    public static create(address: string) {
        return new CouchDBHandler(Nano(address), new Logger(this.name))
    }
}