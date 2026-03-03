export function calculateSuccessRatio(success, total){
    if(total === 0) return 0;
    return success = Number(((success/total)*100).toFixed(2));
}