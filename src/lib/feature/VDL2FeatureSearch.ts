export default class VDL2FeatureSearch {
    private static regex = {
        label: {
            '16': {
                latitude: /N\s+0*(\d{1,3}[.]\d+)/, longitude: /E\s+0*(\d{1,3}[.]\d+)/
            }
        }
    }

    private static MatchLabel16(msg_text: string) {
        const latitudeMatch = msg_text.match(this.regex.label['16'].latitude)
        const longitudeMatch = msg_text.match(this.regex.label['16'].longitude)

        if (latitudeMatch == null && longitudeMatch == null) {
            return undefined
        }

        if (!latitudeMatch?.at(1) && !longitudeMatch?.at(1)) {
            return undefined
        }

        return {lat: Number(latitudeMatch?.at(1)), lon: Number(longitudeMatch?.at(1))}
    }

    public static SearchPosition(label: string, msg_text: string) {
        if (label == '16') {
            return this.MatchLabel16(msg_text)
        }

        return undefined
    }
}