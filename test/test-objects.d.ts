/*! Copyright (c) 2021 Siemens AG. Licensed under the MIT License. */
import * as tp from "tap";
import { AgvId, Client, Headerless, Topic, TopicObject, Vda5050Object } from "..";
/** Provides VDA 5050 mock objects and AGV identifiers for testing. */
/**
 * Create a new AGV identity for the given serial number.
 *
 * @param manufacturer manufacturer of AGV or undefined
 * @param serialNumber serial number of AGV or undefined
 */
export declare function createAgvId(manufacturer: string, serialNumber: string): AgvId;
/**
 * Creates a headerless VDA 5005 object with default properties for the given
 * communication topic.
 *
 * @param topic a VDA 5050 standard or extension communication topic
 */
export declare function createHeaderlessObject<T extends string>(topic: T extends Topic ? T : string): Headerless<TopicObject<T>>;
/**
 * Verifies that the promise resolves to a headerfull VDA 5050 object and
 * furthermore that the given headerless object matches the resolved object.
 *
 * @param test the test in context
 * @param client the client instance
 * @param subject the corresponding AGV identifier
 * @param headerlessObject a headerless object to test
 * @param promise a promise that resolves a VDA 5050 object
 */
export declare function testObjectResolvesMatch(test: typeof tp.Test.prototype, client: Client, subject: AgvId, headerlessObject: Headerless<Vda5050Object>, promise: Promise<Vda5050Object>): Promise<void>;
