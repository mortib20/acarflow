export default class Logger {
    name: string;
    public constructor(name: string) {
        this.name = name;
    }

    info(message: string) {
        const logMessage = `[${this.date()}] \x1b[32minfo\x1b[0m: ${this.name} | ${message}`;
        console.log(logMessage);
    }

    error(message: string) {
        const logMessage = `[${this.date()}] \x1b[31merror\x1b[0m: ${this.name} | ${message}`;
        console.error(logMessage);
    }

    private date() {
        return new Date().toISOString();
    }
}