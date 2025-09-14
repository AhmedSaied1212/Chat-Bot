import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
    console.log("✅ DB Connected Successfully!")
    } catch (error) {
    console.error("❌ Failed to connect to DB!", error)
    // Exit the process - failing fast is usually better for DB connection errors
    process.exit(1)
    }
}

export default connectDB;