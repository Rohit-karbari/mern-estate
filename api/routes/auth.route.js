import express from "express";
import {googel, signin, signup}  from "../controllers/auth.controller.js";


const router = express.Router();

router.post("/signup", signup)
router.post("/signin", signin)
router.post('/google', googel)

export default router;
