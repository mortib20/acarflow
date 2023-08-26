export enum AcarsType { ACARS, VDL2, HFDL, SATCOM };

export function isVDL2(msg: any) {
    return !!msg?.vdl2?.avlc?.acars?.msg_text;
}

export function isSATCOM(msg: any) {
    return !!msg?.isu?.acars?.msg_text;
}

export function isHFDL(msg: any) {
    return !!msg?.hfdl?.lpdu?.hfnpdu?.acars?.msg_text;
}

export function isOldAcars(msg: any) {
    return !!msg?.timestamp && !!msg?.freq && !!msg?.tail && !!msg?.label && !!msg?.text;
}

export default function DetectAcarsType(data: Buffer) {
    const json = JSON.parse(data.toString('utf-8'));

    if(isOldAcars(json)) return AcarsType.ACARS;
    if(isVDL2(json)) return AcarsType.VDL2;
    if(isHFDL(json)) return AcarsType.HFDL;
    if(isSATCOM(json)) return AcarsType.SATCOM;

    return null;
}