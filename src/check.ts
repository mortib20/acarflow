export function isVDL2(msg: any) {
    if(msg?.vdl2?.avlc?.acars && msg?.vdl2?.avlc?.acars?.msg_text != "") return true;

    return false;
}

export function isSATCOM(msg: any) {
    if(msg?.isu?.acars && msg?.isu?.acars?.msg_text != "") return true;

    return false;
}

export function isHFDL(msg: any) {
    if(msg?.hfdl?.lpdu?.hfnpdu?.acars && msg?.hfdl?.lpdu?.hfnpdu?.acars?.msg_text != "") return true;

    return false;
}