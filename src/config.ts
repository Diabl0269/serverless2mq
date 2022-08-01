export const exchange = {
  name: "logging_level_exchange",
  type: "topic",
};
export const defaultUrl = "amqp://localhost:5672";

export const routingKeyPrefix = "logging.level.";
export const keys = ["p81api", "sdpc"] as const;
