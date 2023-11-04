import AcarsHandler from "./lib/AcarsHandler";
import OutputHandler from "./lib/OutputHandler";
import StatisticsHandler from "./lib/StatisticsHandler";
import WebsocketHandler from "./lib/WebsocketHandler";
import InputHandler from "./lib/InputHandler";

function Main() {
    const outputHandler = OutputHandler.create();

    if (!outputHandler) {
        return;
    }

    const statisticsHandler = StatisticsHandler.create(process.env.STATS_HOST, 8125);
    const websocketHandler = WebsocketHandler.create(21001);
    const acarsHandler = AcarsHandler.create(outputHandler, websocketHandler, statisticsHandler); 
    const inputHandler = InputHandler.create(3277);

    inputHandler.input.socket.on('message', (buffer, _) => {
        acarsHandler.handle(buffer);
    });

    process.on('SIGINT', async () => {
        console.log('STRG+C pressed');
        process.exit(0);
    });
}

Main();