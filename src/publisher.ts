import amqp, { Connection } from "amqplib";
import type { Channel } from "amqplib";
import { defaultUrl, exchange, keys, routingKeyPrefix } from "./config";

type MsNames = typeof keys[number];

export type Event = {
  /**
   * The name of the MS.
   */
  msName: MsNames;
  /**
   * The new log level to set to the MS.
   */
  logLevel: "info" | "warn" | "debug" | "error";
  /**
   * Duration for how long to use the custom log level, defaults to 60, max 1440 (24 hours).
   */
  duration?: number;
};

export type Payload = Event & {
  /**
   * The function url for the consumer to send it's response.
   */
  functionUrl: string;
};

/**
 * A publisher class for producing events to a message broker.
 */
export class Publisher {
  private connection: Connection | undefined;
  private channel: Channel | undefined;

  /**
   * Will publish an event.
   * @param payload
   */
  async publish(payload: Payload) {
    try {
      return await this.channel?.publish(
        exchange.name,
        `${routingKeyPrefix}${payload.msName}`,
        Buffer.from(JSON.stringify(payload))
      );
    } catch (e) {
      this.onError(e);
      return false;
    }
  }

  async connect(): Promise<boolean> {
    try {
      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || defaultUrl
      );
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(exchange.name, exchange.type);
      return true;
    } catch (e) {
      this.onError(e);
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      return true;
    } catch (e) {
      this.onError(e);
      return false;
    }
  }

  onError(e: unknown) {
    if (e instanceof Error) {
      console.error(e.message);
    }
  }
}
