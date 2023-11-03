import OutputHandler from "./lib/OutputHandler";
import AcarsHandler from "./lib/AcarsHandler";
import StatisticsHandler from "./lib/StatisticsHandler";
import WebsocketHandler from "./lib/WebsocketHandler";
import InputHandler from "./lib/InputHandler";
import UdpInput from "./lib/input/UdpInput";

async function Main() {
    const outputHandler = OutputHandler.create();

    if (!outputHandler) {
        return;
    }

    const statisticsHandler =  StatisticsHandler.create(process.env.STATS_HOST, Number(process.env.STATS_PORT));
    const websocketHandler =  WebsocketHandler.create(21001);
    const acarsHandler = AcarsHandler.create(outputHandler, statisticsHandler, websocketHandler);
    const inputHandler = InputHandler.create(21000, acarsHandler);

    process.on('SIGINT', async () => {
        console.log('STRG+C pressed');
        process.exit(0);
    });
}

Main();