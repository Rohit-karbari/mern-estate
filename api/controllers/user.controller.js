import User from "../Models/user.model.js";
import { erroeHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";

export const test = (req,res) => {
    res.json({
        message: "Hello world"
    });
};

export const updateUser = async (req, res, next)=> {
    if(req.user.id !== req.params.id) return next(erroeHandler(401, "you can only update your own account!"))
    try {
        if(req.body.passowrd){
            req.body.passowrd = bcryptjs.hashSync(req.body.passowrd, 10)
        }
        const updatedUser = await User.findByIdAndUpdate(req.params.id,{
            $set:{
                username: req.body.username,
                email: req.body.username,
                passowrd: req.body.username,
                avatar: req.body.username,
            }
        }, {new: true})
        const {passowrd, ...rest} = updatedUser._doc
        res.status(200).json(rest)
    } catch (error) {
        next(error)
    }
}