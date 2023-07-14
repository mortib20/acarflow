export default interface Config {
    output: {
        port: number;
    };
    input: {
        port: number;
    },
    stats: {
        host: string;
        port: number;
    }
}