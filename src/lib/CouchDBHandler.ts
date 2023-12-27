import Logger from './Logger'
import Nano, {MaybeDocument} from 'nano'
import BasicAcars from './acars/BasicAcars'

interface iCouchDBAcars extends MaybeDocument {
    frame: BasicAcars
}

class CouchDBAcars implements iCouchDBAcars {
    _id: string | undefined
    _rev: string | undefined
    frame: BasicAcars

    constructor(frame: BasicAcars) {
        this._id = undefined
        this._rev = undefined
        this.frame = frame
    }
}

export default class CouchDBHandler {

    private constructor(private nano: Nano.ServerScope, private logger: Logger) {
        logger.info('Starting')
    }

    writeFrame(acars: BasicAcars) {
        const document = new CouchDBAcars(acars)
        this.nano.use('acarflow').insert(document).catch((error: Error) => this.logger.error(error.message))
    }

    public static create(address: string) {
        return new CouchDBHandler(Nano(address), new Logger(this.name))
    }
}