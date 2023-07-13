/*! Copyright (c) 2021 Siemens AG. Licensed under the MIT License. */
import * as tp from "tap";
import { ClientOptions, MqttTransportOptions } from "..";
/**
 * Regexp describing a valid UUID v4 string.
 */
export declare const UUID_REGEX: RegExp;
/**
 * Initialize the toplevel tap test context.
 *
 * This function must be invoked in any test file *before* executing tests.
 *
 * @param tap a root-level Tap object as imported from "tap"
 */
export declare function initTestContext(tap: typeof tp): void;
/**
 * Gets default test client options merged with the given partial options.
 *
 * @param test a tap Test object
 * @param clientOptions overwriting partial client options (optional)
 * @returns client options for the given test
 */
export declare function testClientOptions(test: typeof tp.Test.prototype, clientOptions?: Partial<Omit<ClientOptions, "transport"> & {
    transport?: Partial<MqttTransportOptions>;
}>): ClientOptions & Partial<Omit<ClientOptions, "transport"> & {
    transport?: Partial<MqttTransportOptions>;
}>;
/**
 * Redirect output of a console logging function to a string array.
 *
 * @param mode the type of console to redirect
 * @param callback a function invoked whenever a new output string has been
 * generated; call the `done` function to stop redirection (optional)
 * @returns a function that, when called, stops redirection and returns an array
 * of redirected output strings ordered by console function invocations.
 */
export declare function consoleRedirect(mode: "log" | "error" | "info" | "warn" | "debug", callback?: (output: string[], done: () => void) => void): () => string[];
