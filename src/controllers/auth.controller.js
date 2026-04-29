import { registerUser, loginUser, updateProfile, deleteAccount, changePassword } from "../services/auth.service.js";
import { registerValidator, loginValidator, updateProfileValidator, changePasswordValidator, deleteAccountValidator } from "../validators/auth.validator.js";
import generateToken from "../utils/generateToken.utils.js";

export async function register(req, res, next) {
    try {
        const { error } = registerValidator.validate(req.body, { abortEarly: true });
        if (error) {
        return res.status(400).json({ message: error.details[0].message });
        }

        const { name, email, username, password, phone, dob, gender, picture } = req.body;

        const user = await registerUser({ name, email, username, password, phone, dob, gender, picture });
        const token = generateToken(user._id);

        return res.status(201).json({
        message: "User registered successfully",
        data: { user, token },
        });
    } catch (error) {
        next(error);
    }
}

export async function login(req, res, next) {
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
        next(error);
    }
}

export function getMe(req, res) {
    return res.status(200).json({
        message: "Authenticated user fetched successfully",
        data: req.user,
    });
}

export async function updateProfileHandler(req, res, next) {
  try {
    const { error } = updateProfileValidator.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await updateProfile(req.user._id, req.body);
    return res.status(200).json({ message: "Profile updated successfully", data: user });
  } catch (error) {
    next(error);
  }
}

export async function changePasswordHandler(req, res, next) {
  try {
    const { error } = changePasswordValidator.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { currentPassword, newPassword } = req.body;
    await changePassword(req.user._id, currentPassword, newPassword);
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
}

export async function deleteAccountHandler(req, res, next) {
  try {
    const { error } = deleteAccountValidator.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    await deleteAccount(req.user._id, req.body.password);
    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
}