import cron from "node-cron";
import { checkAppointments } from "./cron-job";
import axiosInstance from "./axiousInstance";

export const startCronJobs = () => {
  cron.schedule("* * * * *", async () => {
    const startedAppointments = await checkAppointments();
    if (startedAppointments.length) {
      console.log("Sending appointment alert......");
      await axiosInstance.post("/api/doctor/appointment-alert", { startedAppointments });
    }
  });
};
