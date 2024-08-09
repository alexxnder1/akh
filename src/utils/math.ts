export function GetPercent(part: number, whole: number): number
{
    // prevent NaN (whole must be > 0 [math])
    if(whole === 0)
        return 0;

    console.log((part/whole));
    return (part/whole)*100;

}