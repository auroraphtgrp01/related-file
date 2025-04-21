/**
 * Mô-đun giải mã dữ liệu giấc ngủ từ nhẫn thông minh
 * Dựa trên phân tích mã nguồn DataUnpack.java và debug.js
 */

// Các hằng số định nghĩa loại giấc ngủ
enum SleepType {
  UNKNOWN = -1,
  DEEP_SLEEP = 241,  // Deep Sleep
  LIGHT_SLEEP = 242, // Light Sleep
  REM = 243,         // REM
  AWAKE = 244        // Awake/Tỉnh giấc
}

// Interface cho đoạn giấc ngủ
interface SleepSegment {
  sleepType: SleepType;      // Loại giấc ngủ
  sleepStartTime: number;    // Thời điểm bắt đầu (timestamp)
  sleepLen: number;          // Thời lượng (giây)
  sleepStartTimeFormatted?: string; // Thời gian bắt đầu định dạng đọc được
}

// Interface cho dữ liệu giấc ngủ tổng hợp
interface SleepData {
  startTime: number;             // Thời điểm bắt đầu ngủ (timestamp)
  endTime: number;               // Thời điểm kết thúc ngủ (timestamp)
  deepSleepCount: number;        // Số lần ngủ sâu
  lightSleepCount: number;       // Số lần ngủ nhẹ
  deepSleepTotal: number;        // Tổng thời gian ngủ sâu (giây)
  lightSleepTotal: number;       // Tổng thời gian ngủ nhẹ (giây)
  rapidEyeMovementTotal: number; // Tổng thời gian REM (giây)
  wakeCount: number;             // Số lần thức giấc
  wakeDuration: number;          // Tổng thời gian thức giấc (giây)
  sleepData: SleepSegment[];     // Chi tiết các đoạn giấc ngủ
  
  // Các trường bổ sung để hiển thị
  startTimeFormatted?: string;   // Thời gian bắt đầu định dạng đọc được
  endTimeFormatted?: string;     // Thời gian kết thúc định dạng đọc được
  totalSleepDuration?: number;   // Tổng thời gian ngủ (giây)
  sleepQuality?: number;         // Chất lượng giấc ngủ (0-100)
}

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
 * Định dạng thời lượng thành chuỗi đọc được
 * @param seconds Thời lượng tính bằng giây
 * @returns Chuỗi thời lượng định dạng "HH:MM:SS"
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

/**
 * Lấy tên loại giấc ngủ từ mã
 * @param sleepType Mã loại giấc ngủ
 * @returns Tên loại giấc ngủ
 */
function getSleepTypeName(sleepType: SleepType): string {
  switch (sleepType) {
    case SleepType.DEEP_SLEEP:
      return 'Ngủ sâu';
    case SleepType.LIGHT_SLEEP:
      return 'Ngủ nhẹ';
    case SleepType.REM:
      return 'REM';
    case SleepType.AWAKE:
      return 'Thức giấc';
    default:
      return 'Không xác định';
  }
}

/**
 * Giải mã dữ liệu giấc ngủ từ chuỗi hex
 * @param hexString Chuỗi hex chứa dữ liệu giấc ngủ
 * @returns Dữ liệu giấc ngủ đã giải mã
 */
