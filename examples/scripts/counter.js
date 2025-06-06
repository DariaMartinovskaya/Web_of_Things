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

// SUMMARY OF CHANGES MADE:
//Added presence property to represent presence detection state.
//Added presenceDetected event to notify presence changes.
//Simulated presence state changes every 10 seconds using setInterval(...).
//Printed to console whether presence is detected or not.
//Added necessary read handler and emitters for presence.

let count;
let lastChange;
let presence = false; // Added: Variable to simulate presence sensor state

WoT.produce({
    title: "Counter",
    titles: {
        en: "Counter",
        de: "Zähler",
        it: "Contatore",
    },
    description: "Counter example Thing",
    descriptions: {
        en: "Counter example Thing",
        de: "Zähler Beispiel Ding",
        it: "Contatore di esempio",
    },
    support: "https://github.com/eclipse-thingweb/node-wot/",
    links: [
        {
            href: "https://www.thingweb.io/img/favicon/favicon.png",
            sizes: "16x14",
            rel: "icon",
        },
    ],
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
            title: "Count",
            titles: {
                en: "Count",
                de: "Zähler",
                it: "Valore",
            },
            type: "integer",
            description: "Current counter value",
            descriptions: {
                en: "Current counter value",
                de: "Derzeitiger Zählerwert",
                it: "Valore attuale del contatore",
            },
            "iot:Custom": "example annotation",
            observable: true,
            readOnly: true,
        },
        countAsImage: {
            description: "Current counter value as SVG image",
            descriptions: {
                en: "Current counter value as SVG image",
                de: "Aktueller Zählerwert als SVG-Bild",
                it: "Valore attuale del contatore come immagine SVG",
            },
            observable: false,
            readOnly: true,
            uriVariables: {
                fill: {
                    type: "string",
                },
            },
            forms: [
                {
                    contentType: "image/svg+xml",
                },
            ],
        },
        redDotImage: {
            description: "Red dot image as PNG",
            descriptions: {
                en: "Red dot image as PNG",
                de: "Rotes Punktbild als PNG",
                it: "Immagine punto rosso come PNG",
            },
            observable: false,
            readOnly: true,
            forms: [
                {
                    contentType: "image/png;base64",
                },
            ],
        },
        lastChange: {
            title: "Last change",
            titles: {
                en: "Last change",
                de: "Letzte Zählerwertänderung",
                it: "Ultima modifica",
            },
            type: "string",
            description: "Last change of counter value",
            descriptions: {
                en: "Last change of counter value",
                de: "Letzte Änderung",
                it: "Ultima modifica del valore",
            },
            observable: true,
            readOnly: true,
        },
        presence: {
            // Added: Presence sensor property
            title: "Presence",
            titles: {
                en: "Presence",
                de: "Anwesenheit",
                it: "Presenza",
            },
            type: "boolean",
            description: "Presence detected",
            descriptions: {
                en: "Presence detected",
                de: "Anwesenheit erkannt",
                it: "Presenza rilevata",
            },
            observable: true,
            readOnly: true,
        },
    },
    actions: {
        increment: {
            title: "Increment",
            titles: {
                en: "Increment",
                de: "Erhöhen",
                it: "Incrementa",
            },
            description: "Increment counter value",
            descriptions: {
                en: "Increment counter value",
                de: "Zählerwert erhöhen",
                it: "Incrementa il valore del contatore",
            },
        },
        decrement: {
            title: "Decrement",
            titles: {
                en: "Decrement",
                de: "Verringern",
                it: "Decrementa",
            },
            description: "Decrementing counter value",
            descriptions: {
                en: "Decrementing counter value",
                de: "Zählerwert verringern",
                it: "Decrementare il valore del contatore",
            },
        },
        reset: {
            title: "Reset",
            titles: {
                en: "Reset",
                de: "Zurücksetzen",
                it: "Reset",
            },
            description: "Resetting counter value",
            descriptions: {
                en: "Resetting counter value",
                de: "Zählerwert zurücksetzen",
                it: "Resettare il valore del contatore",
            },
        },
    },
    events: {
        change: {
            title: "Changed",
            titles: {
                en: "Changed",
                de: "Geändert",
                it: "Valore modificato",
            },
            description: "Change event",
            descriptions: {
                en: "Change event",
                de: "Änderungsereignis",
                it: "Valore modificato",
            },
        },
        presenceDetected: {
            // Added: Event for presence changes
            title: "Presence Detected",
            titles: {
                en: "Presence Detected",
                de: "Anwesenheit erkannt",
                it: "Presenza rilevata",
            },
            description: "Event emitted when presence changes",
            descriptions: {
                en: "Event emitted when presence changes",
                de: "Ereignis bei Anwesenheitsänderung",
                it: "Evento generato al cambio presenza",
            },
            data: {
                type: "object",
                properties: {
                    presence: {
                        type: "boolean",
                    },
                },
            },
        },
    },
})
    .then((thing) => {
        console.log("Produced " + thing.getThingDescription().title);
        // init property values
        count = 0;
        lastChange = new Date().toISOString();

        // Property handlers
        thing.setPropertyReadHandler("count", async () => count);
        thing.setPropertyReadHandler("lastChange", async () => lastChange);
        thing.setPropertyReadHandler("presence", async () => presence); // Added: read presence state

        thing.setPropertyReadHandler("countAsImage", async (options) => {
            let fill = "black";
            if (options && typeof options === "object" && "uriVariables" in options) {
                console.log("options = " + JSON.stringify(options));
                if (options.uriVariables && "fill" in options.uriVariables) {
                    const uriVariables = options.uriVariables;
                    fill = uriVariables.fill;
                }
            }
            return (
                "<svg xmlns='http://www.w3.org/2000/svg' height='30' width='200'>" +
                "<text x='0' y='15' fill='" +
                fill +
                "'>" +
                count +
                "</text>" +
                "</svg>"
            );
        });

        thing.setPropertyReadHandler(
            "redDotImage",
            async () =>
                "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
        );

        // Action handlers
        thing.setActionHandler("increment", async (params, options) => {
            let step = 1;
            if (options && typeof options === "object" && "uriVariables" in options) {
                //console.log("options = " + JSON.stringify(options));
                if (options.uriVariables && "step" in options.uriVariables) {
                    const uriVariables = options.uriVariables;
                    step = uriVariables.step;
                    console.log("Step parameter received: " + step); // Changed to see more simple text in output

                }
            }
            const newValue = count + step;
            console.log("Incrementing count from " + count + " to " + newValue + " (with step " + step + ")");
            count = newValue;
            lastChange = new Date().toISOString();
            thing.emitEvent("change", count);
            thing.emitPropertyChange("count");
            return undefined;
        });

        thing.setActionHandler("decrement", async (params, options) => {
            let step = 1;
            if (options && typeof options === "object" && "uriVariables" in options) {
                //console.log("options = " + JSON.stringify(options));
                if (options.uriVariables && "step" in options.uriVariables) {
                    const uriVariables = options.uriVariables;
                    step = uriVariables.step;
                    console.log("Step parameter received: " + step); // Changed to see more simple text in output
                }
            }
            const newValue = count - step;
            console.log("Decrementing count from " + count + " to " + newValue + " (with step " + step + ")");
            count = newValue;
            lastChange = new Date().toISOString();
            thing.emitEvent("change", count);
            thing.emitPropertyChange("count");
            return undefined;
        });

        thing.setActionHandler("reset", async (params, options) => {
            console.log("Resetting count");
            count = 0;
            lastChange = new Date().toISOString();
            thing.emitEvent("change", count);
            thing.emitPropertyChange("count");
            return undefined;
        });

        // Added: Simulate presence detection by toggling presence every 10 seconds
        setInterval(() => {
            presence = !presence;
            if (presence) {
                console.log("Presence detected.");
            } else {
                console.log("No presence detected.");
            }
            thing.emitEvent("presenceDetected", { presence });
            thing.emitPropertyChange("presence");
        }, 10000);

        // expose the thing
        thing.expose().then(() => {
            console.info(thing.getThingDescription().title + " ready");
        });
    })
    .catch((e) => {
        console.log(e);
    });
