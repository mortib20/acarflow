interface App {
    name: string;
    ver: string;
};

interface Time {
    sec: number;
    usec: number;
};

interface Source {
    addr: string;
    type: string;
};

interface Destination {
    addr: string;
    type: string;
};

interface UDPBase {
    station: string;
    app: App;
};

export { App, Time, Source, Destination, UDPBase };