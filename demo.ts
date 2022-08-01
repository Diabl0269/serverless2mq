import handler from "./src/main";
import type { Event } from "./src/publisher";
import { fork } from "child_process";
import { getKey } from "./consume";

const key = getKey();
console.log(`About to send messages to: ${key}`);
const createEvent = (duration: number): Event => ({
  logLevel: "debug",
  msName: key,
  duration,
});

const processes = [
  fork("./consume.ts", ["p81api", "1"]),
  fork("./consume.ts", ["p81api", "2"]),
  fork("./consume.ts", ["sdpc", "1"]),
  fork("./consume.ts", ["sdpc", "2"]),
];

processes.forEach((p) => {
  p.on("message", (m) => {
    console.log(m);
    if (p.pid) {
      process.kill(p.pid);
    }
  });
});

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

process.on("SIGBREAK", () => {
  processes.forEach((p) => p.send("Killing process"));
});
