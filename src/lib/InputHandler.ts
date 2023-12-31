import UdpInput from './input/UdpInput'

export default class InputHandler {
    private constructor(public readonly input: UdpInput) {
    }

    public onMessage(listener: (buffer: Buffer) => void) {
        this.input.onMessage(listener)
    }

    public static create(port: number) {
        return new InputHandler(new UdpInput('0.0.0.0', port))
    }
}