import dayjs from "dayjs";
import { cookieName } from "../components/constants";
import { decode } from "../components/JWT";
import Store from "../components/Store";
import Envoy, { WritebackInterface } from "../envoy/authCycle";
import type ScheduleEntry from "../types/ScheduleEntry";
import ProtobufGen, { ScheduleEntryBatch } from "../types/ScheduleEntry.protobuf";

const { ScheduleEntryBatchProtobuf } = ProtobufGen(require('protobufjs/light').Root)

let cache: ScheduleEntry[] = null;
let cachedFor: string;
let authToken: string = null;
let lastUpdate: Date = new Date(0);
let promise: Promise<typeof cache>;

function doUpdate(date, writeback?: WritebackInterface) {
    return (promise = Envoy.fetchScheduling({ access_token: authToken, date, writeback }).then((d) => {
        lastUpdate = new Date();
        cache = d;
        
        if (date) cachedFor = date
        else if (writeback?.date) cachedFor = writeback.date

        promise = null;
        logger.info(`Retrieved ${d.length} schedule records`);
        return d;
    }));
}

export async function get(req, res, next) {
    if (decode(req.cookies[cookieName])) {
        res.status(401)
        return res.end()
    }
    let { date } = req.query

    date = dayjs(date)
    if (isNaN(date)) date = dayjs()
    date = date.format("YYYY-MM-DD")

    const delta = new Date().getTime() - lastUpdate.getTime();
    let writeback: WritebackInterface = {}

    if (delta > 60 * 1000) {
        if (!authToken || delta > 82800 /* 23 hours */) {
            promise = Envoy.auth().then(async (token) => {
                authToken = token;
                if (!authToken) return null;
                return doUpdate(date, writeback);
            });
        }
    }

    let data = cache || await promise || await doUpdate(date, writeback);

    return res.end(ScheduleEntryBatchProtobuf.encode({
        asOf: lastUpdate.getTime(),
        date: writeback?.date,
        items: data
        // .filter(({ email }) => Store.check(email))
    } as ScheduleEntryBatch).finish());
}
