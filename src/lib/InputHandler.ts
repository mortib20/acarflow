import AcarsHandler from "./AcarsHandler";
import UdpInput from "./input/UdpInput";

export default class InputHandler {
    private constructor(private readonly input: UdpInput, private readonly acarsHandler: AcarsHandler) {
    }

    public static create(port: number, acarsHandler: AcarsHandler) {
        return new InputHandler(new UdpInput('0.0.0.0', port, acarsHandler), acarsHandler);
    }
}