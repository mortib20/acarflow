import Remote from "./Remote";

export default interface IInput {
    onData(listener: (data: Buffer, remote: Remote) => void): void;
}