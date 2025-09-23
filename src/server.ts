import "dotenv/config";
import connectDB from "./config/mongo";
import { startGrpcServer } from "./grpc/server";
import { startCronJobs } from "./cron";

(async () => {
  console.log("Connecting to MongoDB...");
  await connectDB();
  console.log("✅ MongoDB connection successful");

  startCronJobs();
  startGrpcServer();
})();
