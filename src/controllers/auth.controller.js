import { registerUser, loginUser } from "../services/auth.service.js";
import { registerValidator } from "../validators/auth.validator.js";

export async function register(req, res){
    try {
        const {error} = registerValidator.validate(req.body, {
            abortEarly: true
        }); 
        if(error){
            return res.status(401).json({
                message:error.details[0].message
            });
        }
        //const {name, email, username, password} = req.body;
        
        const user = await registerUser(
            req.body
        );
        return res.status(201).json({
            message:"User registered successfully",
            user
        });
    } catch (error) {
        console.log(error)
        if(error.message === "USER_ALREADY_EXISTS"){
            return res.status(409).json({
                message:"User already exists!"
            });
        }
        return res.status(500).json({
            message:"Internal server error"
        });
    }
};

export async function login(req, res) {
    try {
        const user = await loginUser(
            req.body
        );
        return res.status(200).json({
            message:"User logged in successfully",
            data:user
        });
    } catch (error) {
        console.log(error)
        if(error.message === "INVALID_CREDENTIALS"){
            return res.status(401).json({
                message:"Invalid Credentials!"
            });
        }
        return res.status(500).json({
            message:"Internal server error"
        });
    }
}