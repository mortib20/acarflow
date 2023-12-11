import { StatsD } from 'node-statsd'

export default class StatisticsHandler {
    private constructor(private readonly statsd: StatsD) {
    }

    public increment(stat: string, tags: string[]) {
        this.statsd.increment(stat, 1, undefined, tags)
    }

    public static create(statisticsHost: string | undefined, statisticsPort: number | undefined) {
        return new StatisticsHandler(new StatsD(statisticsHost || '127.0.0.1', statisticsPort || 8125))
    }
}