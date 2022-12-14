import { argv } from "process";
import { defaultUrl, exchange, routingKeyPrefix, keys } from "./src/config";
import amqp from "amqplib";

export const getKey = () => {
  const key = argv[argv.length - 2] as typeof keys[number];
  if (!keys.includes(key)) {
    throw `Unsupported key.
      key: ${key},
      Supported keys: ${keys}`;
  }
  return key;
};

const getNodeNum = () => {
  return argv[argv.length - 1];
};

// Consumer, only for demo
export const consume = async () => {
  const key = getKey();
  const nodeNum = getNodeNum();
  const connection = await amqp.connect(defaultUrl);
  const channel = await connection.createChannel();
  await channel.assertExchange(exchange.name, exchange.type);
  const q = await channel.assertQueue("", {
    autoDelete: true,
  });
  await channel.bindQueue(q.queue, exchange.name, `${routingKeyPrefix}${key}`);
  await channel.consume(q.queue, (msg) => {
    console.log(`${key}-${nodeNum}: Consumed message successfully!
        Content: ${msg?.content.toString()}`);
  });
  console.log(`Consuming messages with key: ${key}-${nodeNum}`);
};

consume();
