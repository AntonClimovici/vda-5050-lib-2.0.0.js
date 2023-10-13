"use strict";
/*! Copyright (c) 2021 Siemens AG. Licensed under the MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const tap = require("tap");
const test_context_1 = require("../test-context");
const test_objects_1 = require("../test-objects");
const __1 = require("../..");
(0, test_context_1.initTestContext)(tap);
const agvId1 = (0, test_objects_1.createAgvId)("RobotCompany", "001");
const agvId2 = (0, test_objects_1.createAgvId)("RobotCompany", "002");
const agvIdMap = new __1.AgvIdMap();
tap.test("AgvIdMap", t => {
    t.equal(agvIdMap.size, 0);
    t.equal(agvIdMap.get(agvId1), undefined);
    t.equal(agvIdMap.get(agvId2), undefined);
    for (const [agvId, value] of agvIdMap) {
        t.fail(`Iteration returns entries ${agvId} - ${value}`);
    }
    agvIdMap.set(agvId1, 42);
    agvIdMap.set(agvId2, 43);
    t.equal(agvIdMap.get(agvId1), 42);
    t.equal(agvIdMap.get(agvId2), 43);
    t.equal(agvIdMap.size, 2);
    let iteration = 0;
    for (const [agvId, value] of agvIdMap) {
        iteration++;
        if (iteration === 1) {
            t.strictSame(agvId, agvId1);
            t.equal(value, 42);
        }
        else if (iteration === 2) {
            t.strictSame(agvId, agvId2);
            t.equal(value, 43);
        }
        else {
            t.fail("Iteration returns superfluous entries");
        }
    }
    agvIdMap.delete(agvId2);
    t.equal(agvIdMap.get(agvId1), 42);
    t.equal(agvIdMap.get(agvId2), undefined);
    t.equal(agvIdMap.size, 1);
    agvIdMap.delete(agvId2);
    t.equal(agvIdMap.get(agvId1), 42);
    t.equal(agvIdMap.get(agvId2), undefined);
    t.equal(agvIdMap.size, 1);
    agvIdMap.delete(agvId1);
    t.equal(agvIdMap.get(agvId1), undefined);
    t.equal(agvIdMap.get(agvId2), undefined);
    t.equal(agvIdMap.size, 0);
    agvIdMap.delete(agvId1);
    t.equal(agvIdMap.get(agvId1), undefined);
    t.equal(agvIdMap.get(agvId2), undefined);
    t.equal(agvIdMap.size, 0);
    agvIdMap.set(agvId1, 42);
    agvIdMap.set(agvId2, 43);
    t.equal(agvIdMap.get(agvId1), 42);
    t.equal(agvIdMap.get(agvId2), 43);
    t.equal(agvIdMap.size, 2);
    agvIdMap.clear();
    t.equal(agvIdMap.size, 0);
    t.end();
});
