import 'dotenv/config';
import express from 'express';
import connectDB from './config/mongo.config';
import { startCronJobs } from './utility/cron';
import morgan from 'morgan';
import doctorRoute from './routes/routes';
import { container } from './config/inversify.config';
import { ChatController } from './controllers/chat.controller';
import { TYPES } from './types/inversify';
import { DoctorConsumer } from './consumers/doctor.consumer';
import { AppointmentController } from './controllers/appointment.controller';
import cors from 'cors';
import { startGrpcServer } from './grpc/server';
import { startPaymentConsumer } from './consumers/paymentConsumer';


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

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        service: 'doctor-service',
        port: process.env.PORT 
    });
});

app.use(doctorRoute);

async function bootstrap() {
    try {
        console.log('🔄 Starting doctor-service...');
        
        
        await connectDB();
        console.log('✅ MongoDB connected');

        
        startCronJobs();
        console.log('✅ Cron jobs started');

     
        const chatController = container.get<ChatController>(TYPES.ChatController);
        const appointmentController = container.get<AppointmentController>(
            TYPES.AppointmentController
        );
        console.log('✅ Controllers initialized');

       
        const consumer = new DoctorConsumer(chatController, appointmentController);
        await consumer.start();
       
       await startPaymentConsumer();
        console.log('✅ RabbitMQ consumer started');

      
        await startGrpcServer();
        console.log('✅ gRPC server started');

        const httpPort = Number(process.env.PORT) || 7000;
        const host = '0.0.0.0'; 
        
        app.listen(httpPort, host, () => {
            console.log(`🚀 Doctor-service HTTP running on ${host}:${httpPort}`);
            console.log(`📡 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 MongoDB: Connected`);
            console.log(`🐰 RabbitMQ: Connected`);
        });

    } catch (error) {
        console.error('❌ Failed to start doctor-service:', error);
        process.exit(1);
    }
}

bootstrap();