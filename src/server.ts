import 'dotenv/config';
import express from 'express';
import connectDB from './config/mongo.config';
import { startCronJobs } from './utility/cron';
import morgan from 'morgan';
import doctorRoute from './routes/routes';
import { container } from './config/inversify.config';
import { ChatController } from './controllers/chat.controller';
import { TYPES } from './types/inversify';
import { DoctorConsumer } from './event/doctor.consumer';
import { AppointmentController } from './controllers/appointment.controller';
import cors from 'cors';
import { startGrpcServer } from './grpc/server';

const app = express();

app.use(morgan('dev'));

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(doctorRoute);

async function bootstarp() {
    await connectDB();
    startCronJobs();

    const chatController = container.get<ChatController>(TYPES.ChatController);

    const appointmentController = container.get<AppointmentController>(
        TYPES.AppointmentController
    );

    const consumer = new DoctorConsumer(chatController, appointmentController);
    await consumer.start();
     startGrpcServer()
    app.listen(process.env.PORT!, () => {
        console.log('Doctor-service running on port: ', process.env.PORT!);
    });
}

bootstarp();
