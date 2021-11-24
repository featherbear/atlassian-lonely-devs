import type { IField, Root } from 'protobufjs'
import type ScheduleEntry from './ScheduleEntry'

export default function generate(rootObj: typeof Root) {
    const root = rootObj.fromJSON(
        {
            nested: {
                lonelyDevs: {
                    nested: {
                        "ScheduleEntry": {
                            fields: {
                                email: {
                                    id: 1,
                                    type: 'string',
                                },
                                name: {
                                    id: 2,
                                    type: 'string',
                                },
                                location: {
                                    id: 3,
                                    type: 'string',
                                },
                                floor: {
                                    id: 4,
                                    type: 'string',
                                }
                            } as { [k in keyof ScheduleEntry]: IField }
                        },

                        "ScheduleEntryBatch": {
                            fields: {
                                items: {
                                    id: 1,
                                    type: 'ScheduleEntry',
                                    rule: 'repeated'
                                },
                                asOf: {
                                    id: 2,
                                    type: 'uint64'
                                },
                                date: {
                                    id: 3,
                                    type: 'string'
                                }

                            }
                        }
                    }
                }
            }
        }
    )

    return {
        ScheduleEntryProtobuf: root.lookupType("ScheduleEntry"),
        ScheduleEntryBatchProtobuf: root.lookupType("ScheduleEntryBatch")
    }
}

export interface ScheduleEntryBatch {
    items: ScheduleEntry[]
    asOf: number
    date: string
}
