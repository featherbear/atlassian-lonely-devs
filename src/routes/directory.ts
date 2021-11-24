import dayjs from "dayjs";
import { cookieName } from "../components/constants";
import { decode } from "../components/JWT";
import Store from "../components/Store";
import Envoy from "../envoy/authCycle";
import type ScheduleEntry from "../types/ScheduleEntry";
import ProtobufGen, { ScheduleEntryBatch } from "../types/ScheduleEntry.protobuf";

const { ScheduleEntryBatchProtobuf } = ProtobufGen(require('protobufjs/light').Root)

let authToken: string = null;
let authTokenDate = new Date(0)

let cache: {
    [date: string]: {
        promise: Promise<ScheduleEntry[]>,
        data: ScheduleEntry[],
        last: Date
    }
} = {};

function doUpdate(date: string) {
    let promise = Envoy.fetchScheduling({ access_token: authToken, date }).then((d) => {
        cache[date] = {
            promise: null,
            data: d,
            last: new Date()
        }
        logger.info(`Retrieved ${d.length} schedule records`);
        return d;
    })

    cache[date] = { ...cache[date], promise }
    return promise;
}

export async function get(req, res, next) {
    let session = decode(req.cookies[cookieName])
    if (!session) {
        res.status(401)
        return res.end()
    }

    let { date } = req.query

    date = dayjs(date)
    if (isNaN(date)) date = dayjs()
    date = date.format("YYYY-MM-DD")

    const delta = new Date().getTime() - ((cache[date]?.last?.getTime() ?? 0));

    if (delta > 45 * 1000) {
        if (!authToken || (new Date().getTime() - authTokenDate.getTime() > 82800 /* 23 hours */)) {
            cache[date] = {
                ...cache[date],
                promise:
                    Envoy.auth().then(async (token) => {
                        authToken = token;
                        authTokenDate = new Date()
                        if (!authToken) return null;
                        return doUpdate(date);
                    })
            }
        }
    }

    logger.info(`Received schedule request for ${date} from ${session['user']}`)
    let data = cache[date]?.data || await cache[date]?.promise || await doUpdate(date);

    return res.end(ScheduleEntryBatchProtobuf.encode({
        asOf: cache[date]?.last?.getTime(),
        items: data
            .filter(({ email }) => Store.check(email))
    } as ScheduleEntryBatch).finish());
}
