import amqp from "amqplib";

function getRabbitUrl() {
  if (process.env.RABBIT_URL) return process.env.RABBIT_URL;
  if (process.env.NODE_ENV === "dev" && process.env.RABBIT_URL_LOCAL)
    return process.env.RABBIT_URL_LOCAL;

  return "amqp://admin:admin123@rabbitmq:5672";
}

const rabbitUrl = getRabbitUrl();

const MAX_RETRIES = 10;
const RETRY_DELAY = 5000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createRabbit(retries = 0) {
  try {
    console.log(
      `🔄 Connecting to RabbitMQ at: ${rabbitUrl} (attempt ${retries + 1}/${MAX_RETRIES})`
    );

    const conn = await amqp.connect(rabbitUrl, { heartbeat: 60 });
    const ch = await conn.createChannel();

    conn.on("error", (err) => console.error("❌ RabbitMQ connection error:", err));
    conn.on("close", () => console.warn("⚠️ RabbitMQ connection closed"));

    ch.on("error", (err) => console.error("❌ RabbitMQ channel error:", err));
    ch.on("close", () => console.warn("⚠️ RabbitMQ channel closed"));

    await ch.assertExchange("healNova", "topic", { durable: true });

    console.log("✅ RabbitMQ configuration initialized successfully");

    return { conn, ch };
  } catch (error) {
    console.error(`❌ Failed to create RabbitMQ connection (attempt ${retries + 1}):`, error);

    if (retries < MAX_RETRIES - 1) {
      console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await sleep(RETRY_DELAY);
      return createRabbit(retries + 1);
    } else {
      console.error("❌ Max retries reached. RabbitMQ connection failed permanently.");
      throw error;
    }
  }
}
