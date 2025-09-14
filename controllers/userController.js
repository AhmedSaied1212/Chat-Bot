import createHttpError from "http-errors";
import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config()

export const register = async (req, res, next) => {
    try {

        const { name, phone, email, password } = req.body;
        const role = req.body.role || 'user';

        if(!name || !phone || !email || !password){
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        const isUserPresent = await User.findOne({email});
        if(isUserPresent){
            const error = createHttpError(400, "User already exist!");
            return next(error);
        }


        const user = { name, phone, email, password, role };
        const newUser = User(user);
        await newUser.save();

        res.status(201).json({success: true, message: "New user created!", data: newUser});


    } catch (error) {
        next(error);
    }
}


export const login = async (req, res, next) => {

    try {
        
        const { email, password } = req.body;

        if(!email || !password) {
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        const isUserPresent = await User.findOne({email});
        if(!isUserPresent){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const isMatch = await bcrypt.compare(password, isUserPresent.password);
        if(!isMatch){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const accessToken = jwt.sign({_id: isUserPresent._id}, process.env.JWT_SECRET, {
            expiresIn : '1d'
        });

        // For SPA clients we return token in body (also set cookie for other clients)
        try {
            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 *24 * 30,
                httpOnly: true,
                sameSite: 'lax',
                secure: false
            })
        } catch (e) {
            // ignore cookie errors in some environments
        }

        res.status(200).json({success: true, message: "User login successfully!", token: accessToken, user: isUserPresent});


    } catch (error) {
        next(error);
    }

}

export const getUserData = async (req, res, next) => {
    try {
        
        const user = await User.findById(req.user._id);
        res.status(200).json({success: true, data: user});

    } catch (error) {
        next(error);
    }
}

export const logout = async (req, res, next) => {
    try {
        
        res.clearCookie('accessToken');
        res.status(200).json({success: true, message: "User logout successfully!"});

    } catch (error) {
        next(error);
    }
}

export default { register, login, getUserData, logout }