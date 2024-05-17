import * as net from "net";
import { del, get, getListOfAllKeys, set } from "./db";
import { handleMessage } from "./messages";

const STALE_TIME = 5 * 60 * 1000;
const CHECK_STALE_TIME = 60 * 1000;

var client: net.Socket = new net.Socket();
var reconnectInterval: NodeJS.Timeout | null = null;

reconnect();
occasionallyPurgeStaleAircraft();

client.on("connect", () => {
  console.log("Client connected");
  if (reconnectInterval !== null) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
});

client.on("data", (data) => {
  let str = data.toString().trimEnd();
  handleMessage(str);
});

client.on("end", () => {
  console.log("Client ended");
  reconnect();
});

client.on("error", (error) => {
  console.log(error.toString());
  reconnect();
});

function connect() {
  client.connect(30003);
}

function reconnect() {
  if (reconnectInterval === null) {
    reconnectInterval = setInterval(() => {
      connect();
    }, 1000);
  }
}

async function occasionallyPurgeStaleAircraft() {
  setInterval(async () => {
    let keys = await getListOfAllKeys();
    keys?.forEach(async (key) => {
      let aircraft = await get(key);
      if (aircraft === null) {
        return;
      }

      var stale = true;
      for (const [key, value] of Object.entries(aircraft)) {
        if (!(value instanceof Object)) {
          continue;
        }

        let typescriptNeedsMeToDoThis: { [key: string]: any } = value;

        let timestamp = typescriptNeedsMeToDoThis["timestamp"];
        if (new Date().getTime() - timestamp < STALE_TIME) {
          stale = false;
        }
      }

      if (stale) {
        console.log(`${key} is stale`);
        await del(key);
      }
    });
  }, CHECK_STALE_TIME);
}