export function decodeSleepData(hexString: string): SleepData | null {
  try {
    // Chuyển đổi chuỗi hex thành mảng byte
    const data = hexStringToByteArray(hexString);
    
    // Kiểm tra xem đây có phải là gói tin dữ liệu sức khỏe không
    if (data[0] !== 0x05) {
      console.error('Không phải gói tin dữ liệu sức khỏe');
      return null;
    }
    
    // Lấy múi giờ hiện tại để điều chỉnh timestamp
    const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
    
    // Khởi tạo các biến để lưu trữ dữ liệu giấc ngủ
    let offset = 4; // Bỏ qua header (05 11 3e 00)
    
    // Đọc thời gian bắt đầu (4 byte)
    const startTimeValue = 
      (data[offset] & 0xFF) | 
      ((data[offset + 1] & 0xFF) << 8) | 
      ((data[offset + 2] & 0xFF) << 16) | 
      ((data[offset + 3] & 0xFF) << 24);
    const startTime = (startTimeValue + 946684800) * 1000; // Thêm offset 1/1/2000
    offset += 4;
    
    // Đọc thời gian kết thúc (4 byte)
    const endTimeValue = 
      (data[offset] & 0xFF) | 
      ((data[offset + 1] & 0xFF) << 8) | 
      ((data[offset + 2] & 0xFF) << 16) | 
      ((data[offset + 3] & 0xFF) << 24);
    const endTime = (endTimeValue + 946684800) * 1000;
    offset += 4;
    
    // Đọc thời lượng (2 byte)
    const duration = (data[offset] & 0xFF) | ((data[offset + 1] & 0xFF) << 8);
    offset += 2;
    
    // Khởi tạo biến lưu trữ thông tin giấc ngủ
    let deepSleepTotal = 0;
    let lightSleepTotal = 0;
    let rapidEyeMovementTotal = 0;
    let deepSleepCount = 0;
    let lightSleepCount = 0;
    
    // Xử lý theo định dạng
    if (duration === 0xFFFF) {
      // Định dạng 1: Khi thời lượng = 0xFFFF
      rapidEyeMovementTotal = (data[offset] & 0xFF) | ((data[offset + 1] & 0xFF) << 8);
      offset += 2;
      
      deepSleepTotal = (data[offset] & 0xFF) | ((data[offset + 1] & 0xFF) << 8);
      offset += 2;
      
      lightSleepTotal = (data[offset] & 0xFF) | ((data[offset + 1] & 0xFF) << 8);
      offset += 2;
      
      deepSleepCount = duration; // Trong trường hợp này, deepSleepCount = 0xFFFF
    } else {
      // Định dạng 2: Khi thời lượng != 0xFFFF
      lightSleepCount = (data[offset] & 0xFF) | ((data[offset + 1] & 0xFF) << 8);
      offset += 2;
      
      deepSleepTotal = ((data[offset] & 0xFF) | ((data[offset + 1] & 0xFF) << 8)) * 60;
      offset += 2;
      
      lightSleepTotal = ((data[offset] & 0xFF) | ((data[offset + 1] & 0xFF) << 8)) * 60;
      offset += 2;
    }
    
    // Đọc chi tiết các đoạn giấc ngủ
    const sleepSegments: SleepSegment[] = [];
    const uniqueStartTimes: Set<string> = new Set();
    let wakeCount = 0;
    let wakeDuration = 0;
    
    // Đọc dữ liệu chi tiết từng đoạn giấc ngủ
    while (offset + 8 <= data.length) {
      // Đọc loại giấc ngủ (1 byte)
      const sleepType = data[offset] & 0xFF;
      offset += 1;
      
      // Đọc thời gian bắt đầu đoạn (4 byte)
      const segmentStartValue = 
        (data[offset] & 0xFF) | 
        ((data[offset + 1] & 0xFF) << 8) | 
        ((data[offset + 2] & 0xFF) << 16) | 
        ((data[offset + 3] & 0xFF) << 24);
      const segmentStart = (segmentStartValue + 946684800) * 1000;
      offset += 4;
      
      // Đọc thời lượng đoạn (3 byte)
      const segmentLength = 
        (data[offset] & 0xFF) | 
        ((data[offset + 1] & 0xFF) << 8) | 
        ((data[offset + 2] & 0xFF) << 16);
      offset += 3;
      
      // Kiểm tra xem thời gian bắt đầu đã tồn tại chưa
      const startTimeKey = `${segmentStart}`;
      if (!uniqueStartTimes.has(startTimeKey)) {
        // Thêm vào danh sách đoạn giấc ngủ
        const segment: SleepSegment = {
          sleepType: sleepType as SleepType,
          sleepStartTime: segmentStart - timezoneOffset,
          sleepLen: segmentLength,
          sleepStartTimeFormatted: formatTimestamp(segmentStart - timezoneOffset)
        };
        
        sleepSegments.push(segment);
        uniqueStartTimes.add(startTimeKey);
        
        // Cập nhật thống kê thức giấc
        if (sleepType === SleepType.AWAKE) {
          wakeCount++;
          wakeDuration += segmentLength;
        }
      }
    }
    
    // Tạo đối tượng dữ liệu giấc ngủ
    const sleepData: SleepData = {
      startTime: startTime - timezoneOffset,
      endTime: endTime - timezoneOffset,
      deepSleepCount,
      lightSleepCount,
      deepSleepTotal,
      lightSleepTotal,
      rapidEyeMovementTotal,
      wakeCount,
      wakeDuration,
      sleepData: sleepSegments,
      
      // Thêm các trường bổ sung
      startTimeFormatted: formatTimestamp(startTime - timezoneOffset),
      endTimeFormatted: formatTimestamp(endTime - timezoneOffset),
      totalSleepDuration: deepSleepTotal + lightSleepTotal + rapidEyeMovementTotal,
      sleepQuality: calculateSleepQuality(deepSleepTotal, lightSleepTotal, rapidEyeMovementTotal, wakeDuration)
    };
    
    return sleepData;
  } catch (error) {
    console.error('Lỗi khi giải mã dữ liệu giấc ngủ:', error);
    return null;
  }
}

