import { RedisClientType, createClient } from "redis";
import * as RedisErrors from "@redis/client/dist/lib/errors";

interface RedisClient {
  client: RedisClientType | null;
  friendlyName: string;
}

var getSetClient: RedisClient = { client: null, friendlyName: "Get-Set" };
var scanClient: RedisClient = { client: null, friendlyName: "Scan" };
var clients: RedisClient[] = [getSetClient, scanClient];

clients.forEach((client) => {
  client.client = createClient();
  client.client.on("error", (error) => {
    if (error.code === "ECONNREFUSED") {
      console.error(`db ${client.friendlyName} ECONNREFUSED`);
    } else if (error instanceof RedisErrors.SocketClosedUnexpectedlyError) {
      console.error(
        `db ${client.friendlyName} SocketClientClosedUnexpectedlyError`
      );
    }
  });
  client.client.connect();
});

export function set(key: string, value: any) {
  return new Promise((resolve, reject) => {
    getSetClient.client?.json.set(key, "$", value).then(
      (result) => {
        resolve(result);
      },
      (error) => {
        console.error(`db set error for key: ${key}: ${error}`);
        reject();
      }
    );
  });
}

export async function get(key: string) {
  return new Promise<{} | null>((resolve, reject) => {
    getSetClient.client?.json
      .get(key)
      .then((value) => {
        resolve(value);
      })
      .catch((error) => {
        console.log(`Could not get key: ${key}; error: ${error}`);
        reject(null);
      });
  });
}

export async function del(key: string) {
  return new Promise((resolve, reject) => {
    scanClient.client
      ?.del(key)
      .then((value) => {
        resolve(value);
      })
      .catch((reason) => {
        console.error(`del failed to delete key: ${key}; reason: ${reason}`);
        reject();
      });
  });
}

export async function getListOfAllKeys() {
  return new Promise<string[] | null>((resolve, reject) => {
    scan(0, []).then((value) => {
      if (value === undefined) {
        value = [];
      }
      resolve(value);
    });
  });
}

async function scan(cursor: number, keys: string[]) {
  let response = await scanClient.client?.scan(cursor);
  if (response === undefined) {
    return [];
  }

  let newKeys = keys.concat(response.keys);

  if (response.cursor === 0) {
    return newKeys;
  }

  return await scan(response.cursor, newKeys);
}
