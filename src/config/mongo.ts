import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const connectDB = async (): Promise<void> => {
    try {
        const MONGO_URL = process.env.NODE_ENV === 'dev' ? process.env.MONGO_URL_DEV : process.env.MONGO_URL_PRO
        console.log("Using MongoDB URL:", MONGO_URL);
       
        if (!MONGO_URL) {
            throw new Error("MONGO_URL is not defined in environment variables.")
        }
        
        await mongoose.connect(MONGO_URL)
        console.log("MongoDB connection successful in doctor service");
        return; // Successfully connected
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
        // Either re-throw the error or exit the process
        process.exit(1); // Exit with error code
    }
}

export default connectDB