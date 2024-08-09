"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPercent = GetPercent;
function GetPercent(part, whole) {
    // prevent NaN (whole must be > 0 [math])
    if (whole === 0)
        return 0;
    console.log((part / whole));
    return (part / whole) * 100;
}
