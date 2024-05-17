import { get, set } from "./db";

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

interface Aircraft {
  transmissionType: TimeDependentString;
  sessionID: TimeDependentString;
  aircraftID: TimeDependentString;
  hexIdent: TimeDependentString;
  flightID: TimeDependentString;
  dateMessageGenerated: TimeDependentString;
  timeMessageGenerated: TimeDependentString;
  dateMessageLogged: TimeDependentString;
  timeMessageLogged: TimeDependentString;
  callsign: TimeDependentString;
  altitude: TimeDependentString;
  groundSpeed: TimeDependentString;
  track: TimeDependentString;
  latitude: TimeDependentString;
  longitude: TimeDependentString;
  verticalRate: TimeDependentString;
  squawk: TimeDependentString;
  alertSquawkChange: TimeDependentString;
  emergency: TimeDependentString;
  spiIdent: TimeDependentString;
  isOnGround: TimeDependentString;
}

export async function handleMessage(str: string) {
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

  await set(message.hexIdent, aircraftData).catch(() => {});
}
