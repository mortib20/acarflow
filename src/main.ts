import AcarsHandler from './lib/AcarsHandler'
import OutputHandler from './lib/OutputHandler'
import StatisticsHandler from './lib/StatisticsHandler'
import WebsocketHandler from './lib/WebsocketHandler'
import InputHandler from './lib/InputHandler'
import TcpOutputHandler from './lib/TcpOutputHandler'

function Main() {
    const outputHandler = OutputHandler.create()

    if (!outputHandler) {
        return
    }

    const statisticsHandler = StatisticsHandler.create(process.env.STATS_HOST, 8125)
    const websocketHandler = WebsocketHandler.create(21001)
    const tcpOutputHandler = TcpOutputHandler.create(3277)
    const acarsHandler = AcarsHandler.create(outputHandler, websocketHandler, statisticsHandler, tcpOutputHandler) 
    const inputHandler = InputHandler.create(21000)

    inputHandler.input.socket.on('message', (buffer) => {
        acarsHandler.handle(buffer)
    })

    process.on('SIGINT', async () => {
        console.log('STRG+C pressed')
        process.exit(0)
    })
}

Main()