"use strict";
/*! Copyright (c) 2021 Siemens AG. Licensed under the MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const tap = require("tap");
const __1 = require("../..");
const test_context_1 = require("../test-context");
const test_objects_1 = require("../test-objects");
(0, test_context_1.initTestContext)(tap);
tap.test("Master Control Client - AGV Client", async (t) => {
    const agvId = (0, test_objects_1.createAgvId)("RobotCompany", "001");
    const mcClient = new __1.MasterControlClient((0, test_context_1.testClientOptions)(t));
    const agvClient = new __1.AgvClient(agvId, (0, test_context_1.testClientOptions)(t));
    t.test("no tracked state available before starting", ts => {
        ts.equal(mcClient.getTrackedState(agvId), undefined);
        ts.equal(mcClient.getTrackedState({ ...agvId, manufacturer: "FooCompany" }), undefined);
        ts.equal(mcClient.getTrackedState({ ...agvId, serialNumber: "002" }), undefined);
        ts.strictSame(mcClient.getTrackedStates(), []);
        ts.end();
    });
    let trackInvocationCountFirst = 0;
    mcClient.trackAgvs((subject, state, timestamp) => {
        trackInvocationCountFirst++;
        tap.test("track AGV Client before start", ts => {
            ts.equal(trackInvocationCountFirst < 3, true);
            ts.strictSame(subject, agvId);
            ts.equal(timestamp, mcClient.getTrackedState(agvId).timestamp);
            ts.equal(state, mcClient.getTrackedState(agvId).state);
            ts.equal(state, trackInvocationCountFirst === 1 ? __1.ConnectionState.Online : __1.ConnectionState.Offline);
            ts.strictSame(mcClient.getTrackedStates(), [{ subject, state, timestamp }]);
            ts.end();
        });
    });
    await t.test("start AGV Client", async () => {
        await agvClient.start();
    });
    await t.test("start Master Control Client", async () => {
        await mcClient.start();
    });
    let trackInvocationCountSecond = 0;
    mcClient.trackAgvs((subject, state, timestamp) => {
        trackInvocationCountSecond++;
        tap.test("track AGV Client after start", ts => {
            ts.equal(trackInvocationCountSecond < 3, true);
            ts.strictSame(subject, agvId);
            ts.equal(timestamp, mcClient.getTrackedState(agvId).timestamp);
            ts.equal(state, mcClient.getTrackedState(agvId).state);
            ts.equal(state, trackInvocationCountSecond === 1 ? __1.ConnectionState.Online : __1.ConnectionState.Offline);
            ts.equal(mcClient.getTrackedState({ ...agvId, manufacturer: "FooCompany" }), undefined);
            ts.equal(mcClient.getTrackedState({ ...agvId, serialNumber: "002" }), undefined);
            ts.strictSame(mcClient.getTrackedStates(), [{ subject, state, timestamp }]);
            ts.end();
            if (trackInvocationCountSecond === 1) {
                let trackInvocationCountThird = 0;
                mcClient.trackAgvs((sub, st, tsp) => {
                    trackInvocationCountThird++;
                    tap.test("track AGV Client with known initial states", tss => {
                        tss.equal(trackInvocationCountThird < 3, true);
                        tss.strictSame(sub, agvId);
                        tss.equal(tsp, mcClient.getTrackedState(agvId).timestamp);
                        tss.equal(st, mcClient.getTrackedState(agvId).state);
                        tss.equal(st, trackInvocationCountThird === 1 ? __1.ConnectionState.Online : __1.ConnectionState.Offline);
                        tss.equal(mcClient.getTrackedState({ ...agvId, manufacturer: "FooCompany" }), undefined);
                        tss.equal(mcClient.getTrackedState({ ...agvId, serialNumber: "002" }), undefined);
                        tss.strictSame(mcClient.getTrackedStates(), [{ subject: sub, state: st, timestamp: tsp }]);
                        tss.end();
                    });
                });
            }
        });
    });
    const headerlessOrder1 = (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order);
    const headerlessOrderState1 = (0, test_objects_1.createHeaderlessObject)(__1.Topic.State);
    let order1;
    let orderState1;
    let subIdOrder;
    await t.test("subscribe order on AGV", async () => {
        let subCounterOrder = 0;
        subIdOrder = await agvClient.subscribe(__1.Topic.Order, async (order, subject, topic, id) => {
            subCounterOrder++;
            tap.test("inbound order on AGV", ts => {
                ts.equal(subCounterOrder, 1);
                ts.equal(topic, __1.Topic.Order);
                ts.strictSame(subject, agvClient.agvId);
                ts.strictSame(order, order1);
                ts.equal(id, subIdOrder);
                ts.end();
            });
            headerlessOrderState1.orderId = order.orderId;
            headerlessOrderState1.orderUpdateId = order.orderUpdateId;
            await tap.test("publish order state on AGV", async () => {
                orderState1 = await agvClient.publish(__1.Topic.State, headerlessOrderState1);
            });
        });
    });
    await t.test("subscribe state on Master Control", async () => {
        const subIdState = await mcClient.subscribe(__1.Topic.State, agvId, async (state, subject, topic, id) => {
            tap.test("inbound state on Control", ts => {
                ts.equal(topic, __1.Topic.State);
                ts.strictSame(subject, agvId);
                ts.strictSame(state, orderState1);
                ts.equal(id, subIdState);
                ts.end();
            });
            await tap.test("unsubscribe order on AGV and stop", async () => {
                await agvClient.unsubscribe(subIdOrder);
                await agvClient.stop();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });
            await tap.test("unsubscribe state on Master Control and stop", async () => {
                await mcClient.unsubscribe(subIdState);
                await mcClient.stop();
            });
            tap.test("no tracked state available after stopping", ts => {
                ts.equal(mcClient.getTrackedState(agvId), undefined);
                ts.equal(mcClient.getTrackedState({ ...agvId, manufacturer: "FooCompany" }), undefined);
                ts.equal(mcClient.getTrackedState({ ...agvId, serialNumber: "002" }), undefined);
                ts.strictSame(mcClient.getTrackedStates(), []);
                ts.end();
            });
            await tap.test("restart and stop Master Control without track handler", async (ts) => {
                ts.equal(mcClient._trackHandler, undefined);
                await mcClient.start();
                ts.equal(mcClient._trackHandler, undefined);
                await mcClient.stop();
                ts.equal(mcClient._trackHandler, undefined);
            });
            tap.endAll();
        });
    });
    await t.test("publish order on Master Control", async () => {
        order1 = await mcClient.publish(__1.Topic.Order, agvId, headerlessOrder1);
    });
});
