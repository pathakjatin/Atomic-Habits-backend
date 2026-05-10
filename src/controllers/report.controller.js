import { getReport } from "../services/report.service.js";
import AppError from "../utils/AppError.js";

export async function getProgressReport(req, res, next) {
  try {
    const { period } = req.query;
    const validPeriods = ["weekly", "monthly", "quarterly"];

    if (!period || !validPeriods.includes(period)) {
      throw new AppError(
        "INVALID_PERIOD",
        "Period must be one of: weekly, monthly, quarterly",
        400
      );
    }

    const report = await getReport(req.user._id, period);
    return res.status(200).json({ message: "Report generated", data: report });
  } catch (error) {
    next(error);
  }
}