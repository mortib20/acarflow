export enum Protocol {
    TCP,
    UDP
}

export interface Remote {
    address: string;
    port: number;
}

export interface InOutParams {
    protocol: Protocol;
    hostname: string;
    port: number;
}
