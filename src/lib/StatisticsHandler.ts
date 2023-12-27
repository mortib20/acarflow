import {StatsD} from 'node-statsd'

export default class StatisticsHandler {
    private constructor(private readonly statsd: StatsD) {
    }

    public increment(stat: string, tags: string[]) {
        this.statsd.increment(stat, 1, undefined, tags)
    }

    public static create(statisticsHost: string, statisticsPort: number) {
        return new StatisticsHandler(new StatsD(statisticsHost, statisticsPort))
    }
}