import AcarsHandler from './lib/AcarsHandler'
import OutputHandler from './lib/OutputHandler'
import StatisticsHandler from './lib/StatisticsHandler'
import WebsocketHandler from './lib/WebsocketHandler'
import InputHandler from './lib/InputHandler'
import TcpOutputHandler from './lib/TcpOutputHandler'
import CouchDBHandler from './lib/CouchDBHandler'

async function Main() {
    if(!process.env.STATS_HOST) {
        throw new Error('Environment Variable STATS_HOST not set!')
    }
    
    if(!process.env.ACARFLOWDB_ADDRESS) {
        throw new Error('Environment Variable ACARFLOWDB_ADDRESS not set!')
    }
    
    const outputHandler = await OutputHandler.create()
    const statisticsHandler = StatisticsHandler.create(process.env.STATS_HOST, 8125)
    const websocketHandler = WebsocketHandler.create(21001)
    const tcpOutputHandler = TcpOutputHandler.create(3277)
    const couchDBHandler = CouchDBHandler.create(process.env.ACARFLOWDB_ADDRESS)
    const acarsHandler = AcarsHandler.create(outputHandler, websocketHandler, statisticsHandler, tcpOutputHandler, couchDBHandler)
    const inputHandler = InputHandler.create(21000)

    inputHandler.onMessage(buffer => acarsHandler.handle(buffer))

    process.on('SIGINT', async () => {
        console.log('STRG+C pressed')
        process.exit(0)
    })
}

try {
    Main()
} catch (error) {
    console.error((error as Error).message)
}
