"use strict";
/*! Copyright (c) 2021 Siemens AG. Licensed under the MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.testObjectResolvesMatch = exports.createHeaderlessObject = exports.createAgvId = void 0;
const __1 = require("..");
function createAgvId(manufacturer, serialNumber) {
    return { manufacturer, serialNumber };
}
exports.createAgvId = createAgvId;
function createHeaderlessObject(topic) {
    switch (topic) {
        case __1.Topic.Connection:
            return {
                connectionState: __1.ConnectionState.Offline,
            };
        case __1.Topic.InstantActions:
            return {
                actions: [],
            };
        case __1.Topic.Order:
            return {
                orderId: "order0001",
                orderUpdateId: 0,
                nodes: [{ actions: [], nodeId: "productionunit_1", sequenceId: 0, released: true }],
                edges: [],
            };
        case __1.Topic.State:
            return {
                actionStates: [],
                batteryState: { batteryCharge: 0.8, charging: false },
                driving: false,
                edgeStates: [],
                errors: [],
                lastNodeId: "",
                lastNodeSequenceId: 0,
                nodeStates: [],
                operatingMode: __1.OperatingMode.Automatic,
                orderId: "",
                orderUpdateId: 0,
                safetyState: { eStop: __1.EStop.None, fieldViolation: false },
            };
        case __1.Topic.Visualization:
            return {
                agvPosition: {
                    x: 0,
                    y: 0,
                    theta: 0,
                    positionInitialized: true,
                    mapId: "001",
                },
                velocity: {
                    omega: 0,
                    vx: 1,
                    vy: 1,
                },
            };
        default:
            return {
                topic,
            };
    }
}
exports.createHeaderlessObject = createHeaderlessObject;
async function testObjectResolvesMatch(test, client, subject, headerlessObject, promise) {
    const object = await promise;
    test.equal(object.headerId >= 0 && object.headerId <= 0xFFFFFFFF, true);
    test.equal(object.manufacturer, subject.manufacturer);
    test.equal(object.serialNumber, subject.serialNumber);
    test.equal(object.version, client.protocolVersion);
    const copy = Object.assign({}, object);
    delete copy.headerId;
    delete copy.manufacturer;
    delete copy.serialNumber;
    delete copy.timestamp;
    delete copy.version;
    test.strictSame(copy, headerlessObject);
}
exports.testObjectResolvesMatch = testObjectResolvesMatch;
