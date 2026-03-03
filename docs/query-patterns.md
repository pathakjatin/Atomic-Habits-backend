//Habit
// all habits for user
find({ userId })

// secure fetch
findOne({ _id: habitId, userId })

// dashboard habits
find({ userId, status: { $in: ["active", "paused"] } })

// archived habits
find({ userId, status: "archived" })

//Habit Log

// Enforce one habit × one day
{ habitId: 1, date: 1 } UNIQUE

// User dashboard & calendar
{ userId: 1, date: 1 }