/**
 * Module giải mã thời gian bắt đầu và kết thúc giấc ngủ từ chuỗi hex
 * Dựa trên phân tích mã nguồn DataUnpack.java
 */

// Hằng số tham chiếu thời gian (1/1/2000 00:00:00 UTC)
const REFERENCE_TIMESTAMP = 946684800;
const MILLISECONDS_PER_SECOND = 1000;

/**
 * Chuyển đổi chuỗi hex thành mảng byte
 * @param hexString Chuỗi hex cần chuyển đổi (dạng "05 11 3e 00...")
 * @returns Mảng byte tương ứng
 */
function hexStringToByteArray(hexString: string): number[] {
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
function readUInt32LE(data: number[], offset: number): number {
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
function convertDeviceTimeToTimestamp(timeValue: number): number {
  return (timeValue + REFERENCE_TIMESTAMP) * MILLISECONDS_PER_SECOND;
}

/**
 * Định dạng timestamp thành chuỗi thời gian đọc được
 * @param timestamp Timestamp cần định dạng (milliseconds)
 * @returns Chuỗi thời gian định dạng "YYYY-MM-DD HH:MM:SS"
 */
function formatTimestamp(timestamp: number): string {
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
function formatTime12h(timestamp: number): string {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 giờ sẽ hiển thị là 12 AM
  
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Interface cho kết quả giải mã thời gian giấc ngủ
 */
interface SleepTimeResult {
  startTime: number;              // Timestamp bắt đầu (milliseconds)
  endTime: number;                // Timestamp kết thúc (milliseconds)
  startTimeFormatted: string;     // Thời gian bắt đầu định dạng "YYYY-MM-DD HH:MM:SS"
  endTimeFormatted: string;       // Thời gian kết thúc định dạng "YYYY-MM-DD HH:MM:SS"
  startTime12h: string;           // Thời gian bắt đầu định dạng "hh:mm AM/PM"
  endTime12h: string;             // Thời gian kết thúc định dạng "hh:mm AM/PM"
  durationMilliseconds: number;   // Thời lượng (milliseconds)
  durationMinutes: number;        // Thời lượng (phút)
  durationFormatted: string;      // Thời lượng định dạng "HH:MM:SS"
}

/**
 * Định dạng thời lượng thành chuỗi đọc được
 * @param milliseconds Thời lượng tính bằng mili-giây
 * @returns Chuỗi thời lượng định dạng "HH:MM:SS"
 */
function formatDuration(milliseconds: number): string {
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
export function decodeSleepTime(hexString: string): SleepTimeResult | null {
  try {
    // Chuyển đổi chuỗi hex thành mảng byte
    const data = hexStringToByteArray(hexString);
    
    // Kiểm tra xem đây có phải là gói tin dữ liệu sức khỏe không
    if (data[0] !== 0x05) {
      console.error('Không phải gói tin dữ liệu sức khỏe');
      return null;
    }
    
    // Kiểm tra loại gói tin phụ (0x11 cho dữ liệu giấc ngủ)
    if (data[1] !== 0x11) {
      console.error('Không phải gói tin dữ liệu giấc ngủ');
      return null;
    }
    
    // Lấy múi giờ hiện tại để điều chỉnh timestamp
    const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
    
    // Đọc thời gian bắt đầu (4 byte, offset 4-7)
    const startTimeValue = readUInt32LE(data, 4);
    const startTime = convertDeviceTimeToTimestamp(startTimeValue) - timezoneOffset;
    
    // Đọc thời gian kết thúc (4 byte, offset 8-11)
    const endTimeValue = readUInt32LE(data, 8);
    const endTime = convertDeviceTimeToTimestamp(endTimeValue) - timezoneOffset;
    
    // Tính toán thời lượng
    const durationMilliseconds = endTime - startTime;
    const durationMinutes = Math.floor(durationMilliseconds / (60 * 1000));
    
    // Tạo kết quả
    const result: SleepTimeResult = {
      startTime,
      endTime,
      startTimeFormatted: formatTimestamp(startTime),
      endTimeFormatted: formatTimestamp(endTime),
      startTime12h: formatTime12h(startTime),
      endTime12h: formatTime12h(endTime),
      durationMilliseconds,
      durationMinutes,
      durationFormatted: formatDuration(durationMilliseconds)
    };
    
    return result;
  } catch (error) {
    console.error('Lỗi khi giải mã thời gian giấc ngủ:', error);
    return null;
  }
}

/**
 * Hiển thị thông tin thời gian giấc ngủ
 * @param result Kết quả giải mã thời gian giấc ngủ
 * @returns Chuỗi thông tin về thời gian giấc ngủ
 */
export function displaySleepTimeInfo(result: SleepTimeResult | null): string {
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
export function decodeSleepTimeFromHexString(hexString: string): string {
  const result = decodeSleepTime(hexString);
  return displaySleepTimeInfo(result);
}

// Ví dụ sử dụng
// const hexString = "05 11 3e 00 58 74 74 2f 50 6d 74 2f 52 00 34 00 03 00 50 6d 74 2f 48 66 74 2f 3d 00 31 00 02 00 48 66 74 2f 40 5f 74 2f 1f 00 13 00 01 00 40 5f 74 2f 38 58 74 2f 37 00 22 00 02 00 59 32";
// console.log(decodeSleepTimeFromHexString(hexString));
