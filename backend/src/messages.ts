import { get, set } from "./db";
import { appendFileSync, existsSync, mkdirSync } from "fs";

const nowStr = new Date().toISOString();
if (!existsSync("logs")) {
  mkdirSync("logs");
}

interface Message {
  transmissionType: string;
  sessionID: string;
  aircraftID: string;
  hexIdent: string;
  flightID: string;
  dateMessageGenerated: string;
  timeMessageGenerated: string;
  dateMessageLogged: string;
  timeMessageLogged: string;
  callsign: string;
  altitude: string;
  groundSpeed: string;
  track: string;
  latitude: string;
  longitude: string;
  verticalRate: string;
  squawk: string;
  alertSquawkChange: string;
  emergency: string;
  spiIdent: string;
  isOnGround: string;
}

interface TimeDependentString {
  timestamp: number;
  value: string;
}

export async function handleMessage(str: string) {
  if (!str) {
    console.log(`Received invalid string: ${str}`);
    return;
  }

  appendFileSync(`logs/${nowStr}.txt`, str + "\n");

  let split = str.split(",");

  let messageType = split[0];
  if (messageType !== "MSG") {
    console.error(`Message type not MSG: ${str}`);
    return;
  }

  let message: Message = {
    transmissionType: split[1],
    sessionID: split[2],
    aircraftID: split[3],
    hexIdent: split[4],
    flightID: split[5],
    dateMessageGenerated: split[6],
    timeMessageGenerated: split[7],
    dateMessageLogged: split[8],
    timeMessageLogged: split[9],
    callsign: split[10],
    altitude: split[11],
    groundSpeed: split[12],
    track: split[13],
    latitude: split[14],
    longitude: split[15],
    verticalRate: split[16],
    squawk: split[17],
    alertSquawkChange: split[18],
    emergency: split[19],
    spiIdent: split[20],
    isOnGround: split[21],
  };

  console.log(`Updating ${message.hexIdent}`);

  let response = await get(message.hexIdent);
  var aircraftData: { [key: string]: TimeDependentString } | null;
  if (response === null) {
    aircraftData = {};
  } else {
    aircraftData = response;
  }

  var changedSomething = false;
  for (const [key, value] of Object.entries(message)) {
    if (value === "") {
      continue;
    }

    aircraftData[key] = {
      timestamp: new Date().getTime(),
      value: value,
    };
    changedSomething = true;
  }

  if (!changedSomething) {
    return;
  }

  return set(message.hexIdent, aircraftData).catch((error) => {
    console.log(error);
  });
}