/**
 * Tính toán chất lượng giấc ngủ (0-100)
 * @param deepSleepTotal Tổng thời gian ngủ sâu (giây)
 * @param lightSleepTotal Tổng thời gian ngủ nhẹ (giây)
 * @param remTotal Tổng thời gian REM (giây)
 * @param wakeDuration Tổng thời gian thức giấc (giây)
 * @returns Chỉ số chất lượng giấc ngủ (0-100)
 */
function calculateSleepQuality(
  deepSleepTotal: number,
  lightSleepTotal: number,
  remTotal: number,
  wakeDuration: number
): number {
  // Tổng thời gian ngủ
  const totalSleepTime = deepSleepTotal + lightSleepTotal + remTotal + wakeDuration;
  
  if (totalSleepTime === 0) return 0;
  
  // Tỷ lệ các giai đoạn giấc ngủ
  const deepSleepRatio = deepSleepTotal / totalSleepTime;
  const remRatio = remTotal / totalSleepTime;
  const wakeRatio = wakeDuration / totalSleepTime;
  
  // Tính điểm chất lượng
  // - Ngủ sâu chiếm 20-25% là tốt nhất
  // - REM chiếm 20-25% là tốt nhất
  // - Thức giấc ít hơn 5% là tốt nhất
  const deepSleepScore = Math.min(100, 100 * (deepSleepRatio / 0.25));
  const remScore = Math.min(100, 100 * (remRatio / 0.25));
  const wakeScore = Math.max(0, 100 * (1 - wakeRatio / 0.05));
  
  // Tính điểm tổng hợp (trọng số: ngủ sâu 50%, REM 30%, thức giấc 20%)
  const qualityScore = (deepSleepScore * 0.5) + (remScore * 0.3) + (wakeScore * 0.2);
  
  return Math.round(qualityScore);
}

/**
 * Hiển thị thông tin giấc ngủ chi tiết
 * @param sleepData Dữ liệu giấc ngủ đã giải mã
 * @returns Chuỗi thông tin chi tiết về giấc ngủ
 */
export function displaySleepInfo(sleepData: SleepData): string {
  if (!sleepData) return 'Không có dữ liệu giấc ngủ';
  
  let result = '=== THÔNG TIN GIẤC NGỦ ===\n\n';
  
  // Thông tin tổng quan
  result += `Thời gian bắt đầu: ${sleepData.startTimeFormatted}\n`;
  result += `Thời gian kết thúc: ${sleepData.endTimeFormatted}\n`;
  result += `Tổng thời gian ngủ: ${formatDuration(sleepData.totalSleepDuration || 0)}\n`;
  result += `Chất lượng giấc ngủ: ${sleepData.sleepQuality}/100\n\n`;
  
  // Thống kê các giai đoạn
  result += '--- THỐNG KÊ GIAI ĐOẠN ---\n';
  result += `Ngủ sâu: ${formatDuration(sleepData.deepSleepTotal)}\n`;
  result += `Ngủ nhẹ: ${formatDuration(sleepData.lightSleepTotal)}\n`;
  result += `REM: ${formatDuration(sleepData.rapidEyeMovementTotal)}\n`;
  result += `Số lần thức giấc: ${sleepData.wakeCount}\n`;
  result += `Thời gian thức giấc: ${formatDuration(sleepData.wakeDuration)}\n\n`;
  
  // Chi tiết các đoạn giấc ngủ
  result += '--- CHI TIẾT CÁC ĐOẠN GIẤC NGỦ ---\n';
  sleepData.sleepData.forEach((segment, index) => {
    result += `${index + 1}. ${getSleepTypeName(segment.sleepType)}: `;
    result += `${segment.sleepStartTimeFormatted} - ${formatDuration(segment.sleepLen)}\n`;
  });
  
  return result;
}

/**
 * Hàm chính để giải mã và hiển thị thông tin giấc ngủ từ chuỗi hex
 * @param hexString Chuỗi hex chứa dữ liệu giấc ngủ
 * @returns Thông tin chi tiết về giấc ngủ
 */
export function decodeSleepDataFromHexString(hexString: string): string {
  const sleepData = decodeSleepData(hexString);
  
  if (!sleepData) {
    return 'Không thể giải mã dữ liệu giấc ngủ từ chuỗi hex đã cung cấp';
  }
  
  return displaySleepInfo(sleepData);
}

// Ví dụ sử dụng
const hexString = "05 11 3e 00 58 74 74 2f 50 6d 74 2f 52 00 34 00 03 00 50 6d 74 2f 48 66 74 2f 3d 00 31 00 02 00 48 66 74 2f 40 5f 74 2f 1f 00 13 00 01 00 40 5f 74 2f 38 58 74 2f 37 00 22 00 02 00 59 32";
console.log(decodeSleepDataFromHexString(hexString));
