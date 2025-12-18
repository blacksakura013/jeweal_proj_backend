exports.getYearMonth = ()=>{
    const currentDate = new Date(); // วันที่ปัจจุบัน

// กำหนดรูปแบบวันที่เป็น "yyyymm"
const formattedDate = [
    currentDate.getFullYear().toString().slice(-2), // ปี (2 หลัก)
    String(currentDate.getMonth() + 1).padStart(2, '0') // เดือน (2 หลัก)
].join(''); // "202409"

return formattedDate;
}