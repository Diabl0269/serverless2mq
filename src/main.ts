import { Publisher } from "./publisher";
import type { Event } from "./publisher";

// Should get dynamic function url from AWS sdk.
const functionUrl = "functionUrl";

export default async (event: Event) => {
  const publisher = new Publisher();
  await publisher.connect();
  await publisher.publish({ ...event, functionUrl });
  await publisher.disconnect();
};
