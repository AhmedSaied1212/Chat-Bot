import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../model/userModel.js";

dotenv.config()

export const isVerifiedUser = async (req, res, next) => {
    try{

        // Allow CORS preflight to pass through without token
        if (req.method === 'OPTIONS') {
            console.debug('Skipping token verification for preflight', req.method, req.path);
            return next();
        }

        // accept token from cookie or Authorization header
        let accessToken = null
        if (req.cookies && req.cookies.accessToken) {
            accessToken = req.cookies.accessToken
            console.debug('token from cookie', req.method, req.path)
        } else if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            accessToken = req.headers.authorization.split(' ')[1]
            console.debug('token from header', req.method, req.path)
        } else {
            console.debug('no token found in cookie or header for request', req.method, req.path)
        }

        if(!accessToken){
            const error = createHttpError(401, "Please provide token!");
            return next(error);
        }

        const decodeToken = jwt.verify(accessToken, process.env.JWT_SECRET);

        const user = await User.findById(decodeToken._id);
        if(!user){
            const error = createHttpError(401, "User not exist!");
            return next(error);
        }

        req.user = user;
        next();

    }catch (error) {
        const err = createHttpError(401, "Invalid Token!");
        next(err);
    }
}