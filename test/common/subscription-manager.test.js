"use strict";
/*! Copyright (c) 2021 Siemens AG. Licensed under the MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const tap = require("tap");
const uuid_1 = require("uuid");
const test_context_1 = require("../test-context");
const test_objects_1 = require("../test-objects");
const __1 = require("../..");
const subscription_manager_1 = require("../../common/subscription-manager");
(0, test_context_1.initTestContext)(tap);
const agvId = (0, test_objects_1.createAgvId)("RobotCompany", "001");
const interfaceName = (0, test_context_1.testClientOptions)(tap).interfaceName;
const subscriptionIds = [];
const subscriptionHandlersPerId = new Map();
function testAdd(test, name, topic, subject, mqttTopicExpected, requiresSubscribeExpected) {
    test.test(name, ts => {
        const handler = () => { };
        const { id, mqttTopic, requiresSubscribe } = manager.add(topic, subject, handler);
        subscriptionIds.push(id);
        subscriptionHandlersPerId.set(id, handler);
        ts.match(id, test_context_1.UUID_REGEX);
        ts.equal(mqttTopic, mqttTopicExpected);
        ts.equal(requiresSubscribe, requiresSubscribeExpected);
        ts.equal(subscriptionHandlersPerId.size, subscriptionIds.length);
        ts.end();
    });
}
function testFind(test, name, mqttTopic, subject, topicExpected, numHandlersExpected) {
    test.test(name, ts => {
        const [idAndHandlers, topic] = manager.find(mqttTopic, subject);
        let count = 0;
        ts.equal(topic, topicExpected);
        for (const [id, handler] of idAndHandlers) {
            count++;
            ts.equal(subscriptionHandlersPerId.has(id), true);
            ts.equal(handler, subscriptionHandlersPerId.get(id));
        }
        ts.equal(count, numHandlersExpected);
        ts.end();
    });
}
function testRemove(test, name, subscriptionId, mqttTopicExpected, requiresUnsubscribeExpected) {
    test.test(name, ts => {
        var _a;
        const { mqttTopic, requiresUnsubscribe } = (_a = manager.remove(subscriptionId)) !== null && _a !== void 0 ? _a : {};
        ts.equal(mqttTopic, mqttTopicExpected);
        ts.equal(requiresUnsubscribeExpected, requiresUnsubscribe);
        ts.end();
    });
}
function testGetAll(test, name, mqttTopicsExpected) {
    test.test(name, ts => {
        const mqttTopics = manager.getAll();
        ts.strictSame(mqttTopics.sort(), mqttTopicsExpected.sort());
        ts.end();
    });
}
let manager = new subscription_manager_1.SubscriptionManager("%interfaceName%/%majorVersion%/%manufacturer%/%serialNumber%/%topic%", interfaceName, "2.1.0");
tap.test("Subscription Manager with default topic format", t => {
    testGetAll(t, "get all managed MQTT topics #1", []);
    testAdd(t, "add fixed subscription", __1.Topic.Order, agvId, `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, true);
    testGetAll(t, "get all managed MQTT topics #2", [
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`,
    ]);
    testAdd(t, "add fixed subscription a second time", __1.Topic.Order, agvId, `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, false);
    testGetAll(t, "get all managed MQTT topics #3", [
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`,
    ]);
    testAdd(t, "add wildcard topic subscription", undefined, agvId, `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/+`, true);
    testGetAll(t, "get all managed MQTT topics #4", [
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`,
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/+`,
    ]);
    testAdd(t, "add wildcard topic subscription a second time", undefined, agvId, `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/+`, false);
    testGetAll(t, "get all managed MQTT topics #5", [
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`,
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/+`,
    ]);
    testAdd(t, "add wildcard subject subscription", __1.Topic.Order, {}, `${interfaceName}/v2/+/+/${__1.Topic.Order}`, true);
    testGetAll(t, "get all managed MQTT topics #6", [
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`,
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/+`,
        `${interfaceName}/v2/+/+/${__1.Topic.Order}`,
    ]);
    testAdd(t, "add wildcard subject subscription a second time", __1.Topic.Order, {}, `${interfaceName}/v2/+/+/${__1.Topic.Order}`, false);
    testGetAll(t, "get all managed MQTT topics #7", [
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`,
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/+`,
        `${interfaceName}/v2/+/+/${__1.Topic.Order}`,
    ]);
    testAdd(t, "add wildcard topic and subject subscription", undefined, {}, `${interfaceName}/v2/+/+/+`, true);
    testGetAll(t, "get all managed MQTT topics #8", [
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`,
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/+`,
        `${interfaceName}/v2/+/+/${__1.Topic.Order}`,
        `${interfaceName}/v2/+/+/+`,
    ]);
    testAdd(t, "add wildcard topic and subject subscription a second time", undefined, {}, `${interfaceName}/v2/+/+/+`, false);
    testGetAll(t, "get all managed MQTT topics #9", [
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`,
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/+`,
        `${interfaceName}/v2/+/+/${__1.Topic.Order}`,
        `${interfaceName}/v2/+/+/+`,
    ]);
    testFind(t, "find matching subscriptions", `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, agvId, __1.Topic.Order, 8);
    testRemove(t, "remove first fixed subscription", subscriptionIds[0], `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, false);
    testGetAll(t, "get all managed MQTT topics #10", [
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`,
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/+`,
        `${interfaceName}/v2/+/+/${__1.Topic.Order}`,
        `${interfaceName}/v2/+/+/+`,
    ]);
    testFind(t, "find remaining subscriptions", `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, agvId, __1.Topic.Order, 7);
    testRemove(t, "remove second fixed subscription", subscriptionIds[1], `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, true);
    testGetAll(t, "get all managed MQTT topics #11", [
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/+`,
        `${interfaceName}/v2/+/+/${__1.Topic.Order}`,
        `${interfaceName}/v2/+/+/+`,
    ]);
    testFind(t, "find remaining subscriptions", `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, agvId, __1.Topic.Order, 6);
    testRemove(t, "remove first wildcard topic subscription", subscriptionIds[2], `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/+`, false);
    testGetAll(t, "get all managed MQTT topics #12", [
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/+`,
        `${interfaceName}/v2/+/+/${__1.Topic.Order}`,
        `${interfaceName}/v2/+/+/+`,
    ]);
    testFind(t, "find remaining subscriptions", `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, agvId, __1.Topic.Order, 5);
    testRemove(t, "remove second wildcard topic subscription", subscriptionIds[3], `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/+`, true);
    testGetAll(t, "get all managed MQTT topics #13", [
        `${interfaceName}/v2/+/+/${__1.Topic.Order}`,
        `${interfaceName}/v2/+/+/+`,
    ]);
    testFind(t, "find remaining subscriptions", `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, agvId, __1.Topic.Order, 4);
    testRemove(t, "remove first wildcard subject subscription", subscriptionIds[4], `${interfaceName}/v2/+/+/${__1.Topic.Order}`, false);
    testGetAll(t, "get all managed MQTT topics #14", [
        `${interfaceName}/v2/+/+/${__1.Topic.Order}`,
        `${interfaceName}/v2/+/+/+`,
    ]);
    testFind(t, "find remaining subscriptions", `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, agvId, __1.Topic.Order, 3);
    testRemove(t, "remove second wildcard subject subscription", subscriptionIds[5], `${interfaceName}/v2/+/+/${__1.Topic.Order}`, true);
    testGetAll(t, "get all managed MQTT topics #15", [
        `${interfaceName}/v2/+/+/+`,
    ]);
    testFind(t, "find remaining subscriptions", `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, agvId, __1.Topic.Order, 2);
    testRemove(t, "remove first wildcard topic and subject subscription", subscriptionIds[6], `${interfaceName}/v2/+/+/+`, false);
    testGetAll(t, "get all managed MQTT topics #16", [
        `${interfaceName}/v2/+/+/+`,
    ]);
    testFind(t, "find remaining subscriptions", `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, agvId, __1.Topic.Order, 1);
    testRemove(t, "remove second wildcard topic and subject subscription", subscriptionIds[7], `${interfaceName}/v2/+/+/+`, true);
    testGetAll(t, "get all managed MQTT topics #17", []);
    testFind(t, "find remaining subscriptions", `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, agvId, __1.Topic.Order, 0);
    testRemove(t, "remove unregistered subscription", (0, uuid_1.v4)(), undefined, undefined);
    testGetAll(t, "get all managed MQTT topics #18", []);
    testAdd(t, "add subscription to be cleared afterwards", __1.Topic.Order, agvId, `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, true);
    testGetAll(t, "get all managed MQTT topics #19", [
        `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`,
    ]);
    manager.clear();
    testFind(t, "find no subscriptions after clear", `${interfaceName}/v2/${agvId.manufacturer}/${agvId.serialNumber}/${__1.Topic.Order}`, agvId, __1.Topic.Order, 0);
    testGetAll(t, "get all managed MQTT topics #20", []);
    t.end();
});
tap.test("Subscription Manager with custom topic format", t => {
    t.throws(() => new subscription_manager_1.SubscriptionManager("spBv1.0/GRP_0/NDATA/%manufacturer%", interfaceName, "2.1.0"));
    t.throws(() => new subscription_manager_1.SubscriptionManager("spBv1.0/GRP_0/NDATA/%topic%foo", interfaceName, "2.1.0"));
    t.throws(() => new subscription_manager_1.SubscriptionManager("spBv1.0/GRP_0/NDATA/foo%topic%", interfaceName, "2.1.0"));
    t.throws(() => new subscription_manager_1.SubscriptionManager("spBv1.0/GRP_0/NDATA/%topic%/%topic%", interfaceName, "2.1.0"));
    t.throws(() => new subscription_manager_1.SubscriptionManager("spBv1.0/GRP_0/NDATA/%manufacturer%/%manufacturer%/%topic%", interfaceName, "2.1.0"));
    t.doesNotThrow(() => new subscription_manager_1.SubscriptionManager("spBv1.0/GRP_0/NDATA/%topic%/%serialNumber%/%manufacturer%", interfaceName, "2.1.0"));
    t.doesNotThrow(() => new subscription_manager_1.SubscriptionManager("spBv1.0/GRP_0/NDATA/%topic%", interfaceName, "2.1.0"));
    t.doesNotThrow(() => {
        const sm = new subscription_manager_1.SubscriptionManager("%interfaceName%/%topic%", interfaceName, "2.1.0");
        sm.add("a".repeat(65535 - 1 - interfaceName.length - 12) + "\u0080\u0800\ud803\ude6d\uffff", {}, () => { });
    });
    t.throws(() => {
        const sm = new subscription_manager_1.SubscriptionManager("%interfaceName%/%topic%", interfaceName, "2.1.0");
        sm.add("a".repeat(65535 - 1 - interfaceName.length - 12 + 1) + "\u0080\u0800\ud803\ude6d\uffff", {}, () => { });
    });
    manager = new subscription_manager_1.SubscriptionManager("spBv1.0/GRP_0/NDATA/%topic%/42", interfaceName, "2.1.0");
    testAdd(t, "add custom subscription", __1.Topic.State, agvId, `spBv1.0/GRP_0/NDATA/${__1.Topic.State}/42`, true);
    testFind(t, "find custom subscriptions", `spBv1.0/GRP_0/NDATA/${__1.Topic.State}/42`, agvId, __1.Topic.State, 1);
    t.end();
});
