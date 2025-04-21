/**
 * Script Frida để debug và lấy log khi đồng bộ dữ liệu giấc ngủ từ nhẫn qua BLE
 * Tập trung vào việc bắt và phân tích các gói tin liên quan đến giấc ngủ
 * Phiên bản cải tiến: Thêm nhiều hook hơn và log chi tiết hơn
 */

Java.perform(function() {
    console.log("🚀 Bắt đầu script debug dữ liệu giấc ngủ từ nhẫn thông minh (phiên bản hook sâu cải tiến)");
    
    // Thêm log để xác nhận script đang chạy mỗi 5 giây
    setInterval(function() {
        console.log("⏱️ Script vẫn đang chạy... " + new Date().toISOString());
    }, 5000);

    // Tìm các lớp cần thiết
    var DataUnpack = null;
    var YCBTClient = null;
    var SleepResponse = null;
    var BluetoothLeService = null;
    var BleManager = null;

    try {
        DataUnpack = Java.use("com.yucheng.ycbtsdk.core.DataUnpack");
        console.log("✅ Đã tìm thấy lớp DataUnpack");
    } catch (e) {
        console.log("❌ Không tìm thấy lớp DataUnpack: " + e);
    }

    try {
        YCBTClient = Java.use("com.yucheng.ycbtsdk.YCBTClient");
        console.log("✅ Đã tìm thấy lớp YCBTClient");
    } catch (e) {
        console.log("❌ Không tìm thấy lớp YCBTClient: " + e);
    }

    try {
        SleepResponse = Java.use("com.yucheng.smarthealthpro.home.bean.SleepResponse");
        console.log("✅ Đã tìm thấy lớp SleepResponse");
    } catch (e) {
        console.log("❌ Không tìm thấy lớp SleepResponse: " + e);
    }
    
    try {
        BluetoothLeService = Java.use("com.yucheng.ycbtsdk.service.BluetoothLeService");
        console.log("✅ Đã tìm thấy lớp BluetoothLeService");
    } catch (e) {
        console.log("❌ Không tìm thấy lớp BluetoothLeService: " + e);
    }
    
    try {
        BleManager = Java.use("com.yucheng.ycbtsdk.ble.BleManager");
        console.log("✅ Đã tìm thấy lớp BleManager");
    } catch (e) {
        console.log("❌ Không tìm thấy lớp BleManager: " + e);
    }

    // Hàm chuyển đổi mảng byte sang chuỗi hex
    function byteArrayToHex(byteArray) {
        if (!byteArray) return "null";
        var hex = "";
        for (var i = 0; i < byteArray.length; i++) {
            var b = byteArray[i] & 0xFF;
            hex += (b < 16 ? "0" : "") + b.toString(16) + " ";
        }
        return hex.trim();
    }
    
    // Hàm chuyển đổi mảng byte sang base64
    function byteArrayToBase64(byteArray) {
        if (!byteArray) return "null";
        try {
            var Base64 = Java.use("android.util.Base64");
            return Base64.encodeToString(byteArray, 0);
        } catch (e) {
            return "Không thể chuyển đổi sang base64: " + e;
        }
    }
    
    // Hàm lưu raw data vào file
    function saveRawData(data, prefix) {
        if (!data) return;
        try {
            var File = Java.use("java.io.File");
            var FileOutputStream = Java.use("java.io.FileOutputStream");
            var timestamp = new Date().getTime();
            var filename = "/sdcard/" + prefix + "_" + timestamp + ".bin";
            
            var file = File.$new(filename);
            var fos = FileOutputStream.$new(file);
            fos.write(data);
            fos.close();
            
            console.log("💾 Đã lưu raw data vào: " + filename);
            return filename;
        } catch (e) {
            console.log("❌ Lỗi khi lưu raw data: " + e);
            return null;
        }
    }

    // Hàm định dạng thời gian từ timestamp
    function formatTimestamp(timestamp) {
        try {
            // Chuyển đổi timestamp theo công thức: (timestamp + 946684800) * 1000
            var timeInMs = (timestamp + 946684800) * 1000;
            var date = new Date(timeInMs);
            return date.toISOString() + " (UTC+0)";
        } catch (e) {
            return "Lỗi định dạng timestamp: " + e;
        }
    }

    // Hàm định dạng thời lượng (giây -> h:m:s)
    function formatDuration(seconds) {
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = seconds % 60;
        return hours + "h " + minutes + "m " + secs + "s";
    }

    // Hàm log stacktrace
    function logStackTrace() {
        try {
            var Exception = Java.use('java.lang.Exception');
            var e = Exception.$new();
            var stack = e.getStackTrace();
            var trace = "";
            for (var i = 0; i < stack.length; i++) {
                trace += "\n  at " + stack[i].toString();
            }
            console.log("[STACKTRACE]" + trace);
        } catch (err) {
            console.log("[STACKTRACE] Lỗi khi lấy stacktrace: " + err);
        }
    }

    // Hàm phân tích chi tiết gói sleep
    function analyzeSleepPacketDetail(data) {
        if (!data || data.length < 12) return "Gói dữ liệu quá ngắn để phân tích";

        try {
            var cmd1 = data[0] & 0xFF;
            var cmd2 = data[1] & 0xFF;
            var packetType = "0x" + cmd1.toString(16) + " 0x" + cmd2.toString(16);
            var length = (data[2] & 0xFF) | ((data[3] & 0xFF) << 8);

            var startTimeRaw = (data[4] & 0xFF) | ((data[5] & 0xFF) << 8) | 
                              ((data[6] & 0xFF) << 16) | ((data[7] & 0xFF) << 24);
            var endTimeRaw = (data[8] & 0xFF) | ((data[9] & 0xFF) << 8) | 
                            ((data[10] & 0xFF) << 16) | ((data[11] & 0xFF) << 24);

            var result = "📊 Chi tiết gói " + packetType + ":\n";
            result += "  - Độ dài: " + length + " bytes\n";
            result += "  - Start time raw: 0x" + startTimeRaw.toString(16) + " (" + startTimeRaw + ")\n";
            result += "  - End time raw: 0x" + endTimeRaw.toString(16) + " (" + endTimeRaw + ")\n";
            result += "  - Start time: " + formatTimestamp(startTimeRaw) + "\n";
            result += "  - End time: " + formatTimestamp(endTimeRaw) + "\n";

            // Phân tích các trường tổng hợp nếu có
            if (data.length >= 28) {
                var deepCount = (data[12] & 0xFF) | ((data[13] & 0xFF) << 8);
                var lightCount = (data[14] & 0xFF) | ((data[15] & 0xFF) << 8);
                var awakeCount = (data[16] & 0xFF) | ((data[17] & 0xFF) << 8);
                var deepTotal = (data[18] & 0xFF) | ((data[19] & 0xFF) << 8);
                var lightTotal = (data[20] & 0xFF) | ((data[21] & 0xFF) << 8);
                var awakeTotal = (data[22] & 0xFF) | ((data[23] & 0xFF) << 8);
                var remTotal = (data[24] & 0xFF) | ((data[25] & 0xFF) << 8);
                var wakeTimes = (data[26] & 0xFF) | ((data[27] & 0xFF) << 8);

                result += "  - Deep sleep count: " + deepCount + "\n";
                result += "  - Light sleep count: " + lightCount + "\n";
                result += "  - Awake count: " + awakeCount + "\n";
                result += "  - Deep sleep total: " + deepTotal + " phút\n";
                result += "  - Light sleep total: " + lightTotal + " phút\n";
                result += "  - Awake total: " + awakeTotal + " phút\n";
                result += "  - REM total: " + remTotal + " phút\n";
                result += "  - Wake times: " + wakeTimes + "\n";
            }

            // Phân tích các block sleep stage nếu có
            if (data.length > 28) {
                result += "  - Chi tiết các giai đoạn giấc ngủ:\n";
                var offset = 28;
                var blockCount = 0;

                while (offset + 8 <= data.length) {
                    var sleepType = data[offset] & 0xFF;
                    var startTime = (data[offset + 1] & 0xFF) | ((data[offset + 2] & 0xFF) << 8) | 
                                   ((data[offset + 3] & 0xFF) << 16) | ((data[offset + 4] & 0xFF) << 24);
                    var duration = (data[offset + 5] & 0xFF) | ((data[offset + 6] & 0xFF) << 8) | 
                                  ((data[offset + 7] & 0xFF) << 16);

                    var sleepTypeStr = "";
                    switch (sleepType) {
                        case 241: sleepTypeStr = "Deep Sleep"; break;
                        case 242: sleepTypeStr = "Light Sleep"; break;
                        case 243: sleepTypeStr = "REM"; break;
                        case 244: sleepTypeStr = "Awake"; break;
                        default: sleepTypeStr = "Unknown (" + sleepType + ")";
                    }

                    result += "    Block " + (++blockCount) + ": " + sleepTypeStr + "\n";
                    result += "      Start: " + formatTimestamp(startTime) + "\n";
                    result += "      Duration: " + formatDuration(duration) + "\n";

                    offset += 8;
                }
            }

            return result;
        } catch (e) {
            return "❌ Lỗi khi phân tích chi tiết: " + e;
        }
    }

    // Hàm phân tích loại gói tin giấc ngủ
    function analyzeSleepPacket(bytes) {
        if (!bytes || bytes.length < 2) return "Không xác định";
        var cmd1 = bytes[0] & 0xFF;
        var cmd2 = bytes[1] & 0xFF;
        if (cmd1 === 5) {
            switch (cmd2) {
                case 0x02: return "Lệnh lấy trạng thái giấc ngủ (0x05 02)";
                case 0x04: return "Lệnh lấy dữ liệu giấc ngủ gần đây (0x05 04)";
                case 0x06: return "Lệnh lấy thông tin thống kê giấc ngủ (0x05 06)";
                case 0x08: return "Lệnh lấy chi tiết các giai đoạn giấc ngủ (0x05 08)";
                case 0x09: return "Lệnh lấy thông tin giấc ngủ chi tiết (0x05 09)";
                case 0x11: return "Dữ liệu giấc ngủ cơ bản (0x05 11)";
                case 0x13: return "Dữ liệu giấc ngủ chi tiết theo giờ (0x05 13)";
                case 0x15: return "Dữ liệu tổng hợp giấc ngủ (0x05 15)";
                case 0x17: return "Dữ liệu giấc ngủ lịch sử (0x05 17)";
                case 0x18: return "Dữ liệu chi tiết giấc ngủ lịch sử (0x05 18)";
                case 0x80: return "Xóa dữ liệu giấc ngủ (0x05 80)";
                default: return "Gói sleep khác: 0x" + cmd1.toString(16) + " 0x" + cmd2.toString(16);
            }
        } else if (cmd1 === 6 && cmd2 === 0) {
            return "Dữ liệu giấc ngủ thời gian thực (0x06 00)";
        }
        return "Không phải gói tin giấc ngủ";
    }

    // Danh sách các hàm unpack sleep cần hook sâu
    var unpackSleepMethods = [
        {name: "unpackHealthData", overload: ["[B", "int"]},
        {name: "unpackSleepDetailData", overload: ["[B"]},
        {name: "unpackSleepStagesData", overload: ["[B"]},
        {name: "unpackGetSleepStatus", overload: ["[B"]},
        {name: "unpackSleepDataRealTime", overload: ["[B"]}
    ];

    // Hook các hàm unpack sleep
    if (DataUnpack) {
        unpackSleepMethods.forEach(function(method) {
            try {
                var m = DataUnpack[method.name];
                if (!m) return;
                if (method.overload.length === 2) {
                    m.overload(method.overload[0], method.overload[1]).implementation = function(data, type) {
                        console.log("\n============================");
                        console.log("📥 CALL: " + method.name + "(" + byteArrayToHex(data) + ", type=" + type + ")");
                        console.log("📋 Phân tích: " + analyzeSleepPacket(data));
                        console.log("📦 RAW DATA (Base64): " + byteArrayToBase64(data));
                        saveRawData(data, method.name + "_type" + type);

                        if (method.name === "unpackHealthData" && type === 4) {
                            // Type 4 là sleep data
                            console.log(analyzeSleepPacketDetail(data));
                        }

                        logStackTrace();
                        var result = this[method.name](data, type);
                        try {
                            console.log("📤 Kết quả: " + JSON.stringify(result));
                        } catch (e) {
                            console.log("📤 Kết quả: " + result);
                        }
                        return result;
                    };
                } else {
                    m.overload(method.overload[0]).implementation = function(data) {
                        console.log("\n============================");
                        console.log("📥 CALL: " + method.name + "(" + byteArrayToHex(data) + ")");
                        console.log("📋 Phân tích: " + analyzeSleepPacket(data));
                        console.log("📦 RAW DATA (Base64): " + byteArrayToBase64(data));
                        saveRawData(data, method.name);
                        console.log(analyzeSleepPacketDetail(data));
                        logStackTrace();
                        var result = this[method.name](data);
                        try {
                            console.log("📤 Kết quả: " + JSON.stringify(result));
                        } catch (e) {
                            console.log("📤 Kết quả: " + result);
                        }
                        return result;
                    };
                }
                console.log("✅ Đã hook sâu " + method.name);
            } catch (e) {
                console.log("❌ Không thể hook sâu " + method.name + ": " + e);
            }
        });
    }

    // Hook YCBTClient để bắt các lệnh liên quan đến sleep
    if (YCBTClient) {
        try {
            // Hook tất cả các phương thức có thể liên quan đến giấc ngủ
            var sleepMethods = [
                "getSleepStatus",
                "healthHistoryData",
                "getSleepData",
                "getSleepDetailData",
                "getSleepStagesData",
                "getSleepHistoryData",
                "deleteSleepData",
                "startSleepMonitoring",
                "stopSleepMonitoring"
            ];
            
            sleepMethods.forEach(function(methodName) {
                if (YCBTClient[methodName]) {
                    var originalMethod = YCBTClient[methodName];
                    
                    // Lấy tất cả các overload của phương thức
                    var overloads = originalMethod.overloads;
                    if (overloads) {
                        for (var i = 0; i < overloads.length; i++) {
                            overloads[i].implementation = function() {
                                console.log("\n============================");
                                console.log("📱 CALL: YCBTClient." + methodName + "() với " + arguments.length + " tham số");
                                
                                // Log tất cả các tham số
                                for (var j = 0; j < arguments.length; j++) {
                                    console.log("   Tham số " + j + ": " + arguments[j]);
                                }
                                
                                logStackTrace();
                                
                                // Gọi phương thức gốc
                                var result = this[methodName].apply(this, arguments);
                                console.log("📤 Kết quả trả về: " + result);
                                return result;
                            };
                        }
                        console.log("✅ Đã hook thành công phương thức YCBTClient." + methodName + " với " + overloads.length + " overload");
                    } else {
                        console.log("⚠️ Không tìm thấy overload cho phương thức " + methodName);
                    }
                } else {
                    console.log("⚠️ Không tìm thấy phương thức " + methodName + " trong YCBTClient");
                }
            });
            
            // Hook cụ thể cho một số phương thức quan trọng
            if (YCBTClient.getSleepStatus) {
                YCBTClient.getSleepStatus.implementation = function(callback) {
                    console.log("\n============================");
                    console.log("📱 CALL: YCBTClient.getSleepStatus()");
                    logStackTrace();
                    console.log("📥 CALL: YCBTClient.getSleepStatus - Lấy trạng thái giấc ngủ");
                    
                    // Tạo một wrapper callback để log kết quả
                    var wrappedCallback = Java.use('com.yucheng.ycbtsdk.response.BleDataResponse').$new();
                    
                    wrappedCallback.onDataResponse = function(code, data) {
                        console.log("📱 CALLBACK: getSleepStatus với code=" + code);
                        console.log("📱 CALLBACK DATA: " + JSON.stringify(data));
                        
                        // Gọi callback gốc
                        if (callback) {
                            callback.onDataResponse(code, data);
                        }
                    };
                    
                    return this.getSleepStatus(wrappedCallback);
                };
                console.log("✅ Đã hook sâu phương thức YCBTClient.getSleepStatus với callback wrapper");
            }
            
            if (YCBTClient.healthHistoryData) {
                YCBTClient.healthHistoryData.implementation = function(type, callback) {
                    console.log("\n============================");
                    console.log("📥 CALL: YCBTClient.healthHistoryData với type=" + type);
                    if (type === 4) {
                        console.log("🛌 Đang lấy dữ liệu lịch sử giấc ngủ");
                    }
                    logStackTrace();
                    
                    // Tạo một wrapper callback để log kết quả
                    var wrappedCallback = Java.use('com.yucheng.ycbtsdk.response.BleDataResponse').$new();
                    
                    wrappedCallback.onDataResponse = function(code, data) {
                        console.log("📱 CALLBACK: healthHistoryData với code=" + code + ", type=" + type);
                        console.log("📱 CALLBACK DATA: " + JSON.stringify(data));
                        
                        // Gọi callback gốc
                        if (callback) {
                            callback.onDataResponse(code, data);
                        }
                    };
                    
                    return this.healthHistoryData(type, wrappedCallback);
                };
                console.log("✅ Đã hook sâu phương thức YCBTClient.healthHistoryData với callback wrapper");
            }
        } catch (e) {
            console.log("❌ Lỗi khi hook các phương thức YCBTClient: " + e);
        }
    }
    
    // Hook BluetoothGattCallback để theo dõi tất cả các gói tin Bluetooth
    try {
        var BluetoothGattCallback = Java.use("android.bluetooth.BluetoothGattCallback");
        
        // Theo dõi khi nhận dữ liệu từ thiết bị
        BluetoothGattCallback.onCharacteristicChanged.overload(
            'android.bluetooth.BluetoothGatt', 
            'android.bluetooth.BluetoothGattCharacteristic'
        ).implementation = function(gatt, characteristic) {
            try {
                var deviceName = gatt.getDevice().getName();
                var uuid = characteristic.getUuid().toString();
                var value = characteristic.getValue();
                
                if (value && value.length > 0) {
                    var hexValue = byteArrayToHex(value);
                    
                    if (value[0] === 5) { // Gói tin liên quan đến giấc ngủ
                        console.log("\n============================");
                        console.log(" BLE [NHẬN] từ " + deviceName);
                        console.log(" UUID: " + uuid);
                        console.log(" Dữ liệu: " + hexValue);
                        console.log(" Phân tích: " + analyzeSleepPacket(value));
                        console.log(" RAW DATA (Base64): " + byteArrayToBase64(value));
                        saveRawData(value, "BLE_RECEIVE");
                    }
                }
            } catch (e) {
                console.log(" Lỗi trong onCharacteristicChanged: " + e);
            }
            
            return this.onCharacteristicChanged(gatt, characteristic);
        };
        
        // Theo dõi khi gửi dữ liệu đến thiết bị
        BluetoothGattCallback.onCharacteristicWrite.overload(
            'android.bluetooth.BluetoothGatt', 
            'android.bluetooth.BluetoothGattCharacteristic', 
            'int'
        ).implementation = function(gatt, characteristic, status) {
            try {
                var deviceName = gatt.getDevice().getName();
                var uuid = characteristic.getUuid().toString();
                var value = characteristic.getValue();
                
                if (value && value.length > 0 && value[0] === 5) {
                    console.log("📱 BLE [GỬI] đến " + deviceName + " (status: " + status + ")");
                    console.log("🆔 UUID: " + uuid);
                    console.log("📊 Dữ liệu: " + byteArrayToHex(value));
                    console.log("📋 Phân tích: " + analyzeSleepPacket(value));
                    console.log("📦 RAW DATA (Base64): " + byteArrayToBase64(value));
                    saveRawData(value, "BLE_SEND");
                }
            } catch (e) {
                console.log("❌ Lỗi trong onCharacteristicWrite: " + e);
            }
            
            return this.onCharacteristicWrite(gatt, characteristic, status);
        };
        
        console.log("✅ Đã hook thành công BluetoothGattCallback");
    } catch (e) {
        console.log("❌ Lỗi khi hook BluetoothGattCallback: " + e);
    }
    
    // Hook BluetoothGatt.writeCharacteristic để bắt lệnh gửi đến thiết bị
    try {
        var BluetoothGatt = Java.use("android.bluetooth.BluetoothGatt");
        
        BluetoothGatt.writeCharacteristic.overload(
            'android.bluetooth.BluetoothGattCharacteristic'
        ).implementation = function(characteristic) {
            try {
                var value = characteristic.getValue();
                
                if (value && value.length > 0 && value[0] === 5) {
                    var deviceName = this.getDevice().getName();
                    var uuid = characteristic.getUuid().toString();
                    
                    console.log("📱 BLE [GỬI LỆNH] đến " + deviceName);
                    console.log("🆔 UUID: " + uuid);
                    console.log("📊 Dữ liệu: " + byteArrayToHex(value));
                    console.log("📋 Phân tích: " + analyzeSleepPacket(value));
                    console.log("📦 RAW DATA (Base64): " + byteArrayToBase64(value));
                    saveRawData(value, "BLE_WRITE_CMD");
                }
            } catch (e) {
                console.log("❌ Lỗi trong writeCharacteristic: " + e);
            }
            
            return this.writeCharacteristic(characteristic);
        };
        
        console.log("✅ Đã hook thành công BluetoothGatt.writeCharacteristic");
    } catch (e) {
        console.log("❌ Lỗi khi hook BluetoothGatt.writeCharacteristic: " + e);
    }
    
    // Hook các lớp liên quan đến kết nối Bluetooth
    if (BluetoothLeService) {
        try {
            // Hook phương thức connect
            if (BluetoothLeService.connect) {
                BluetoothLeService.connect.implementation = function(address) {
                    console.log("\n============================");
                    console.log("📱 CALL: BluetoothLeService.connect(" + address + ")");
                    logStackTrace();
                    var result = this.connect(address);
                    console.log("📤 Kết quả kết nối: " + result);
                    return result;
                };
                console.log("✅ Đã hook thành công phương thức BluetoothLeService.connect");
            }
            
            // Hook phương thức sendData
            if (BluetoothLeService.sendData) {
                BluetoothLeService.sendData.implementation = function(data) {
                    console.log("\n============================");
                    console.log("📱 CALL: BluetoothLeService.sendData(" + byteArrayToHex(data) + ")");
                    console.log("📋 Phân tích: " + analyzeSleepPacket(data));
                    logStackTrace();
                    var result = this.sendData(data);
                    console.log("📤 Kết quả gửi dữ liệu: " + result);
                    return result;
                };
                console.log("✅ Đã hook thành công phương thức BluetoothLeService.sendData");
            }
        } catch (e) {
            console.log("❌ Lỗi khi hook các phương thức BluetoothLeService: " + e);
        }
    }
    
    // Hook BleManager nếu có
    if (BleManager) {
        try {
            // Hook các phương thức liên quan đến kết nối
            var bleManagerMethods = [
                "connect",
                "disconnect",
                "sendData",
                "startScan",
                "stopScan"
            ];
            
            bleManagerMethods.forEach(function(methodName) {
                if (BleManager[methodName]) {
                    BleManager[methodName].implementation = function() {
                        console.log("\n============================");
                        console.log("📱 CALL: BleManager." + methodName + "() với " + arguments.length + " tham số");
                        
                        // Log tất cả các tham số
                        for (var j = 0; j < arguments.length; j++) {
                            if (methodName === "sendData" && j === 0) {
                                console.log("   Tham số " + j + ": " + byteArrayToHex(arguments[j]));
                                console.log("   Phân tích: " + analyzeSleepPacket(arguments[j]));
                            } else {
                                console.log("   Tham số " + j + ": " + arguments[j]);
                            }
                        }
                        
                        logStackTrace();
                        
                        // Gọi phương thức gốc
                        var result = this[methodName].apply(this, arguments);
                        console.log("📤 Kết quả trả về: " + result);
                        return result;
                    };
                    console.log("✅ Đã hook thành công phương thức BleManager." + methodName);
                }
            });
        } catch (e) {
            console.log("❌ Lỗi khi hook các phương thức BleManager: " + e);
        }
    }
    
    // Hook SleepResponse nếu có
    if (SleepResponse) {
        try {
            // Hook constructor
            SleepResponse.$init.implementation = function() {
                console.log("\n============================");
                console.log("📱 CALL: Tạo đối tượng SleepResponse mới");
                logStackTrace();
                var result = this.$init();
                return result;
            };
            
            // Hook tất cả các setter methods
            var methods = SleepResponse.class.getDeclaredMethods();
            for (var i = 0; i < methods.length; i++) {
                var methodName = methods[i].getName();
                if (methodName.startsWith("set")) {
                    try {
                        SleepResponse[methodName].implementation = function() {
                            console.log("📱 CALL: SleepResponse." + this.methodName + "(" + arguments[0] + ")");
                            return this[this.methodName].apply(this, arguments);
                        }.bind({methodName: methodName});
                        console.log("✅ Đã hook thành công phương thức SleepResponse." + methodName);
                    } catch (e) {
                        console.log("❌ Lỗi khi hook phương thức SleepResponse." + methodName + ": " + e);
                    }
                }
            }
        } catch (e) {
            console.log("❌ Lỗi khi hook các phương thức SleepResponse: " + e);
        }
    }
    
    console.log("🚀 Đã hoàn tất thiết lập hook. Vui lòng mở ứng dụng và kết nối với nhẫn thông minh để bắt đầu debug.");
    console.log("💾 Raw data sẽ được lưu vào thư mục /sdcard/ trên thiết bị.");
    console.log("📝 Mỗi gói dữ liệu sẽ được log dưới dạng hex và base64, đồng thời lưu thành file binary để phân tích sau.");
    console.log("⚠️ Nếu không thấy log, hãy kiểm tra kết nối Bluetooth và đảm bảo ứng dụng đang chạy.");
});
