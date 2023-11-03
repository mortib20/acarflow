import AcarsHandler from "./AcarsHandler";
import UdpInput from "./input/UdpInput";

export default class InputHandler {
    private constructor(private readonly input: UdpInput, private readonly acarsHandler: AcarsHandler) {
        input.socket.on('message', acarsHandler.handle);
    }

    public static create(port: number, acarsHandler: AcarsHandler) {
        return new InputHandler(new UdpInput('0.0.0.0', port), acarsHandler);
    }
}