import * as grpc from "@grpc/grpc-js";
import { loadProto, createGrpcServer } from "../config/grpc";
import { doctorGrpcHandlers } from "./handlers";

export const startGrpcServer = () => {
  const grpcObject = loadProto();
  const DoctorProto = grpcObject.Doctor;

  if (!DoctorProto || !DoctorProto.DoctorService) {
    console.error("Failed to load the Doctor service from proto file");
    process.exit(1);
  }

  const grpcServer = createGrpcServer();
  grpcServer.addService(DoctorProto.DoctorService.service, doctorGrpcHandlers);

  const port = process.env.DOCTOR_GRPC_PORT || "7000";
  const host = process.env.GRPC_HOST || "0.0.0.0";
  const serverAddress = `${host}:${port}`;

  grpcServer.bindAsync(
    serverAddress,
    grpc.ServerCredentials.createInsecure(),
    (err, bindPort) => {
      if (err) {
        console.error("Error starting gRPC server:", err);
        return;
      }
      grpcServer.start();
      console.log(`🚀 [INFO] gRPC Doctor server running at ${serverAddress}`);
    }
  );
};
