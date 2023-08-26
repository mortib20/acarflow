import { Remote } from "./InOutStuff";

export default interface IInput {
    onData(listener: (data: Buffer, remote: Remote) => void): void;
}