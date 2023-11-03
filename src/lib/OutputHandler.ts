import { readFileSync } from "fs";
import Logger from "./Logger";
import IOutput from "./output/IOutput";
import TcpOutput from "./output/TcpOutput";
import UdpOutput from "./output/UdpOutput";

export default class OutputHandler {
    private static readonly OUTPUTS_CONFIG_PATH = "outputs.json";
    private static readonly logger = new Logger(this.name);

    private constructor(public readonly dumpvdl2: IOutput[], public readonly dumphfdl: IOutput[], public readonly acarsdec: IOutput[], public readonly jaero: IOutput[]) {
    }

    public static create() {
        const outputsConfig = this.readOutputsConfig();

        if (!outputsConfig) {
            return undefined;
        }

        const dumpvdl2 = this.createOutputs(outputsConfig.dumpvdl2);
        const dumphfdl = this.createOutputs(outputsConfig.dumphfdl);
        const acarsdec = this.createOutputs(outputsConfig.acarsdec);
        const jaero = this.createOutputs(outputsConfig.jaero);

        return new OutputHandler(dumpvdl2, dumphfdl, acarsdec, jaero);
    }

    private static readOutputsConfig(): OutputsConfig | undefined {
        this.logger.info(`Reading outputs.json at ${this.OUTPUTS_CONFIG_PATH}`);
        try {
            return JSON.parse(readFileSync(this.OUTPUTS_CONFIG_PATH, { encoding: 'utf-8' }));
        } catch (err) {
            this.logger.error((err as Error).message);
            return undefined;
        }
    }

    private static createOutputs(outputItemConfigs: OutputItemConfig[]) {
        const outputs: IOutput[] = [];
        outputItemConfigs.forEach(out => {
            outputs.push(out.type === 'tcp' ? new TcpOutput(out.hostname, out.port) : new UdpOutput(out.hostname, 'udp4', out.port));   
        })

        return outputs;
    }

    public static write(outputs: IOutput[], buffer: Buffer) {
        outputs.forEach(out => out.send(buffer));
    }
}

export interface OutputsConfig {
    dumpvdl2: OutputItemConfig[]
    dumphfdl: OutputItemConfig[]
    acarsdec: OutputItemConfig[]
    jaero: OutputItemConfig[]
}

export interface OutputItemConfig {
    type: 'tcp' | 'udp'
    hostname: string
    port: number
}