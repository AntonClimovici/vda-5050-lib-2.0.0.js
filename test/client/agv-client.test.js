"use strict";
/*! Copyright (c) 2021 Siemens AG. Licensed under the MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const tap = require("tap");
const __1 = require("../..");
const test_context_1 = require("../test-context");
const test_objects_1 = require("../test-objects");
(0, test_context_1.initTestContext)(tap);
tap.test("AGV Client", async (t) => {
    const agvId = (0, test_objects_1.createAgvId)("RobotCompany", "001");
    const clientOptions = (0, test_context_1.testClientOptions)(t);
    const client = new __1.AgvClient(agvId, clientOptions);
    await t.test("validate subscription topic direction", async (ts) => {
        ts.teardown(() => client.stop());
        await client.start();
        ts.throws(() => client.subscribe(__1.Topic.Connection, () => { }));
        ts.throws(() => client.subscribe(__1.Topic.State, () => { }));
        ts.throws(() => client.subscribe(__1.Topic.Visualization, () => { }));
        ts.resolves(client.subscribe(__1.Topic.InstantActions, () => { }));
        ts.resolves(client.subscribe(__1.Topic.Order, () => { }));
    });
    await t.test("validate publication topic direction", async (ts) => {
        ts.teardown(() => client.stop());
        await client.start();
        ts.resolves(client.publish(__1.Topic.Connection, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Connection)));
        ts.resolves(client.publish(__1.Topic.State, (0, test_objects_1.createHeaderlessObject)(__1.Topic.State)));
        ts.resolves(client.publish(__1.Topic.Visualization, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Visualization)));
        ts.throws(() => client.publish(__1.Topic.InstantActions, (0, test_objects_1.createHeaderlessObject)(__1.Topic.InstantActions)));
        ts.throws(() => client.publish(__1.Topic.Order, (0, test_objects_1.createHeaderlessObject)(__1.Topic.Order)));
    });
});
