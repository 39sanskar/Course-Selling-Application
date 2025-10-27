import { config } from "dotenv";
config({ path: './.env' });

import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

// ==================== DATABASE CONNECTION ====================

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected to ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log("Error: ",error);
        process.exit(1);
    };
};

export default connectDB;
