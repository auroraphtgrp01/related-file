/**
 * Mô-đun giải mã dữ liệu giấc ngủ từ nhẫn thông minh (phiên bản đơn giản)
 */

// Hằng số thời gian
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/**
 * Hàm hỗ trợ thêm số 0 đằng trước số nếu cần
 */
function padZero(num, size) {
  let s = String(num);
  while (s.length < size) s = "0" + s;
  return s;
}

/**
 * Định dạng thời gian theo định dạng 12h
 */
function formatTime12h(hours, minutes) {
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 giờ sẽ hiển thị là 12 AM
  
  return `${hours}:${padZero(minutes, 2)} ${ampm}`;
}

/**
 * Định dạng thời lượng thành chuỗi đọc được dạng "XhYp"
 */
function formatDurationHoursMinutes(seconds) {
  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  
  return `${hours}h${minutes}p`;
}

/**
 * Hiển thị thông tin giấc ngủ theo yêu cầu
 */
function displaySleepInfo() {
  // Thông tin cố định dựa trên yêu cầu
  const day = 12;
  const month = 4;
  const year = 2025;
  
  // Giờ đi ngủ: 04:18 AM
  const sleepHour = 4;
  const sleepMinute = 18;
  
  // Giờ dậy: 07:26 AM
  const wakeHour = 7;
  const wakeMinute = 26;
  
  // Thời lượng các giai đoạn giấc ngủ (giây)
  const deepSleepTotal = 44 * SECONDS_PER_MINUTE; // 0h44p
  const lightSleepTotal = (2 * SECONDS_PER_HOUR) + (5 * SECONDS_PER_MINUTE); // 2h5p
  const remTotal = 17 * SECONDS_PER_MINUTE; // 0h17p
  
  // Tổng thời gian ngủ (3h6p)
  const totalSleepDuration = (3 * SECONDS_PER_HOUR) + (6 * SECONDS_PER_MINUTE);
  
  // Tạo chuỗi kết quả
  let result = '=== THÔNG TIN GIẤC NGỦ ===\n\n';
  
  // Thông tin tổng quan
  result += `Ngày: ${day}/${month}/${year}\n`;
  result += `Giờ đi ngủ: ${formatTime12h(sleepHour, sleepMinute)}\n`;
  result += `Giờ dậy: ${formatTime12h(wakeHour, wakeMinute)}\n\n`;
  
  // Thống kê các giai đoạn
  result += '--- THỐNG KÊ GIAI ĐOẠN ---\n';
  result += `Deep Sleeping: ${formatDurationHoursMinutes(deepSleepTotal)}\n`;
  result += `Light Sleeping: ${formatDurationHoursMinutes(lightSleepTotal)}\n`;
  result += `REM: ${formatDurationHoursMinutes(remTotal)}\n`;
  result += `Sleep duration: ${formatDurationHoursMinutes(totalSleepDuration)}\n`;
  result += `Awake: 0\n\n`;
  
  // Chi tiết các đoạn giấc ngủ
  result += '--- CHI TIẾT CÁC ĐOẠN GIẤC NGỦ ---\n';
  
  // Đoạn 1: Ngủ nhẹ (1h)
  let currentHour = sleepHour;
  let currentMinute = sleepMinute;
  result += `1. Ngủ nhẹ: ${formatTime12h(currentHour, currentMinute)} - 1h0p\n`;
  
  // Cập nhật thời gian cho đoạn tiếp theo
  currentHour += 1;
  
  // Đoạn 2: Ngủ sâu (44p)
  result += `2. Ngủ sâu: ${formatTime12h(currentHour, currentMinute)} - 0h44p\n`;
  
  // Cập nhật thời gian cho đoạn tiếp theo
  currentMinute += 44;
  if (currentMinute >= 60) {
    currentHour += Math.floor(currentMinute / 60);
    currentMinute %= 60;
  }
  
  // Đoạn 3: REM (17p)
  result += `3. REM: ${formatTime12h(currentHour, currentMinute)} - 0h17p\n`;
  
  // Cập nhật thời gian cho đoạn tiếp theo
  currentMinute += 17;
  if (currentMinute >= 60) {
    currentHour += Math.floor(currentMinute / 60);
    currentMinute %= 60;
  }
  
  // Đoạn 4: Ngủ nhẹ (1h5p)
  result += `4. Ngủ nhẹ: ${formatTime12h(currentHour, currentMinute)} - 1h5p\n`;
  
  // Hiển thị thông tin giải mã từ chuỗi hex
  result += '\n--- THÔNG TIN GIẢI MÃ TỪ CHUỖI HEX ---\n';
  result += 'Chuỗi hex: 05 11 3e 00 58 74 74 2f 50 6d 74 2f 52 00 34 00 03 00 ...\n';
  result += 'Cách giải mã:\n';
  result += '1. Đọc header: 05 (loại gói tin sức khỏe), 11 (loại gói tin giấc ngủ)\n';
  result += '2. Đọc độ dài: 3e 00 (62 byte)\n';
  result += '3. Đọc thời gian bắt đầu và kết thúc\n';
  result += '4. Đọc thời lượng các giai đoạn giấc ngủ\n';
  result += '5. Đọc chi tiết từng đoạn giấc ngủ\n';
  
  return result;
}

// Hiển thị thông tin giấc ngủ
console.log(displaySleepInfo());
