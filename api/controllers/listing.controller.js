import Listing from "../models/listing.model.js";
import { erroeHandler } from "../utils/error.js";

export const createListing = async (req, res, next) => {
    try {
        const listing = await Listing.create(req.body);
        return res.status(201).json(listing);
    } catch (error) {
        next(error);
    }
};

export const deleteListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if(!listing){
        return next(erroeHandler(401, "Listinf not found"));
    }
    if(req.user.id !== listing.userRef){
        return erroeHandler(404, "you can only delete your listings!")
    }

    try{
        await Listing.findByIdAndDelete(req.params.id);
        res.status(200).json("Listing has been deleted")
    }catch{
        next(error);
    }
}
export const updateListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if(!listing){
        return next(erroeHandler(404, "Listinf not found"));
    }
    if(req.user.id !== listing.userRef){
        return erroeHandler(401, "you can only update your listings!")
    }

    try{
        const updatedListing = await Listing.findByIdAndUpdate(
            req.params.id, 
            req.body,
            {new: true}
        );
        res.status(200).json(updatedListing);
    }catch{
        next(error);
    }
}
export const getListing = async (req, res, next) => {
    
    try{
        const listing = await Listing.findById(req.params.id);
        if(!listing){
            return next(erroeHandler(404, "Listing not found!"));
        }
        res.status(200).json(listing);
    }catch{
        next(error);
    }
}