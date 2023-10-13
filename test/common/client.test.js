"use strict";
/*! Copyright (c) 2021 Siemens AG. Licensed under the MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const tap = require("tap");
const __1 = require("../..");
const client_types_1 = require("../../common/client-types");
const test_broker_1 = require("../test-broker");
const test_context_1 = require("../test-context");
const test_objects_1 = require("../test-objects");
class TestClient extends __1.Client {
    publish(topic, subject, object, options) {
        return this.publishTopic(topic, subject, object, options);
    }
    subscribe(topic, subject, handler) {
        return this.subscribeTopic(topic, subject, handler);
    }
    getLastWillTopic() {
        return {
            topic: __1.Topic.Connection,
            subject: (0, test_objects_1.createAgvId)("RobotCompany", "001"),
            object: {
                connectionState: __1.ConnectionState.Connectionbroken,
            },
            retainMessage: true,
        };
    }
}
(0, test_context_1.initTestContext)(tap);
tap.test("Client", async (t) => {
    const agvId = (0, test_objects_1.createAgvId)("RobotCompany", "001");
    const clientOptions = (0, test_context_1.testClientOptions)(t);
    const client = new TestClient(clientOptions);
    const topicLevelTooLong = "a".repeat(65536);
    const extensionValidator = (topic, object) => {
        if (object.topic !== topic) {
            throw new TypeError(`Extension object not valid`);
        }
    };
    t.test("isPlainObject", ts => {
        ts.equal((0, client_types_1.isPlainObject)(null), false);
        ts.equal((0, client_types_1.isPlainObject)(undefined), false);
        ts.equal((0, client_types_1.isPlainObject)({}), true);
        ts.end();
    });
    t.test("check client options, protocol version, and UUID creation", ts => {
        ts.strictSame(client.clientOptions, clientOptions, "expect supplied options");
        ts.equal(client.protocolVersion, "1.1.0", "expect correct protocol version");
        ts.match(client.createUuid(), test_context_1.UUID_REGEX);
        ts.end();
    });
    t.test("throws synchronously not started", ts => {
        ts.throws(() => client.publish(__1.Topic.Order, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order)));
        ts.throws(() => client.subscribe(__1.Topic.Order, agvId, () => { }));
        ts.throws(() => client.unsubscribe("whatever"));
        ts.equal(client.isStarted, false);
        ts.end();
    });
    t.test("throws synchronously after stopped", async (ts) => {
        await client.start();
        ts.equal(client.isStarted, true);
        await client.stop();
        ts.throws(() => client.publish(__1.Topic.Order, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order)));
        ts.throws(() => client.subscribe(__1.Topic.Order, agvId, () => { }));
        ts.throws(() => client.unsubscribe("whatever"));
        ts.equal(client.isStarted, false);
    });
    await t.test("connection refused on unreachable broker", async (ts) => {
        ts.teardown(() => client1.stop());
        const opts = (0, test_context_1.testClientOptions)(ts, { transport: { brokerUrl: (0, test_context_1.testClientOptions)(ts).transport.brokerUrl + "0" } });
        const client1 = new TestClient(opts);
        ts.rejects(client1.start());
    });
    await t.test("connect with websocket protocol on browser platform", async (ts) => {
        ts.teardown(() => client1.stop());
        const opts = (0, test_context_1.testClientOptions)(ts, { transport: { brokerUrl: (0, test_context_1.testClientOptions)(ts).transport.wsBrokerUrl } });
        const client1 = new TestClient(opts);
        client1._isWebPlatform = true;
        ts.resolves(client1.start());
    });
    await t.test("start-stop in series", async (ts) => {
        ts.teardown(() => client.stop());
        await client.stop();
        await client.start();
        await client.start();
        await client.stop();
        await client.stop();
        await client.start();
        await client.stop();
    });
    await t.test("validate client options", async (ts) => {
        const opts = (0, test_context_1.testClientOptions)(t);
        const brokerUrl = opts.transport.brokerUrl;
        const transportOpts = opts.transport;
        opts.transport = undefined;
        ts.throws(() => new TestClient(opts));
        opts.transport = transportOpts;
        opts.transport.brokerUrl = undefined;
        ts.throws(() => new TestClient(opts));
        opts.transport.brokerUrl = "";
        ts.throws(() => new TestClient(opts));
        opts.transport.brokerUrl = brokerUrl;
        opts.interfaceName = undefined;
        ts.throws(() => new TestClient(opts));
        opts.interfaceName = "";
        ts.doesNotThrow(() => new TestClient(opts));
        opts.interfaceName = "\u0000";
        ts.throws(() => new TestClient(opts));
        opts.interfaceName = "+";
        ts.throws(() => new TestClient(opts));
        opts.interfaceName = "#";
        ts.throws(() => new TestClient(opts));
        opts.interfaceName = "/";
        ts.throws(() => new TestClient(opts));
    });
    await t.test("validate subscription topic and subject", async (ts) => {
        ts.teardown(() => client.stop());
        await client.start();
        ts.throws(() => client.subscribe(undefined, agvId, () => { }));
        ts.throws(() => client.subscribe("", agvId, () => { }));
        ts.throws(() => client.subscribe(topicLevelTooLong, agvId, () => { }));
        ts.throws(() => client.subscribe("\u0000", agvId, () => { }));
        ts.throws(() => client.subscribe("+", agvId, () => { }));
        ts.throws(() => client.subscribe("#", agvId, () => { }));
        ts.throws(() => client.subscribe("/", agvId, () => { }));
        let agvId1 = (0, test_objects_1.createAgvId)(undefined, "001");
        ts.resolves(client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)("", "001");
        ts.throws(() => client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)(topicLevelTooLong, "001");
        ts.throws(() => client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)("\u0000", "001");
        ts.throws(() => client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)("+", "001");
        ts.throws(() => client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)("#", "001");
        ts.throws(() => client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)("/", "001");
        ts.throws(() => client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", undefined);
        ts.resolves(client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", "");
        ts.throws(() => client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)(topicLevelTooLong, topicLevelTooLong);
        ts.throws(() => client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", "\u0000");
        ts.throws(() => client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", "+");
        ts.throws(() => client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", "#");
        ts.throws(() => client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", "/");
        ts.throws(() => client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", ",");
        ts.throws(() => client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", "A-Za-z0-9_.:-");
        ts.resolves(client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)(undefined, undefined);
        ts.resolves(client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", "001");
        ts.resolves(client.subscribe(__1.Topic.InstantActions, agvId1, () => { }));
    });
    await t.test("validate publication topic and subject", async (ts) => {
        ts.teardown(() => client.stop());
        await client.start();
        ts.throws(() => client.publish(undefined, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        ts.throws(() => client.publish("", agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        ts.throws(() => client.publish(topicLevelTooLong, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        ts.throws(() => client.publish("\u0000", agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        ts.throws(() => client.publish("+", agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        ts.throws(() => client.publish("#", agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        ts.throws(() => client.publish("/", agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        let agvId1 = (0, test_objects_1.createAgvId)(undefined, "001");
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)("", "001");
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)(topicLevelTooLong, "001");
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)("\u0000", "001");
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)("+", "001");
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)("#", "001");
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)("/", "001");
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", undefined);
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", "");
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)(topicLevelTooLong, topicLevelTooLong);
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", "\u0000");
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", "+");
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", "#");
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", "/");
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", ",");
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", "A-Za-z0-9_.:-");
        ts.resolves(client.publish(__1.Topic.InstantActions, agvId1, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
    });
    await t.test("validate publication topic object", async (ts) => {
        ts.teardown(() => client.stop());
        await client.start();
        let headerlessObject = (0, test_objects_1.createHeaderlessObject)(__1.Topic.Connection);
        await (0, test_objects_1.testObjectResolvesMatch)(ts, client, agvId, headerlessObject, client.publish(__1.Topic.Connection, agvId, headerlessObject));
        ts.throws(() => client.publish(__1.Topic.Connection, agvId, undefined));
        ts.throws(() => client.publish(__1.Topic.Connection, agvId, {}));
        ts.throws(() => client.publish(__1.Topic.Connection, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        headerlessObject = (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions);
        await (0, test_objects_1.testObjectResolvesMatch)(ts, client, agvId, headerlessObject, client.publish(__1.Topic.InstantActions, agvId, headerlessObject));
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId, undefined));
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId, {}));
        ts.throws(() => client.publish(__1.Topic.InstantActions, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Connection)));
        headerlessObject = (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order);
        await (0, test_objects_1.testObjectResolvesMatch)(ts, client, agvId, headerlessObject, client.publish(__1.Topic.Order, agvId, headerlessObject));
        ts.throws(() => client.publish(__1.Topic.Order, agvId, undefined));
        ts.throws(() => client.publish(__1.Topic.Order, agvId, {}));
        ts.throws(() => client.publish(__1.Topic.Order, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        headerlessObject = (0, test_objects_1.createHeaderlessObject)(__1.Topic.State);
        await (0, test_objects_1.testObjectResolvesMatch)(ts, client, agvId, headerlessObject, client.publish(__1.Topic.State, agvId, headerlessObject));
        ts.throws(() => client.publish(__1.Topic.State, agvId, undefined));
        ts.throws(() => client.publish(__1.Topic.State, agvId, {}));
        ts.throws(() => client.publish(__1.Topic.State, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        headerlessObject = (0, test_objects_1.createHeaderlessObject)(__1.Topic.Visualization);
        await (0, test_objects_1.testObjectResolvesMatch)(ts, client, agvId, headerlessObject, client.publish(__1.Topic.Visualization, agvId, headerlessObject));
        ts.resolves(client.publish(__1.Topic.Visualization, agvId, undefined));
        ts.resolves(client.publish(__1.Topic.Visualization, agvId, {}));
        ts.resolves(client.publish(__1.Topic.Visualization, agvId, {}));
        delete headerlessObject["agvPosition"].x;
        ts.throws(() => client.publish(__1.Topic.Visualization, agvId, headerlessObject));
        ts.resolves(client.publish(__1.Topic.Visualization, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        client.registerExtensionTopic("extension1", true, true, () => { });
        client._headerIds.set("extension1", 0xFFFFFFFF);
        headerlessObject = (0, test_objects_1.createHeaderlessObject)("extension1");
        await (0, test_objects_1.testObjectResolvesMatch)(ts, client, agvId, headerlessObject, client.publish("extension1", agvId, headerlessObject));
        ts.equal(client._headerIds.get("extension1"), 0);
    });
    await t.test("validate extension topic direction", async (ts) => {
        ts.teardown(() => client.stop());
        await client.start();
        client.registerExtensionTopic("extension1", true, true, () => { });
        ts.resolves(client.subscribe("extension1", agvId, () => { }));
        ts.resolves(client.publish("extension1", agvId, (0, test_objects_1.createHeaderlessObject)("extension1")));
        client.registerExtensionTopic("extension1", false, false, extensionValidator);
        ts.throws(() => client.subscribe("extension1", agvId, () => { }));
        ts.throws(() => client.publish("extension1", agvId, (0, test_objects_1.createHeaderlessObject)("extension1")));
        client.registerExtensionTopic("extension1", false, true, extensionValidator);
        ts.throws(() => client.subscribe("extension1", agvId, () => { }));
        ts.resolves(client.publish("extension1", agvId, (0, test_objects_1.createHeaderlessObject)("extension1")));
        ts.throws(() => client.publish("extension1", agvId, (0, test_objects_1.createHeaderlessObject)("extension2")));
        client.registerExtensionTopic("extension1", true, false, extensionValidator);
        ts.resolves(client.subscribe("extension1", agvId, () => { }));
        ts.throws(() => client.publish("extension1", agvId, (0, test_objects_1.createHeaderlessObject)("extension1")));
    });
    await t.test("pub-sub validated standard topic object", ts => new Promise(async (resolve) => {
        ts.teardown(() => client.stop());
        await client.start();
        await client.subscribe(__1.Topic.Order, agvId, (object, subject, topic) => {
            ts.equal(topic, __1.Topic.Order);
            ts.strictSame(subject, agvId);
            ts.strictSame(object, order);
            resolve();
        });
        const order = await client.publish(__1.Topic.Order, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order));
    }));
    await t.test("pub-sub non-validated standard topic object", ts => new Promise(async (resolve) => {
        const client1 = new TestClient({ ...clientOptions, topicObjectValidation: { inbound: false, outbound: false } });
        ts.teardown(() => client1.stop());
        await client1.start();
        await client1.subscribe(__1.Topic.Order, agvId, (object, subject, topic) => {
            ts.equal(topic, __1.Topic.Order);
            ts.strictSame(subject, agvId);
            ts.strictSame(object, action);
            resolve();
        });
        const action = await client1.publish(__1.Topic.Order, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions));
    }));
    await t.test("pub-sub validated extension topic object", ts => new Promise(async (resolve) => {
        ts.teardown(() => client.stop());
        client.registerExtensionTopic("extension1", true, true, extensionValidator);
        await client.start();
        await client.subscribe("extension1", agvId, (object, subject, topic) => {
            ts.equal(topic, "extension1");
            ts.strictSame(subject, agvId);
            ts.strictSame(object, extension1Object);
            resolve();
        });
        const extension1Object = await client.publish("extension1", agvId, (0, test_objects_1.createHeaderlessObject)("extension1"));
    }));
    await t.test("pub-sub non-validated extension topic object", ts => new Promise(async (resolve) => {
        ts.teardown(() => client.stop());
        client.registerExtensionTopic("extension1", true, true, () => { });
        await client.start();
        await client.subscribe("extension1", agvId, (object, subject, topic) => {
            ts.equal(topic, "extension1");
            ts.strictSame(subject, agvId);
            ts.strictSame(object, extensionObject2);
            resolve();
        });
        const extensionObject2 = await client.publish("extension1", agvId, (0, test_objects_1.createHeaderlessObject)("extension2"));
    }));
    await t.test("pub-sub with explicit timestamp in topic object", ts => new Promise(async (resolve) => {
        ts.teardown(() => client.stop());
        const timestamp = new Date(2000, 2, 10).toISOString();
        await client.start();
        await client.subscribe(__1.Topic.Order, agvId, (object) => {
            ts.equal(order.timestamp, timestamp);
            ts.equal(object.timestamp, timestamp);
            resolve();
        });
        const orderWithTimestamp = Object.assign((0, test_objects_1.createHeaderlessObject)(__1.Topic.Order), { timestamp });
        const order = await client.publish(__1.Topic.Order, agvId, orderWithTimestamp);
    }));
    await t.test("pub-sub with non-default client transport options", ts => new Promise(async (resolve) => {
        const client1 = new TestClient({
            ...clientOptions,
            transport: {
                brokerUrl: clientOptions.transport.brokerUrl,
                protocolVersion: "3.1.1",
                heartbeat: 60,
                reconnectPeriod: 2000,
                connectTimeout: 10000,
                tlsOptions: {},
                wsOptions: {},
            },
        });
        ts.teardown(() => client1.stop());
        await client1.start();
        await client1.subscribe(__1.Topic.Order, agvId, (object, subject, topic) => {
            ts.equal(topic, __1.Topic.Order);
            ts.strictSame(subject, agvId);
            ts.strictSame(object, order);
            resolve();
        });
        const order = await client1.publish(__1.Topic.Order, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order));
    }));
    if (t.context.canStopAndRestartBrokerWhileTesting) {
        await t.test("pub-sub-unsub while offline", ts => new Promise(async (resolve, reject) => {
            ts.teardown(() => client.stop());
            await client.start();
            const subIdOrder = await client.subscribe(__1.Topic.Order, agvId, () => {
                ts.fail("receive unexpected order message");
                reject();
            });
            await (0, test_broker_1.stopBroker)();
            await new Promise(res => setTimeout(res, 500));
            await client.unsubscribe(subIdOrder);
            await client.subscribe(__1.Topic.Visualization, agvId, () => {
                ts.fail("receive unexpected visualization message");
                reject();
            });
            await client.subscribe(__1.Topic.Order, agvId, (object, subject, topic) => {
                ts.comment("callback second order subscribe");
                ts.equal(topic, __1.Topic.Order);
                ts.strictSame(subject, agvId);
                ts.strictSame(object, order);
                resolve();
            });
            const vis = await client.publish(__1.Topic.Visualization, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Visualization), { dropIfOffline: true });
            ts.equal(vis, undefined);
            const order = await client.publish(__1.Topic.Order, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order));
            await (0, test_broker_1.startBroker)();
        }));
    }
    await t.test("pub-sub-unsub fails if client is disconnecting", async (ts) => {
        ts.teardown(() => client.stop());
        await client.start();
        const subId1 = await client.subscribe(__1.Topic.Visualization, agvId, () => { });
        client._mqtt.disconnecting = true;
        ts.rejects(client.unsubscribe(subId1));
        ts.rejects(client.subscribe(__1.Topic.Visualization, agvId, () => { }));
        ts.rejects(client.publish(__1.Topic.Visualization, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Visualization)));
        client._mqtt.disconnecting = false;
    });
    await t.test("pub-sub-unsub resolves after client is stopped without await", async (ts) => {
        const client1 = new TestClient((0, test_context_1.testClientOptions)(ts));
        ts.teardown(() => stopPromise);
        await client1.start();
        const subId1 = await client1.subscribe(__1.Topic.Visualization, agvId, () => { });
        const stopPromise = client1.stop();
        ts.resolves(client1.unsubscribe(subId1));
        ts.resolves(client1.subscribe(__1.Topic.Visualization, agvId, () => { }));
        ts.resolves(client1.publish(__1.Topic.Visualization, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Visualization)));
    });
    await t.test("publication rejected on cyclic object", async (ts) => {
        ts.teardown(() => client.stop());
        await client.start();
        client.registerExtensionTopic("extension1", true, true, () => { });
        const obj = (0, test_objects_1.createHeaderlessObject)("extension1");
        obj.cyclic = obj;
        ts.throws(() => client.publish("extension1", agvId, obj));
    });
    if (t.context.supportsMqtt5) {
        await t.test("pub-sub with MQTT 5.0 protocol version", ts => new Promise(async (resolve) => {
            const client1 = new TestClient((0, test_context_1.testClientOptions)(ts, { transport: { protocolVersion: "5.0" } }));
            ts.teardown(() => client1.stop());
            await client1.start();
            await client1.subscribe(__1.Topic.Order, agvId, (object, subject, topic) => {
                ts.equal(topic, __1.Topic.Order);
                ts.strictSame(subject, agvId);
                ts.strictSame(object, order);
                resolve();
            });
            const order = await client1.publish(__1.Topic.Order, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order));
        }));
    }
    else if (t.context.canStopAndRestartBrokerWhileTesting) {
        await t.test("pub-sub with MQTT 5.0 protocol version not supported", ts => new Promise(resolve => {
            const client1 = new TestClient((0, test_context_1.testClientOptions)(ts, { transport: { protocolVersion: "5.0" } }));
            ts.teardown(async () => {
                await client1.stop();
                await (0, test_broker_1.stopBroker)();
                await (0, test_broker_1.startBroker)();
            });
            client1.start()
                .then(() => {
                ts.fail("start should not have succeeded");
                resolve();
            })
                .catch(() => resolve());
        }));
    }
    await t.test("inbound message dropped on invalid payload", ts => new Promise(async (resolve) => {
        ts.teardown(() => client.stop());
        await client.start();
        await client.subscribe(__1.Topic.Order, agvId, () => { });
        const mqttTopicOrder = client._subscriptionManager.getMqttTopic(__1.Topic.Order, agvId);
        let incomingCount = 0;
        (0, test_context_1.consoleRedirect)("error", (output, done) => {
            ts.match(output[0], `Drop inbound message on MQTT topic ${mqttTopicOrder} with error: `);
            if (++incomingCount === 5) {
                done();
                resolve();
            }
        });
        client._mqtt.publish(mqttTopicOrder, "}{");
        client._mqtt.publish(mqttTopicOrder, "undefined");
        client._mqtt.publish(mqttTopicOrder, "null");
        client._mqtt.publish(mqttTopicOrder, "42");
        client._mqtt.publish(mqttTopicOrder, "{}");
    }));
    await t.test("subscription handlers invoked in series", ts => new Promise(async (resolve) => {
        ts.teardown(() => client.stop());
        await client.start();
        let handlerInvocationCount = 0;
        const subIdOrder1 = await client.subscribe(__1.Topic.Order, agvId, (object, subject, topic, subId) => {
            handlerInvocationCount++;
            ts.equal(handlerInvocationCount, 1);
            ts.equal(topic, __1.Topic.Order);
            ts.strictSame(subject, agvId);
            ts.strictSame(object, order);
            ts.equal(subId, subIdOrder1);
        });
        const subIdOrder2 = await client.subscribe(__1.Topic.Order, agvId, (object, subject, topic, subId) => {
            handlerInvocationCount++;
            ts.equal(handlerInvocationCount, 2);
            ts.equal(topic, __1.Topic.Order);
            ts.strictSame(subject, agvId);
            ts.strictSame(object, order);
            ts.equal(subId, subIdOrder2);
            resolve();
        });
        const order = await client.publish(__1.Topic.Order, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order));
    }));
    await t.test("subscription handler unsubscribed in other handler", ts => new Promise(async (resolve) => {
        ts.teardown(() => client.stop());
        await client.start();
        let handlerInvocationCount = 0;
        const subIdOrder = await client.subscribe(__1.Topic.Order, agvId, async (object, subject, topic, subId) => {
            handlerInvocationCount++;
            await client.unsubscribe(subId2);
            ts.equal(handlerInvocationCount, 1);
            ts.equal(topic, __1.Topic.Order);
            ts.strictSame(subject, agvId);
            ts.strictSame(object, order);
            ts.equal(subId, subIdOrder);
            resolve();
        });
        const subId2 = await client.subscribe(__1.Topic.Order, agvId, () => {
            ts.fail("subscription already unsubscribed");
        });
        const order = await client.publish(__1.Topic.Order, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order));
    }));
    await t.test("subscription handler unsubscribed in same handler", ts => new Promise(async (resolve) => {
        ts.teardown(() => client.stop());
        await client.start();
        let handlerInvocationCount = 0;
        const subIdOrder = await client.subscribe(__1.Topic.Order, agvId, async (object, subject, topic, subId) => {
            handlerInvocationCount++;
            if (handlerInvocationCount > 1) {
                ts.fail("subscription already unsubscribed");
                return;
            }
            await client.unsubscribe(subId);
            ts.equal(handlerInvocationCount, 1);
            ts.equal(topic, __1.Topic.Order);
            ts.strictSame(subject, agvId);
            ts.strictSame(object, order1);
            ts.equal(subId, subIdOrder);
            resolve();
        });
        const order1 = await client.publish(__1.Topic.Order, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order));
        await client.publish(__1.Topic.Order, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order));
    }));
    await t.test("subscription handler throws synchronously", ts => new Promise(async (resolve) => {
        ts.teardown(() => client.stop());
        await client.start();
        await client.subscribe(__1.Topic.Order, agvId, () => {
            setTimeout(resolve, 0);
            throw new Error("Sync handler error");
        });
        ts.expectUncaughtException();
        await client.publish(__1.Topic.Order, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order));
    }));
    await t.test("connection state changed once online and offline", ts => new Promise(async (resolve) => {
        let numStateInvocations1 = 0;
        client.registerConnectionStateChange((state, prev) => {
            numStateInvocations1++;
            ts.equal(numStateInvocations1, 1);
            ts.equal(state, "offline");
            ts.equal(prev, "offline");
        });
        let numStateInvocations2 = 0;
        client.registerConnectionStateChange((state, prev) => {
            numStateInvocations2++;
            ts.equal(state, numStateInvocations2 === 2 ? "online" : "offline");
            ts.equal(prev, numStateInvocations2 === 3 ? "online" : "offline");
            if (numStateInvocations2 === 3) {
                resolve();
            }
        });
        await client.start();
        await client.stop();
    }));
});
