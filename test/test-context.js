"use strict";
/*! Copyright (c) 2021 Siemens AG. Licensed under the MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.consoleRedirect = exports.testClientOptions = exports.initTestContext = exports.UUID_REGEX = void 0;
const os = require("os");
const path = require("path");
const util = require("util");
exports.UUID_REGEX = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/;
function initTestContext(tap) {
    const testContextFile = path.join(os.tmpdir(), "vda-5050-test-context.json");
    const testContext = require(testContextFile);
    Object.assign(tap.context, testContext);
    tap.beforeEach(t => {
        Object.assign(t.context, testContext);
    });
}
exports.initTestContext = initTestContext;
function testClientOptions(test, clientOptions) {
    const clone = obj => JSON.parse(JSON.stringify(obj));
    const defaultClientOptions = {
        interfaceName: `vda5050test${process.env.TAP_CHILD_ID}`,
        transport: {
            brokerUrl: test.context.brokerUrls[0],
        },
    };
    clientOptions = clientOptions && clone(clientOptions);
    const transportOptions = clientOptions === null || clientOptions === void 0 ? void 0 : clientOptions.transport;
    transportOptions && delete clientOptions.transport;
    const opts = Object.assign({}, defaultClientOptions, clientOptions);
    Object.assign(opts.transport, transportOptions, { wsBrokerUrl: test.context.brokerUrls[1] });
    return opts;
}
exports.testClientOptions = testClientOptions;
function consoleRedirect(mode, callback) {
    const output = [];
    let consoleFunc = console[mode];
    const completer = () => {
        if (consoleFunc === undefined) {
            return;
        }
        console[mode] = consoleFunc;
        consoleFunc = undefined;
        return output;
    };
    console[mode] = (data, ...args) => {
        output.push(util.format(data, ...args));
        if (callback) {
            callback(output, completer);
        }
    };
    return completer;
}
exports.consoleRedirect = consoleRedirect;
