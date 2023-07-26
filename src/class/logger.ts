export default class Logger {
    info(message: string) {
        const logMessage = `[${this.date()}] \x1b[32minfo\x1b[0m: ${message}`;
        console.log(logMessage);
    }

    error(message: string) {
        const logMessage = `[${this.date()}] \x1b[31merror\x1b[0m: ${message}`;
        console.error(logMessage);
    }

    date() {
        return new Date().toISOString();
    }
}