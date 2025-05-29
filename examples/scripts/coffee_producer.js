const { Servient } = require("@node-wot/core");
const MqttClientFactory = require("@node-wot/binding-mqtt").MqttClientFactory;

const td = {
  title: "CoffeeMachine",
  id: "urn:dev:wot:coffee-machine",
  securityDefinitions: {
    nosec_sc: { scheme: "nosec" },
  },
  security: ["nosec_sc"],
  properties: {
    availableResourceLevel: {
      type: "integer",
      observable: true,
      readOnly: true,
      forms: [{
        href: "mqtt://test.mosquitto.org/CoffeeMachine/properties/availableResourceLevel",
        contentType: "application/json",
        op: ["observeproperty", "readproperty"],
      }],
    },
    possibleDrinks: {
      type: "array",
      items: { type: "string" },
      readOnly: true,
      forms: [{
        href: "mqtt://test.mosquitto.org/CoffeeMachine/properties/possibleDrinks",
        contentType: "application/json",
        op: ["readproperty"],
      }],
    },
    maintenanceNeeded: {
      type: "boolean",
      readOnly: true,
      forms: [{
        href: "mqtt://test.mosquitto.org/CoffeeMachine/properties/maintenanceNeeded",
        contentType: "application/json",
        op: ["readproperty"],
      }],
    },
  },
  actions: {
    makeDrink: {
      input: { type: "string" },
      forms: [{
        href: "mqtt://test.mosquitto.org/CoffeeMachine/actions/makeDrink",
        contentType: "application/json",
        op: ["invokeaction"],
      }],
    },
  },
  events: {
    outOfResource: {
      data: { type: "string" },
      forms: [{
        href: "mqtt://test.mosquitto.org/CoffeeMachine/events/outOfResource",
        contentType: "application/json",
        op: ["subscribeevent"],
      }],
    },
  },
};

async function main() {
  const servient = new Servient();
  servient.addClientFactory(new MqttClientFactory({ uri: "mqtt://test.mosquitto.org" }));

  try {
    const WoT = await servient.start();
    console.log("✅ Servient started (producer)");

    const thing = await WoT.produce(td);

    // Initial state
    let availableResourceLevel = 10;
    let maintenanceNeeded = false;
    const possibleDrinks = ["espresso", "cappuccino", "latte"];

    thing.setPropertyReadHandler("availableResourceLevel", async () => availableResourceLevel);
    thing.setPropertyReadHandler("possibleDrinks", async () => possibleDrinks);
    thing.setPropertyReadHandler("maintenanceNeeded", async () => maintenanceNeeded);

    thing.setActionHandler("makeDrink", async (drink) => {
      if (!possibleDrinks.includes(drink)) {
        return `❌ Drink "${drink}" not available.`;
      }
      if (availableResourceLevel <= 0) {
        thing.emitEvent("outOfResource", "No water available!");
        return "❌ No water to make drink!";
      }
      availableResourceLevel--;
      thing.notifyPropertyChange("availableResourceLevel");

      if (availableResourceLevel === 0) {
        maintenanceNeeded = true;
        thing.notifyPropertyChange("maintenanceNeeded");
      }
      return `✅ ${drink} served!`;
    });

    await thing.expose();
    console.log("☕ Coffee Machine exposed");
  } catch (err) {
    console.error("❌ Error in producer:", err);
  }
}

main();

