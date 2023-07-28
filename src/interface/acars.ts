export default interface TLAcars {
    timestamp: number;
    station_id: string;
    freq: number;
    mode: string;
    label: string;
    block_id: string;
    ack: boolean;
    tail: string;
    flight: string;
    msgno: string;
    text: string;
    sublabel: string;
    app: {
        name: string;
        ver: string;
    }
    
}