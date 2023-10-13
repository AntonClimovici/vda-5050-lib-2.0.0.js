"use strict";
/*! Copyright (c) 2021 Siemens AG. Licensed under the MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const tap = require("tap");
const __1 = require("../..");
const test_context_1 = require("../test-context");
const test_objects_1 = require("../test-objects");
(0, test_context_1.initTestContext)(tap);
tap.test("Master Control Client", async (t) => {
    const agvId = (0, test_objects_1.createAgvId)("RobotCompany", "001");
    const clientOptions = (0, test_context_1.testClientOptions)(t);
    const client = new __1.MasterControlClient(clientOptions);
    await t.test("validate subscription topic direction", async (ts) => {
        ts.teardown(() => client.stop());
        await client.start();
        ts.resolves(client.subscribe(__1.Topic.Connection, agvId, () => { }));
        ts.resolves(client.subscribe(__1.Topic.State, agvId, () => { }));
        ts.resolves(client.subscribe(__1.Topic.Visualization, agvId, () => { }));
        ts.throws(() => client.subscribe(__1.Topic.InstantActions, agvId, () => { }));
        ts.throws(() => client.subscribe(__1.Topic.Order, agvId, () => { }));
    });
    await t.test("validate publication topic direction", async (ts) => {
        ts.teardown(() => client.stop());
        await client.start();
        ts.throws(() => client.publish(__1.Topic.Connection, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Connection)));
        ts.throws(() => client.publish(__1.Topic.State, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.State)));
        ts.throws(() => client.publish(__1.Topic.Visualization, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Visualization)));
        ts.resolves(client.publish(__1.Topic.InstantActions, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        ts.resolves(client.publish(__1.Topic.Order, agvId, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order)));
    });
});
