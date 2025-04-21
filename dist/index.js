"use strict";
/**
 * Module giải mã thời gian bắt đầu và kết thúc giấc ngủ từ chuỗi hex
 * Dựa trên phân tích mã nguồn DataUnpack.java
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeSleepTime = decodeSleepTime;
exports.displaySleepTimeInfo = displaySleepTimeInfo;
exports.decodeSleepTimeFromHexString = decodeSleepTimeFromHexString;
// Hằng số tham chiếu thời gian (1/1/2000 00:00:00 UTC)
const REFERENCE_TIMESTAMP = 946684800;
const MILLISECONDS_PER_SECOND = 1000;
/**
 * Chuyển đổi chuỗi hex thành mảng byte
 * @param hexString Chuỗi hex cần chuyển đổi (dạng "05 11 3e 00...")
 * @returns Mảng byte tương ứng
 */
function hexStringToByteArray(hexString) {
    // Loại bỏ khoảng trắng và chia thành từng cặp hex
    const hexPairs = hexString.replace(/\s+/g, '').match(/.{1,2}/g) || [];
    // Chuyển đổi mỗi cặp hex thành số nguyên
    return hexPairs.map(hex => parseInt(hex, 16));
}
/**
 * Đọc giá trị số nguyên 32-bit từ mảng byte (little-endian)
 * @param data Mảng byte
 * @param offset Vị trí bắt đầu
 * @returns Giá trị số nguyên 32-bit
 */
function readUInt32LE(data, offset) {
    return (data[offset] & 0xFF) |
        ((data[offset + 1] & 0xFF) << 8) |
        ((data[offset + 2] & 0xFF) << 16) |
        ((data[offset + 3] & 0xFF) << 24);
}
/**
 * Chuyển đổi giá trị thời gian từ thiết bị thành timestamp JavaScript
 * @param timeValue Giá trị thời gian từ thiết bị (số giây kể từ 1/1/2000)
 * @returns Timestamp JavaScript (milliseconds)
 */
function convertDeviceTimeToTimestamp(timeValue) {
    // Cộng với timestamp của 1/1/2000 00:00:00 UTC và chuyển từ giây sang mili-giây
    return (timeValue + REFERENCE_TIMESTAMP) * MILLISECONDS_PER_SECOND;
}
/**
 * Định dạng timestamp thành chuỗi thời gian đọc được
 * @param timestamp Timestamp cần định dạng (milliseconds)
 * @returns Chuỗi thời gian định dạng "YYYY-MM-DD HH:MM:SS"
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
/**
 * Định dạng thời gian theo định dạng 12h
 * @param timestamp Timestamp cần định dạng (milliseconds)
 * @returns Chuỗi thời gian định dạng "hh:mm AM/PM"
 */
function formatTime12h(timestamp) {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 giờ sẽ hiển thị là 12 AM
    return `${hours}:${minutes} ${ampm}`;
}
/**
 * Định dạng thời lượng thành chuỗi đọc được
 * @param milliseconds Thời lượng tính bằng mili-giây
 * @returns Chuỗi thời lượng định dạng "HH:MM:SS"
 */
function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}
/**
 * Giải mã thời gian bắt đầu và kết thúc giấc ngủ từ chuỗi hex
 * @param hexString Chuỗi hex chứa dữ liệu giấc ngủ
 * @returns Thông tin về thời gian bắt đầu và kết thúc giấc ngủ
 */
function decodeSleepTime(hexString) {
    try {
        // Chuyển đổi chuỗi hex thành mảng byte
        const data = hexStringToByteArray(hexString);
        // Kiểm tra xem đây có phải là gói tin dữ liệu sức khỏe không
        if (data[0] !== 0x05) {
            console.error('Không phải gói tin dữ liệu sức khỏe');
            return null;
        }
        // Kiểm tra loại gói tin phụ (0x11, 0x15, 0x17, 0x18 cho dữ liệu giấc ngủ hoặc liên quan)
        const supportedPacketTypes = [0x11, 0x15, 0x17, 0x18];
        if (!supportedPacketTypes.includes(data[1])) {
            console.error(`Không phải gói tin dữ liệu giấc ngủ (type: 0x${data[1].toString(16)})`);
            return null;
        }
        console.log(`Loại gói tin: 0x${data[0].toString(16)} 0x${data[1].toString(16)}`);
        console.log(`Độ dài dữ liệu: ${data[2] | (data[3] << 8)} byte`);
        // Đọc giá trị thời gian từ offset 4-7 và 8-11 (Little-endian)
        const timeValue1 = data[4] | (data[5] << 8) | (data[6] << 16) | (data[7] << 24);
        const timeValue2 = data[8] | (data[9] << 8) | (data[10] << 16) | (data[11] << 24);
        console.log('timeValue1:', timeValue1);
        console.log('timeValue2:', timeValue2);
        // Chuyển đổi thành timestamp JavaScript
        const timestamp1 = (timeValue1 + REFERENCE_TIMESTAMP) * MILLISECONDS_PER_SECOND;
        const timestamp2 = (timeValue2 + REFERENCE_TIMESTAMP) * MILLISECONDS_PER_SECOND;
        console.log('timestamp1:', new Date(timestamp1).toISOString());
        console.log('timestamp2:', new Date(timestamp2).toISOString());
        // Điều chỉnh múi giờ (UTC+7)
        const timezoneOffsetHours = 7;
        const timezoneOffsetMillis = timezoneOffsetHours * 60 * 60 * 1000;
        // Điều chỉnh múi giờ
        const timestamp1Adjusted = timestamp1 - timezoneOffsetMillis;
        const timestamp2Adjusted = timestamp2 - timezoneOffsetMillis;
        console.log('timestamp1Adjusted:', new Date(timestamp1Adjusted).toISOString());
        console.log('timestamp2Adjusted:', new Date(timestamp2Adjusted).toISOString());
        // Xác định thời gian bắt đầu và kết thúc (thời gian kết thúc > thời gian bắt đầu)
        let startTimeAdjusted, endTimeAdjusted;
        if (timestamp1Adjusted < timestamp2Adjusted) {
            startTimeAdjusted = timestamp1Adjusted;
            endTimeAdjusted = timestamp2Adjusted;
        }
        else {
            startTimeAdjusted = timestamp2Adjusted;
            endTimeAdjusted = timestamp1Adjusted;
        }
        // Tính toán thời lượng
        const durationMilliseconds = endTimeAdjusted - startTimeAdjusted;
        const durationMinutes = Math.floor(durationMilliseconds / (60 * 1000));
        console.log('durationMilliseconds:', durationMilliseconds);
        console.log('durationMinutes:', durationMinutes);
        // Tạo kết quả
        const result = {
            startTime: startTimeAdjusted,
            endTime: endTimeAdjusted,
            startTimeFormatted: formatTimestamp(startTimeAdjusted),
            endTimeFormatted: formatTimestamp(endTimeAdjusted),
            startTime12h: formatTime12h(startTimeAdjusted),
            endTime12h: formatTime12h(endTimeAdjusted),
            durationMilliseconds,
            durationMinutes,
            durationFormatted: formatDuration(durationMilliseconds)
        };
        return result;
    }
    catch (error) {
        console.error('Lỗi khi giải mã thời gian giấc ngủ:', error);
        return null;
    }
}
/**
 * Hiển thị thông tin thời gian giấc ngủ
 * @param result Kết quả giải mã thời gian giấc ngủ
 * @returns Chuỗi thông tin về thời gian giấc ngủ
 */
