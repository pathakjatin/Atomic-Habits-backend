import User from "../models/user.model.js";
import  generateToken  from "../utils/generateToken.utils.js";

export async function registerUser(payload){
    const{
        name, 
        email,
        picture,
        phone,
        username,
        password,
        dob, 
        gender
    } = payload;
    const existingUser = await User.findOne({
        $or : [{email}, {username}]
    });
    if(existingUser){
        throw new Error("USER_ALREADY_EXISTS");
    }

    const user = await User.create({
        name, 
        email,
        picture,
        phone,
        username,
        password,
        dob, 
        gender
    });
    return{
        id:user._id,
        name:user.name,
        email:user.email,
        username:user.username
    }
}

export async function loginUser (payload){
    const{username, password} = payload;
    // console.log(username)
    const existingUser = await User.findOne({username}).select("+password");
    if(!existingUser){
        throw new Error("INVALID_CREDENTIALS");
    }
    const isMatch = await existingUser.matchPassword(password);
    if(!isMatch){
        throw new Error("INVALID_CREDENTIALS");
    }
    return{
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        username : existingUser.username,
        token : generateToken(existingUser._id)
    }
}