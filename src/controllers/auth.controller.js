import { registerUser, loginUser } from "../services/auth.service.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import generateToken from "../utils/generateToken.utils.js";

export async function register(req, res) {
    try {
        const { error } = registerValidator.validate(req.body, { abortEarly: true });
        if (error) {
        return res.status(400).json({ message: error.details[0].message });
        }

        const { name, email, username, password, phone, dob, gender, picture } = req.body;

        const user = await registerUser({ name, email, username, password, phone, dob, gender, picture });

        return res.status(201).json({
        message: "User registered successfully",
        user,
        });
    } catch (error) {
        if (error.statusCode) {
        return res.status(error.statusCode).json({ code: error.code, message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function login(req, res) {
    try {
        const { error } = loginValidator.validate(req.body, { abortEarly: true });
        if (error) {
        return res.status(400).json({ message: error.details[0].message });
        }

        const { username, password } = req.body;

        const user = await loginUser({ username, password });
        const token = generateToken(user._id);

        return res.status(200).json({
        message: "User logged in successfully",
        data: { user, token },
        });
    } catch (error) {
        if (error.statusCode) {
        return res.status(error.statusCode).json({ code: error.code, message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export function getMe(req, res) {
    return res.status(200).json({
        message: "Authenticated user fetched successfully",
        data: req.user,
    });
}