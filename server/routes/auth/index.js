import { Router } from "express";

import bcrypt from "bcryptjs";

import User from "../../models/user.js";

// Requiring fs module

// Storing the JSON format data in myObject

const router = Router()

router.post("/auth/signup", async (req, res) => {

    const { username, passwordHash, email, profile_image } = req.body

    if (passwordHash.length <= 8 || passwordHash.length >= 20) {
        res.status(401).json({ message: "password must be between 8 and 20 characters" })
        return;
    }

    if (!username || !passwordHash || !email) {
        res.status(400).json({ message: "please enter field" })
        return;
    }

    const userExist = await User.findOne({ email })


    if (userExist) {
        res.status(401).json({ message: "User already exist" })
        return;
    }

    const salt = await bcrypt.genSalt(10)
    const hashedpassword = await bcrypt.hash(passwordHash, salt)

    const user = await User.create({
        username,
        email,
        passwordHash: hashedpassword,
        profile_image
    })

    // newUser
    if (user) {
        res.status(200).json(user)
    } else {
        res.status(401).json({ message: "User data wrong" })
    }

})


router.post("/auth/signin", async (req, res) => {
    const { username, passwordHash } = req.body

    const user = await User.findOne({ username })

    if (user && (username === user.username) && (await bcrypt.compare(passwordHash, user.passwordHash))) {
        res.status(200).json(user)
    } else {
        res.status(401).json({ message: "wrong credential" })
    }
})

router.get("/users/:uid", async (req, res) => {
    const { uid } = req.params
    const user = await User.findById(uid)

    if (!user) {
        res.status(404).json({ message: "Not found" })
    }
    res.status(200).json(user)

})

router.put("/users/:uid", async (req, res) => {
    const { currentPassword, password } = req.body

    if (password.length < 8 || password.length > 20) {

        res.status(401).json({ message: "password must be between 8 and 20 characters. " })
        return;
    }

    const { uid } = req.params

    const salt = await bcrypt.genSalt(10)
    const newPassword = await bcrypt.hash(password, salt)

    const singleUsers = await User.findById(uid)

    const user = await User.findByIdAndUpdate(uid, { passwordHash: newPassword }, { new: true })

    if (user && (await bcrypt.compare(currentPassword, singleUsers.passwordHash))) {
        res.status(200).json(user)
        return;
    }

    res.status(401).json({ message: "Wrong credential" })
})

router.put("/users/avatar/:uid", async (req, res) => {
    const { profileImage } = req.body

    const user = await User.findByIdAndUpdate(req.params.uid, { profile_image: profileImage }, { new: true })

    if (!user) {
        res.status(404).json({ message: "Not found" })
    }
    res.status(200).json(user)
})


export default router

