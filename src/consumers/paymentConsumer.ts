import { container } from "../config/inversify.config.js";
import { createRabbit } from "../config/rabbitmq.config.js";
import { AppointmentController } from "../controllers/appointment.controller.js";
import { TYPES } from "../types/inversify.js";

export async function startPaymentConsumer() {
  try {
    const { ch } = await createRabbit();

    const exchange = "healNova";
    const queueName = "doctor_payment_queue";
    const routingKey = "payment.appointment";

    await ch.assertQueue(queueName, { durable: true });
    await ch.bindQueue(queueName, exchange, routingKey);

    console.log("👂 Listening for appointment payments on:", routingKey);

   
    const appointmentController = container.get<AppointmentController>(TYPES.AppointmentController);

    ch.consume(
      queueName,
      async (msg) => {
        if (!msg) return;
        try {
          const data = JSON.parse(msg.content.toString());
          console.log("📥 Payment event received:", data);

         
          await appointmentController.handleAppointmentFromPayment(data.data);

          ch.ack(msg);
        } catch (err) {
          console.error("❌ Error handling payment message:", err);
          ch.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("❌ Failed to start doctor payment consumer:", error);
  }
}
