import { readFileSync } from "fs";
import Logger from "./Logger";
import IOutput from "./output/IOutput";
import TcpOutput from "./output/TcpOutput";
import UdpOutput from "./output/UdpOutput";

export default class OutputManager {
    private static readonly logger = new Logger('OutputsManager');
    private static readonly OUTPUTS_CONFIG_PATH = "outputs.json";
    private static readonly _outputsConfig: OutputsConfig = this.readOutputsConfig();

    public readonly dumpvdl2: IOutput[];
    public readonly dumphfdl: IOutput[];
    public readonly acarsdec: IOutput[];
    public readonly jaero: IOutput[];

    constructor() {
        this.dumpvdl2 = OutputManager.createOutputs(OutputManager._outputsConfig.dumpvdl2);
        this.dumphfdl = OutputManager.createOutputs(OutputManager._outputsConfig.dumphfdl);
        this.acarsdec = OutputManager.createOutputs(OutputManager._outputsConfig.acarsdec);
        this.jaero = OutputManager.createOutputs(OutputManager._outputsConfig.jaero);
    }

    private static readOutputsConfig(): OutputsConfig {
        this.logger.info(`Reading outputs.json at ${this.OUTPUTS_CONFIG_PATH}`);
        const rawConfig = readFileSync(this.OUTPUTS_CONFIG_PATH, { encoding: 'utf-8' });
        const config: OutputsConfig = JSON.parse(rawConfig);
        return config;
    }

    private static createOutputs(outputsItems: OutputItemConfig[]): IOutput[] {
        const outputs: IOutput[] = [];
        outputsItems.forEach(output => {
            outputs.push(output.type === 'tcp' ? this.createTcpOutput(output.hostname, output.port) : this.createUdpOutput(output.hostname, output.port));
        });

        return outputs;
    }

    private static createUdpOutput(host: string, port: number): UdpOutput {
        return new UdpOutput(host, port);
    }

    private static createTcpOutput(host: string, port: number): TcpOutput {
        return new TcpOutput(host, port);
    }

    public static write(outputs: IOutput[], buffer: Buffer) {
        outputs.forEach(outputs => {
            outputs.Send(buffer);
        })
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


