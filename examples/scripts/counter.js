/********************************************************************************
 * Copyright (c) 2022 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the W3C Software Notice and
 * Document License (2015-05-13) which is available at
 * https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document.
 *
 * SPDX-License-Identifier: EPL-2.0 OR W3C-20150513
 ********************************************************************************/

// This is an example Thing script.
// It has a count property that can be incremented or decremented via actions and its changes are reported via events.
// It also has two properties that return an image. The SVG property is also influenced by the increment and decrement actions.
// Features
// * basic properties, actions, events
// * local/global uriVariables
// * multi-language
// * image contentTypes for properties (Note: the contentType applies to all forms of the property)
// * links with entry containing rel and sizes

const presenceSimulationInterval = 10000; // 10 секунд
let count = 0;
let lastChange = new Date().toISOString();
let presence = false;

WoT.produce({
    title: "Counter",
    description: "Counter example Thing with presence sensor",
    "@context": [
        "https://www.w3.org/2019/wot/td/v1",
        "https://www.w3.org/2022/wot/td/v1.1",
        {
            iot: "http://example.org/iot",
        },
    ],
    uriVariables: {
        step: {
            type: "integer",
            minimum: 1,
            maximum: 250,
        },
    },
    properties: {
        count: {
            type: "integer",
            description: "Current counter value",
            observable: true,
            readOnly: true,
        },
        lastChange: {
            type: "string",
            description: "Last change of counter value",
            observable: true,
            readOnly: true,
        },
        presence: {
            type: "boolean",
            description: "Indicates whether presence is detected",
            observable: true,
            readOnly: true,
        },
    },
    actions: {
        increment: {
            description: "Increment counter value",
        },
        decrement: {
            description: "Decrement counter value",
        },
        reset: {
            description: "Reset counter value",
        },
    },
    events: {
        change: {
            description: "Change event for counter",
        },
        presenceDetected: {
            description: "Triggered when presence is detected",
        },
    },
})
.then((thing) => {
    console.log("Produced " + thing.getThingDescription().title);

    // Handlers for reading properties
    thing.setPropertyReadHandler("count", async () => count);
    thing.setPropertyReadHandler("lastChange", async () => lastChange);
    thing.setPropertyReadHandler("presence", async () => presence);

    // Handlers for actions
    thing.setActionHandler("increment", async (params, options) => {
        let step = 1;
        if (options?.uriVariables?.step) {
            step = options.uriVariables.step;
        }
        count += step;
        lastChange = new Date().toISOString();
        console.log(`Incremented count to ${count}`);
        thing.emitEvent("change", count);
    });

    thing.setActionHandler("decrement", async (params, options) => {
        let step = 1;
        if (options?.uriVariables?.step) {
            step = options.uriVariables.step;
        }
        count -= step;
        lastChange = new Date().toISOString();
        console.log(`Decremented count to ${count}`);
        thing.emitEvent("change", count);
    });

    thing.setActionHandler("reset", async () => {
        count = 0;
        lastChange = new Date().toISOString();
        console.log("Reset count to 0");
        thing.emitEvent("change", count);
    });

    // Expose the Thing over the network
    thing.expose().then(() => {
        console.log("Thing is exposed and running at:");
        console.log(thing.getThingDescription().id || thing.getThingDescription().title);
    });

    // Simulate presence detection every 10 seconds
    setInterval(() => {
        presence = Math.random() < 0.5;
        thing.emitPropertyChange("presence");
        if (presence) {
            console.log("Presence detected!");
            thing.emitEvent("presenceDetected", { timestamp: new Date().toISOString() });
        } else {
            console.log("No presence detected.");
        }
    }, presenceSimulationInterval);
});
