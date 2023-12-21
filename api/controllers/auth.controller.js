import User from "../Models/user.model.js";
import bcryptjs from "bcryptjs";
import {erroeHandler} from "../utils/error.js"
import jwt from "jsonwebtoken"

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;
    const hanshedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({username, email, password: hanshedPassword});
    try {
        await newUser.save();
        res.status(201).json("user created succesfully"); 
    } catch (error){
        next(error);
        
    }
}

export const signin = async (req, res, next) => {
    const {email, password} = req.body;
    try {
        const validUser = await User.findOne({email});
        if (!validUser) return next(erroeHandler(404,"user not found"));
        const validPassowrd = bcryptjs.compareSync(password, validUser.password);
        if (!validPassowrd) return next(erroeHandler(401, "Wrong credentials"));
        const token = jwt.sign({id: validUser._id, }, process.env.JWT_SECRET)
        const {password: pass, ...rest} = validUser._doc;
        res.cookie("access_token", token, {httpOnly: true})
        .status(200)
        .json(rest)
    } catch (error) {
        next(error)
    }
}

export const googel = async (req, res, next) => {
    try {
        const user = await User.findOne({email:req.body.email})
        if(user){
            const token = jwt.sign({id: user?._id}, process.env.JWT_SECRET);
            const {password: pass, ...rest} = user._doc;
            res
               .cookie('access_token', token, {httpOnly: true})
               .status(200)
               .json(rest); 
        }else{
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random.toString(36).slice(-8)
            const hanshedPassword = bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new User({username: (req.body.name).split(" ").join("").toLowerCase() + Math.random().
            toString(36).slice(-4), email: req.body.email, password: hanshedPassword, avatar: req.body.photo});
            await newUser.save();
            const token = jwt.sign({id: user?._id}, process.env.JWT_SECRET);
            const {password: pass, ...rest} = user._doc;
            res.cookie('access_token', token, {httpOnly: true}).status(200).json(rest);

        }
    } catch (error) {
        next(error)
    }
}