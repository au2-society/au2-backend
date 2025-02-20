import { createClient } from "redis";

const MAX_RETRIES = 5;
let retryCount = 0;

const redisClient = createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 14160,
    reconnectStrategy: (retries) => {
      if (retries >= MAX_RETRIES) {
        console.error("\n❌ Redis connection failed after maximum retries.");
        return new Error("Exceeded maximum retry attempts.");
      }
      console.warn(
        `\n⚠️ Redis connection failed. Retrying in ${retries * 1000}ms...`
      );
      return retries * 1000;
    },
  },
});

redisClient.on("connect", () => {
  console.log("\n✅ Redis connected successfully!");
});

redisClient.on("error", (err) => {
  console.error("\n❌ Redis connection error:", err.message);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    retryCount++;
    console.error(
      `\n❌ Redis connection attempt ${retryCount} failed:`,
      err.message
    );
    if (retryCount < MAX_RETRIES) {
      setTimeout(connectRedis, retryCount * 2000);
    } else {
      console.error(
        "\n❌ Redis connection could not be established. Exiting process."
      );
      process.exit(1);
    }
  }
};

connectRedis();

export default redisClient;
