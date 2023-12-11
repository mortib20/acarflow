export default class Logger {
    public constructor(private name: string) {
    }

    public info(message: string) {
        console.log(this.getMessage('\x1b[32minfo\x1b', message))
    }

    public error(message: string) {
        console.error(this.getMessage('\x1b[31merror\x1b', message))
    }

    private getMessage(type: string, message: string): string {
        return `[${this.getISODate()}] ${type}[0m: ${this.name} | ${message}`
    }

    private getISODate() {
        return new Date().toISOString()
    }
}