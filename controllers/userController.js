const User = require("../modles/userModel");
const bcrypt = require("bcrypt");
const generateJwtToken = require("../utils/generateJwtToken");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImg } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: { message: "Please enter all the fields" } });
        }
        const isUserExists = await User.findOne({ email });
        if (isUserExists) {
            return res.status(400).json({ error: { message: "User already exists" } });
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, email, password: hashedPassword, profileImg });
        await newUser.save();
        const accessToken = generateJwtToken({
            token_type: "access",
            user: {
                _id: newUser._id,
                name,
                email,
                profileImg
            }
        }, '15d')
        res.status(200).json({
            // _id: newUser._id,
            name,
            email,
            profileImg,
            token: {
                access: accessToken
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(409).json({ error: { message: "Invalid credentials" } });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if(!isPasswordMatch){
        return res.status(409).json({ error: { message: "Invalid credentials" } });
    }
    const accessToken = generateJwtToken({
        token_type: "access",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImg: user.profileImg
        }
    }, '15d');
    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
        token: {
            access: accessToken
        }
    })
}

const getAllUser = async (req, res) => {
    try {
        const keyword = req.query.search ? {
            $or: [
                {name: { $regex: req.query.search, $options: "i"}},
                {email: { $regex: req.query.search, $options: "i"}},
            ]
        } : {}
    
        const users = await User.find(keyword).find({_id: {$ne: req.user.id}});
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({error});
    }
    
}

module.exports = { registerUser, loginUser, getAllUser };