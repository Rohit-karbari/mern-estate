import User from "../Models/user.model.js";
import bcryptjs from "bcryptjs";

export const signup = async (req, res) => {
    const { userName, email, password } = req.body;
    const hanshedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({userName, email, password: hanshedPassword});
    try {
        await newUser.save();
        res.status(201).json("user created succesfully"); 
    } catch (error){
        res.status(500).json(error.message);
    }

    console.log(req.body)
}