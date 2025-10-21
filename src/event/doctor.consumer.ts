import { container } from "../config/inversify.config";
import { createRabbit } from "../config/rabbitmq.config";
import { AppointmentController } from "../controllers/appointment.controller";
import { ChatController } from "../controllers/chat.controller";
import { TYPES } from "../types/inversify";

export const chatController = container.get<ChatController>(TYPES.ChatController);
export const appointmentController = container.get<AppointmentController>(TYPES.AppointmentController);

export class DoctorConsumer {
  private ch: any;
  private conn: any;
  private isRunning: boolean = false;

  constructor(
    private chatController: ChatController,
    private appointmentController: AppointmentController
  ) {}

  async start() {
    if (this.isRunning) {
      console.log("⚠️ DoctorConsumer is already running");
      return;
    }

    try {
      const { conn, ch } = await createRabbit();
      this.conn = conn;
      this.ch = ch;
      this.isRunning = true;

      console.log("🚀 DoctorService consumer started successfully");

      await ch.prefetch(1);

      // ===================== 💬 Chat Message Queue =====================
      const chatQueue = "doctor.message.store";
      await ch.assertQueue(chatQueue, { durable: true });
      await ch.bindQueue(chatQueue, "healNova", chatQueue);

      await ch.consume(
        chatQueue,
        async (msg) => {
          if (!msg) return;
          try {
            console.log("💬 Received message from doctor.message.store queue");
            const messageData = JSON.parse(msg.content.toString());
            await this.chatController.storeMessageInDb(messageData);
            ch.ack(msg);
            console.log("✅ Chat message processed successfully");
          } catch (err) {
            console.error("❌ Chat message processing error:", err);
            ch.nack(msg, false, false);
          }
        },
        { noAck: false }
      );

      // ===================== 📅 Appointment Reschedule Queue =====================
      const rescheduleQueue = "doctor.appointment.reschedule";
      await ch.assertQueue(rescheduleQueue, { durable: true });
      await ch.bindQueue(rescheduleQueue, "healNova", rescheduleQueue);

      await ch.consume(
        rescheduleQueue,
        async (msg) => {
          if (!msg) return;
          try {
            console.log("📅 Received message from doctor.appointment.reschedule queue");
            const rescheduleData = JSON.parse(msg.content.toString());
            await this.appointmentController.rescheduleAppointment(rescheduleData);
            ch.ack(msg);
            console.log("✅ Appointment reschedule processed successfully");
          } catch (err) {
            console.error("❌ Appointment reschedule processing error:", err);
            ch.nack(msg, false, false);
          }
        },
        { noAck: false }
      );

      // ===================== ⚠️ Connection & Channel Error Handling =====================
      this.conn.on("error", (err: Error) => {
        console.error("❌ Consumer connection error:", err);
        this.isRunning = false;
      });

      this.conn.on("close", () => {
        console.warn("⚠️ Consumer connection closed");
        this.isRunning = false;
      });

      this.ch.on("error", (err: Error) => {
        console.error("❌ Consumer channel error:", err);
      });

      this.ch.on("close", () => {
        console.warn("⚠️ Consumer channel closed");
      });

    } catch (error) {
      console.error("❌ Failed to start DoctorConsumer:", error);
      this.isRunning = false;
      throw error;
    }
  }

  async stop() {
    try {
      this.isRunning = false;

      if (this.ch) {
        await this.ch.close();
        console.log("✅ RabbitMQ channel closed");
      }

      if (this.conn) {
        await this.conn.close();
        console.log("✅ RabbitMQ connection closed");
      }
    } catch (error) {
      console.error("❌ Error stopping DoctorConsumer:", error);
    }
  }

  isConsumerRunning(): boolean {
    return this.isRunning;
  }
}
