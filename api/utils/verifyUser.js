import { erroeHandler } from "./error.js"
import  jwt  from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token
    if(!token) return next(erroeHandler(401, 'unauthorized'))

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) return next(erroeHandler(403, 'Forbidden'));

        req.user = user;
        next()
    });
};