/**
 * File demo để kiểm tra chức năng giải mã dữ liệu giấc ngủ
 */

import { decodeSleepDataFromHexString } from './sleep';

// Chuỗi hex mẫu từ log-connect.txt
const hexString = "05 11 3e 00 58 74 74 2f 50 6d 74 2f 52 00 34 00 03 00 50 6d 74 2f 48 66 74 2f 3d 00 31 00 02 00 48 66 74 2f 40 5f 74 2f 1f 00 13 00 01 00 40 5f 74 2f 38 58 74 2f 37 00 22 00 02 00 59 32";

// Giải mã và hiển thị kết quả
console.log(decodeSleepDataFromHexString(hexString));
