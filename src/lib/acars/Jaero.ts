export default interface Jaero {
    app: App
    isu: Isu
    station: string
    t: T
  }
  
  export interface App {
    name: string
    ver: string
  }
  
  export interface Isu {
    acars: Acars
    dst: Dst
    qno: string
    refno: string
    src: Src
  }
  
  export interface Acars {
    ack: string
    blk_id: string
    label: string
    mode: string
    msg_text: string
    reg: string
  }
  
  export interface Dst {
    addr: string
    type: string
  }
  
  export interface Src {
    addr: string
    type: string
  }
  
  export interface T {
    sec: number
    usec: number
  }
  