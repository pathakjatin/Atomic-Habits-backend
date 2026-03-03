export function calculateStreak({
    lastCompletedDate,
    currentStreak,
    today
}){
    if(!lastCompletedDate) return 1;
    //if last completed date is today
    if(lastCompletedDate === today) return currentStreak;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    //if last completed date was yesterday
    if(lastCompletedDate === yesterdayStr) return currentStreak++;

    return 1;
}