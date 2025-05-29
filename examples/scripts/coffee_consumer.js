const readline = require("readline");
const { Servient } = require("@node-wot/core");
const MqttClientFactory = require("@node-wot/binding-mqtt").MqttClientFactory;
const path = require("path");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const servient = new Servient();
servient.addClientFactory(new MqttClientFactory({ uri: "mqtt://test.mosquitto.org" }));

servient
  .start()
  .then(async (WoT) => {
    const tdPath = path.join(__dirname, "thing_description.json");
    const td = JSON.parse(fs.readFileSync(tdPath, "utf8"));

    try {
      const thing = await WoT.consume(td);
      console.log("✅ Connected to Coffee Machine");

      thing.subscribeEvent("outOfResource", (data) => {
        console.log("🚨 EVENT received: outOfResource →", data);
      });

      async function showProperties() {
        try {
          const level = await thing.readProperty("availableResourceLevel");
          const drinks = await thing.readProperty("possibleDrinks");
          const maintenance = await thing.readProperty("maintenanceNeeded");

          console.log("💧 Level:", await level.value());
          console.log("🍹 Drinks:", (await drinks.value()).join(", "));
          console.log("🛠 Maintenance needed:", await maintenance.value());
        } catch (err) {
          console.error("❌ Error reading properties:", err.message);
        }
      }

      function askUser() {
        rl.question(
          "\nChoose an option:\n1 - Make a drink\n2 - Show current status\n0 - Exit\nYour choice: ",
          async (answer) => {
            if (answer === "1") {
              rl.question("Which drink do you want? ", async (drink) => {
                try {
                  const result = await thing.invokeAction("makeDrink", { drink });
                  console.log("✅ Result:", JSON.stringify(result, null, 2));
                } catch (err) {
                  console.error("❌ Error making drink:", err.message);
                }
                askUser();
              });
            } else if (answer === "2") {
              await showProperties();
              askUser();
            } else if (answer === "0") {
              console.log("👋 Exiting...");
              rl.close();
              process.exit(0);
            } else {
              console.log("❌ Invalid choice, try again.");
              askUser();
            }
          }
        );
      }

      askUser();
    } catch (err) {
      console.error("❌ Error consuming TD:", err.message);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("❌ Error starting servient:", err.message);
    process.exit(1);
  });
