import amqp from "amqplib";
import type { Channel, Connection, Replies } from "amqplib";
import { defaultUrl, exchange, routingKeyPrefix } from "./config";
import { ErrorHandler } from "./errorHandler";

export class Consumer extends ErrorHandler {
  private connection: Connection | undefined;
  private channel: Channel | undefined;
  private q: Replies.AssertQueue | undefined;

  /**
   * This method will connect to a RabbitMQ exchane with a generic queue.
   * @param {string} key The name of the MS.
   * @returns {boolean} Boolean according to success.
   */
  async connect(key: string): Promise<boolean> {
    try {
      this.connection = await amqp.connect(defaultUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(exchange.name, exchange.type);
      this.q = await this.channel.assertQueue("", {
        autoDelete: true,
      });
      await this.channel.bindQueue(
        this.q.queue,
        exchange.name,
        `${routingKeyPrefix}${key}`
      );
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

  async consume(
    onMessage: Parameters<Channel["consume"]>[1]
  ): Promise<boolean> {
    try {
      if (!this.channel || !this.q) {
        throw Error("Please connect before consuming");
      }
      await this.channel.consume(this.q.queue, onMessage);
      return true;
    } catch (e) {
      this.onError(e);
      return false;
    }
  }
}
