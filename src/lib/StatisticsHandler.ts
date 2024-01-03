import * as p from 'prom-client'
import {Server} from 'http'

export default class StatisticsHandler {
    public receivedMessagesTotal = new p.Counter({
        name: 'received_messages_total',
        help: 'Total received messages',
        labelNames: ['label', 'flight_number', 'flight', 'icao', 'channel', 'type'],
    })
    
    private constructor(private readonly registry: p.Registry, http: Server) {
        registry.setDefaultLabels({ app: 'acarflow' })
        registry.registerMetric(this.receivedMessagesTotal)
        
        http.on('request', async (req, res) => {
            if (req.url !== '/metrics') return
            res.setHeader('Content-Type', registry.contentType)
            res.end(await registry.metrics())
        })
    }

    public static create(http: Server) {
        return new StatisticsHandler(new p.Registry(), http)
    }
}