function displaySleepTimeInfo(result) {
    if (!result) {
        return 'Không thể giải mã thời gian giấc ngủ';
    }
    let info = '=== THÔNG TIN THỜI GIAN GIẤC NGỦ ===\n\n';
    // Thông tin ngày
    const sleepDate = new Date(result.startTime);
    const day = sleepDate.getDate();
    const month = sleepDate.getMonth() + 1;
    const year = sleepDate.getFullYear();
    info += `Ngày: ${day}/${month}/${year}\n`;
    info += `Giờ đi ngủ: ${result.startTime12h}\n`;
    info += `Giờ thức dậy: ${result.endTime12h}\n`;
    info += `Thời lượng: ${result.durationFormatted} (${result.durationMinutes} phút)\n\n`;
    info += '--- CHI TIẾT ---\n';
    info += `Timestamp bắt đầu: ${result.startTime}\n`;
    info += `Timestamp kết thúc: ${result.endTime}\n`;
    info += `Thời gian bắt đầu: ${result.startTimeFormatted}\n`;
    info += `Thời gian kết thúc: ${result.endTimeFormatted}\n`;
    return info;
}
/**
 * Hàm chính để giải mã và hiển thị thông tin thời gian giấc ngủ từ chuỗi hex
 * @param hexString Chuỗi hex chứa dữ liệu giấc ngủ
 * @returns Thông tin chi tiết về thời gian giấc ngủ
 */
function decodeSleepTimeFromHexString(hexString) {
    const result = decodeSleepTime(hexString);
    return displaySleepTimeInfo(result);
}
// Thử các gói tin khác nhau
const hexString1 = "05 11 3e 00 58 74 74 2f 50 6d 74 2f 52 00 34 00 03 00 50 6d 74 2f 48 66 74 2f 3d 00 31 00 02 00 48 66 74 2f 40 5f 74 2f 1f 00 13 00 01 00 40 5f 74 2f 38 58 74 2f 37 00 22 00 02 00 59 32";
console.log("=== GÓI TIN 05 11 ===\n");
console.log(decodeSleepTimeFromHexString(hexString1));
const hexString2 = "05 15 3c 00 3e 6d 74 2f 00 59 33 66 74 2f 00 46 17 5f 74 2f 00 3c 17 58 74 2f 00 45 10 51 74 2f 00 72 -d 4a 74 2f 00 3c 0a 42 74 2f 00 5f 12 3b 74 2f 00 43 0a 34 74 2f 00 44 73 7e";
console.log("\n=== GÓI TIN 05 15 ===\n");
console.log(decodeSleepTimeFromHexString(hexString2));
const hexString3 = "05 17 4e 00 3e 6d 74 2f 01 72 4c 59 33 66 74 2f 01 6e 49 46 17 5f 74 2f 01 6b 46 3c 17 58 74 2f 01 6b 48 45 10 51 74 2f 01 80 53 72 -d 4a 74 2f 01 69 45 3c 0a 42 74 2f 01 74 4e 5f 12 3b 74";
console.log("\n=== GÓI TIN 05 17 ===\n");
console.log(decodeSleepTimeFromHexString(hexString3));
const hexString4 = "05 18 5a 00 3e 6d 74 2f 52 00 59 72 4c 62 12 28 03 00 0f 00 00 00 60 21 33 66 74 2f 71 00 46 6e 49 62 0e 2a 02 00 0f 00 00 00 06 29 17 5f 74 2f 52 00 3c 6b 46 60 0c 25 06 00 0f 00 00 00 21";
console.log("\n=== GÓI TIN 05 18 ===\n");
console.log(decodeSleepTimeFromHexString(hexString4));
