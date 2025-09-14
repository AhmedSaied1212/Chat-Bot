import cors from "cors";
import express from "express";
import connectDB from "./config/db.js";
import Chat from "./model/chatModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute.js"
import cookieParser from 'cookie-parser';
import { isVerifiedUser } from './middlewares/tokenVerification.js';
dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

// Configure CORS to allow Authorization header and credentials from the client
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true, allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());
app.use(cookieParser());
app.use("/auth", userRoute);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.post("/chatBot", isVerifiedUser, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                status: 400,
                error: "❌ message is required !"
            });
        }

    // Persist the user's message (attach user)
    await Chat.create({ user: req.user._id, role: "user", message });

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

    // Persist the bot's reply
    await Chat.create({ user: req.user._id, role: "bot", message: text });

        res.status(200).json({
            success: true,
            status: 200,
            message: "✅ Message sent successfully !",
            data: text
        });

    } catch (error) {
        console.error("❌ Error in server ! Error:", error);
        res.status(500).json({
            success: false,
            status: 500,
            error: "❌ Error in Server !"
        });
    }
});

// Return all chat messages (ordered by createdAt)
app.get('/chatBot', isVerifiedUser, async (req, res) => {
    try {
    const chats = await Chat.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, status: 200, data: chats });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ success: false, status: 500, error: 'Failed to fetch chats' });
    }
});

connectDB()

app.listen(port, () => {
    console.log(`🚀 Server is running on port: ${port}!`);
});

// Generic error handler -> return JSON for all errors (prevents HTML error pages)
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ success: false, status, error: message });
});
