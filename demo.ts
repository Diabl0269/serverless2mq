import handler from "./src/main";
import type { Event } from "./src/publisher";
import { keys } from "./src/config";
import { argv } from "process";
import { fork } from "child_process";

export const getKey = () => {
  const key = argv[argv.length - 2] as typeof keys[number];
  if (!keys.includes(key)) {
    throw `Unsupported key.
      Supported keys: ${keys}`;
  }
  return key;
};

const key = getKey();
console.log(`About to send messages to: ${key}`);
const createEvent = (duration: number): Event => ({
  logLevel: "debug",
  msName: key,
  duration,
});
const event: Event = {
  logLevel: "debug",
  msName: key,
  duration: 5,
};

fork("./consume.ts", ["p81api", "1"]);
fork("./consume.ts", ["p81api", "2"]);

// Publisher, main logic
let i = 0;
setInterval(async () => {
  try {
    await handler(createEvent(i++));
    console.log(`Message ${i} has been dispatched!`);
  } catch (err: unknown) {
    console.error(`Failed to dispatch messages.
    Error: ${err instanceof Error && err?.toString()}`);
  }
}, 3000);
