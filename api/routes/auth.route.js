import express from "express";
import {googel, signin, signup, signOut}  from "../controllers/auth.controller.js";


const router = express.Router();

router.post("/signup", signup)
router.post("/signin", signin)
router.post('/google', googel)
router.get('/signout', signOut)

export default router;
