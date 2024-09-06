export function GetDateByTimestamp(timestamp: number): string {
    var todate=new Date(timestamp).getDay();
    var tomonth=new Date(timestamp).getMonth()+1;
    var toyear=new Date(timestamp).getFullYear();
    var original_date=tomonth+'/'+todate+'/'+toyear;
    return original_date;
}