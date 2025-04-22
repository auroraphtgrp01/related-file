Java.perform(function () {
    console.log("[+] Script bắt đầu chạy - Debug toàn diện dữ liệu giấc ngủ từ nhẫn thông minh");

    // ======================= CÁC HÀM TIỆN ÍCH =======================

    // Chuyển đổi byte array thành chuỗi hex để dễ đọc
    function bytesToHex(bytes) {
        if (!bytes) return "null";
        if (typeof bytes === 'string') return bytes;

        try {
            var ret = "";
            if (bytes.length) {
                for (var i = 0; i < bytes.length; i++) {
                    var b = bytes[i] & 0xff;
                    var bStr = b.toString(16);
                    if (b < 16) ret += "0";
                    ret += bStr + " ";
                }
                return ret.trim();
            } else {
                return "[]";
            }
        } catch (e) {
            return "Lỗi chuyển đổi bytes: " + e;
        }
    }

    // Log chuỗi object chi tiết để dễ dàng debug
    function objectToDetailedString(obj) {
        if (obj === null) return "null";
        if (obj === undefined) return "undefined";

        try {
            if (obj.toString && obj.toString() !== "[object Object]") {
                return obj.toString();
            }

            if (typeof obj.getClass === 'function') {
                // Java object
                var className = obj.getClass().getName();
                if (className) {
                    return className + " @ " + Java.cast(obj, Java.use("java.lang.Object")).hashCode();
                }
            }

            return JSON.stringify(obj);
        } catch (e) {
            return "Lỗi chuyển đổi object: " + e;
        }
    }

    // Phân tích timestamp Unix thành thời gian đọc được
    function formatTimestamp(timestamp) {
        if (!timestamp) return "không xác định";
        try {
            var date = new Date(timestamp);
            return date.toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        } catch (e) {
            return timestamp + " (lỗi định dạng: " + e + ")";
        }
    }

    // Chuyển đổi số giây thành giờ:phút:giây
    function formatSeconds(totalSeconds) {
        if (totalSeconds === null || totalSeconds === undefined) return "không xác định";

        try {
            var hours = Math.floor(totalSeconds / 3600);
            var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
            var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

            return hours + "h " + minutes + "m " + seconds + "s (" + totalSeconds + "s)";
        } catch (e) {
            return totalSeconds + " (lỗi định dạng: " + e + ")";
        }
    }

    // Lấy chi tiết đầy đủ nhất về một Java Object bằng reflection
    function dumpAllJavaPropertiesDetailed(obj, maxDepth) {
        if (obj === null) return "null";
        if (obj === undefined) return "undefined";
        if (!maxDepth) maxDepth = 3; // Mức độ sâu tối đa khi dump nested objects

        try {
            var result = {};
            var currentDepth = 0;

            function dumpObjectRecursive(obj, currentDepth) {
                if (currentDepth > maxDepth) return "[Đã vượt quá độ sâu tối đa]";
                if (obj === null) return null;
                if (obj === undefined) return undefined;

                var objData = {};

                // Nếu là primitive hoặc String, trả về giá trị trực tiếp
                if (typeof obj !== 'object' || obj.constructor === String) {
                    return obj;
                }

                // Xử lý Java objects
                if (typeof obj.getClass === 'function') {
                    var className = obj.getClass().getName();

                    // Đối với mảng Java
                    if (className.startsWith("[")) {
                        try {
                            var arrayLength = obj.length;
                            var arrayData = [];
                            for (var i = 0; i < Math.min(arrayLength, 50); i++) { // Giới hạn 50 phần tử
                                arrayData.push(dumpObjectRecursive(obj[i], currentDepth + 1));
                            }
                            if (arrayLength > 50) {
                                arrayData.push("... và " + (arrayLength - 50) + " phần tử khác");
                            }
                            objData["Loại"] = "Java Array (" + className + ")";
                            objData["Độ dài"] = arrayLength;
                            objData["Phần tử"] = arrayData;
                            return objData;
                        } catch (e) {
                            objData["Lỗi xử lý mảng"] = e.toString();
                        }
                    }

                    // Đối với Java objects thông thường
                    objData["Loại"] = "Java Object";
                    objData["Class"] = className;

                    // Lấy tất cả các phương thức của class
                    var clazz = Java.use(className);
                    if (clazz) {
                        // Các trường của class
                        try {
                            var fields = clazz.class.getDeclaredFields();
                            var fieldValues = {};

                            for (var i = 0; i < fields.length; i++) {
                                var field = fields[i];
                                field.setAccessible(true);
                                var fieldName = field.getName();
                                try {
                                    var value = field.get(obj);
                                    fieldValues[fieldName] = (currentDepth < maxDepth) ?
                                        dumpObjectRecursive(value, currentDepth + 1) :
                                        objectToDetailedString(value);
                                } catch (e) {
                                    fieldValues[fieldName] = "Lỗi truy cập: " + e;
                                }
                            }

                            objData["Fields"] = fieldValues;
                        } catch (e) {
                            objData["Lỗi đọc fields"] = e.toString();
                        }

                        // Các getter và setter
                        try {
                            var methods = clazz.class.getDeclaredMethods();
                            var getters = {};

                            for (var i = 0; i < methods.length; i++) {
                                var method = methods[i];
                                var methodName = method.getName();

                                // Chỉ xử lý getter không có tham số
                                if ((methodName.startsWith("get") || methodName.startsWith("is")) &&
                                    method.getParameterTypes().length === 0) {
                                    method.setAccessible(true);
                                    try {
                                        var value = method.invoke(obj, []);
                                        getters[methodName] = (currentDepth < maxDepth) ?
                                            dumpObjectRecursive(value, currentDepth + 1) :
                                            objectToDetailedString(value);
                                    } catch (e) {
                                        getters[methodName] = "Lỗi gọi getter: " + e;
                                    }
                                }
                            }

                            if (Object.keys(getters).length > 0) {
                                objData["Getters"] = getters;
                            }
                        } catch (e) {
                            objData["Lỗi đọc methods"] = e.toString();
                        }
                    }

                    // Xử lý các loại đặc biệt
                    try {
                        if (className === "java.util.ArrayList" ||
                            className === "java.util.LinkedList" ||
                            className === "java.util.Vector") {
                            objData["Loại"] = "Java Collection (" + className + ")";
                            var size = obj.size();
                            objData["Size"] = size;
                            var items = [];
                            for (var i = 0; i < Math.min(size, 20); i++) { // Giới hạn 20 phần tử
                                items.push(dumpObjectRecursive(obj.get(i), currentDepth + 1));
                            }
                            if (size > 20) {
                                items.push("... và " + (size - 20) + " phần tử khác");
                            }
                            objData["Phần tử"] = items;
                        } else if (className === "java.util.HashMap" ||
                            className === "java.util.LinkedHashMap" ||
                            className === "java.util.TreeMap") {
                            objData["Loại"] = "Java Map (" + className + ")";
                            var entries = obj.entrySet().toArray();
                            var size = entries.length;
                            objData["Size"] = size;
                            var items = {};
                            for (var i = 0; i < Math.min(size, 20); i++) { // Giới hạn 20 phần tử
                                var key = entries[i].getKey();
                                var value = entries[i].getValue();
                                items[objectToDetailedString(key)] = dumpObjectRecursive(value, currentDepth + 1);
                            }
                            if (size > 20) {
                                items["..."] = "và " + (size - 20) + " phần tử khác";
                            }
                            objData["Entries"] = items;
                        }
                    } catch (e) {
                        objData["Lỗi xử lý collection"] = e.toString();
                    }

                    return objData;
                }

                // Xử lý JavaScript objects thông thường
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        objData[prop] = (currentDepth < maxDepth) ?
                            dumpObjectRecursive(obj[prop], currentDepth + 1) :
                            objectToDetailedString(obj[prop]);
                    }
                }

                return objData;
            }

            result = dumpObjectRecursive(obj, 0);
            return JSON.stringify(result, null, 2);
        } catch (e) {
            return "Lỗi dump object: " + e;
        }
    }

    // Lấy stack trace từ Java exception
    function getStackTrace(e) {
        if (!e) return "No exception";

        try {
            var StringWriter = Java.use("java.io.StringWriter");
            var PrintWriter = Java.use("java.io.PrintWriter");

            var sw = StringWriter.$new();
            var pw = PrintWriter.$new(sw);

            e.printStackTrace(pw);
            pw.flush();

            return sw.toString();
        } catch (ex) {
            return "Error getting stack trace: " + ex;
        }
    }

    // Log chi tiết dataType của BLE command
    function getDataTypeName(dataType) {
        var dataTypeMap = {
            // Các command phổ biến
            0x100: "CMD_SET_TIME",
            0x103: "CMD_SET_USER_INFO",
            0x104: "CMD_SET_DEVICE_CONFIG",
            0x109: "CMD_SET_TARGET",
            0x112: "CMD_SET_HEART_RATE_MODE",
            0x200: "CMD_GET_DEVICE_INFO",
            0x201: "CMD_GET_BATTERY",
            0x203: "CMD_GET_DEVICE_NAME",
            0x207: "CMD_GET_USER_CONFIG",
            0x21B: "CMD_GET_CHIP_SCHEME",
            0x228: "CMD_GET_DEVICE_SUPPORT",
            0x500: "CMD_REAL_TIME_DATA",
            0x502: "CMD_GET_SLEEP_DATA",
            0x504: "CMD_GET_HEALTH_DATA",
            0x506: "CMD_GET_SPO2_DATA",
            0x507: "CMD_GET_HEART_RATE_DATA",
            0x1282: "RESP_HEALTH_DATA_TYPE2",
            0x1284: "RESP_HEALTH_DATA_TYPE4",
            0x1286: "RESP_HEALTH_DATA_TYPE6",
            0x1288: "RESP_HEALTH_DATA_TYPE8",
            0x1289: "RESP_HEALTH_DATA_TYPE9",
            0x1536: "RESP_REAL_TIME_SPORT",
            0xAAAA: "CMD_CUSTOM",
        };

        if (dataTypeMap[dataType]) {
            return dataTypeMap[dataType] + " (0x" + dataType.toString(16) + ")";
        } else {
            return "Unknown (0x" + dataType.toString(16) + ")";
        }
    }

    // Phân tích dữ liệu giấc ngủ từ mảng byte
    function analyzeSleepData(dataBytes) {
        if (!dataBytes || !dataBytes.length) return "Không có dữ liệu";

        try {
            var result = {
                raw: bytesToHex(dataBytes),
                analysis: {
                    segments: []
                }
            };

            // Phân tích từng đoạn dữ liệu dựa vào định dạng đã tìm ra từ log
            var offset = 0;

            // Thử các mẫu phân tích phổ biến dựa trên dataType khác nhau
            // Mẫu 1: Các đoạn 6-byte [timestamp(4 byte) + value(2 byte)]
            if (dataBytes.length % 6 === 0) {
                while (offset < dataBytes.length) {
                    var segmentBytes = dataBytes.slice(offset, offset + 6);

                    // Thử đọc timestamp từ 4 byte đầu (little endian)
                    var timestamp = ((segmentBytes[3] & 0xff) << 24) |
                        ((segmentBytes[2] & 0xff) << 16) |
                        ((segmentBytes[1] & 0xff) << 8) |
                        (segmentBytes[0] & 0xff);

                    // Đọc giá trị từ 2 byte cuối
                    var value = ((segmentBytes[5] & 0xff) << 8) |
                        (segmentBytes[4] & 0xff);

                    result.analysis.segments.push({
                        offset: offset,
                        timestamp: timestamp,
                        timestamp_formatted: formatTimestamp(timestamp * 1000), // Giả sử là Unix timestamp
                        value: value,
                        raw: bytesToHex(segmentBytes)
                    });

                    offset += 6;
                }
                result.analysis.pattern = "timestamp(4) + value(2)";
            }
            // Mẫu 2: Mẫu 12-byte (thường dùng cho dữ liệu chi tiết giấc ngủ)
            else if (dataBytes.length % 12 === 0) {
                while (offset < dataBytes.length) {
                    var segmentBytes = dataBytes.slice(offset, offset + 12);

                    // Timestamp bắt đầu
                    var startTs = ((segmentBytes[3] & 0xff) << 24) |
                        ((segmentBytes[2] & 0xff) << 16) |
                        ((segmentBytes[1] & 0xff) << 8) |
                        (segmentBytes[0] & 0xff);

                    // Timestamp kết thúc
                    var endTs = ((segmentBytes[7] & 0xff) << 24) |
                        ((segmentBytes[6] & 0xff) << 16) |
                        ((segmentBytes[5] & 0xff) << 8) |
                        (segmentBytes[4] & 0xff);

                    // Loại giấc ngủ / Thời lượng
                    var sleepType = segmentBytes[8] & 0xff;
                    var duration = ((segmentBytes[10] & 0xff) << 8) |
                        (segmentBytes[9] & 0xff);

                    // Loại giấc ngủ based on observation
                    var sleepTypeDescription = "Unknown";
                    if (sleepType === 1) sleepTypeDescription = "Awake";
                    else if (sleepType === 2) sleepTypeDescription = "Light Sleep";
                    else if (sleepType === 3) sleepTypeDescription = "Deep Sleep";
                    else if (sleepType === 5) sleepTypeDescription = "REM";

                    result.analysis.segments.push({
                        offset: offset,
                        start_timestamp: startTs,
                        start_time: formatTimestamp(startTs * 1000),
                        end_timestamp: endTs,
                        end_time: formatTimestamp(endTs * 1000),
                        sleep_type: sleepType,
                        sleep_type_desc: sleepTypeDescription,
                        duration: duration,
                        duration_formatted: formatSeconds(duration),
                        raw: bytesToHex(segmentBytes)
                    });

                    offset += 12;
                }
                result.analysis.pattern = "start_ts(4) + end_ts(4) + type(1) + duration(2) + extra(1)";
            }
            // Mẫu 3: Phân tích dạng 1284 (sleep data type 4)
            else {
                // Phân tích theo định dạng khác - mô tả các phân đoạn thời gian có timestmap
                var index = 0;
                while (index + 8 <= dataBytes.length) {
                    // 4 byte timestamp + 4 byte data
                    var segmentBytes = dataBytes.slice(index, index + 8);

                    var timestamp = ((segmentBytes[3] & 0xff) << 24) |
                        ((segmentBytes[2] & 0xff) << 16) |
                        ((segmentBytes[1] & 0xff) << 8) |
                        (segmentBytes[0] & 0xff);

                    var value1 = segmentBytes[4] & 0xff;
                    var value2 = segmentBytes[5] & 0xff;
                    var value3 = segmentBytes[6] & 0xff;
                    var value4 = segmentBytes[7] & 0xff;

                    result.analysis.segments.push({
                        offset: index,
                        timestamp: timestamp,
                        timestamp_formatted: formatTimestamp(timestamp * 1000),
                        value1: value1,
                        value2: value2,
                        value3: value3,
                        value4: value4,
                        raw: bytesToHex(segmentBytes)
                    });

                    index += 8;
                }
                result.analysis.pattern = "timestamp(4) + values(4)";
            }
            // Bổ sung thêm mẫu xử lý dữ liệu vào phần else trong hàm analyzeSleepData
            // Sau phần Mẫu 3, trước phần phân tích mẫu phụ:

            // Mẫu 4: Phân tích với các phân đoạn khác nhau (8-byte với nhiều loại giá trị)
            if (dataBytes.length % 8 === 0) {
                while (offset < dataBytes.length) {
                    var segmentBytes = dataBytes.slice(offset, offset + 8);

                    // Cấu trúc có thể là: [timestamp(4) + sleepType(1) + heartRate(1) + spo2(1) + reserved(1)]
                    var timestamp = ((segmentBytes[3] & 0xff) << 24) |
                        ((segmentBytes[2] & 0xff) << 16) |
                        ((segmentBytes[1] & 0xff) << 8) |
                        (segmentBytes[0] & 0xff);

                    var sleepType = segmentBytes[4] & 0xff;
                    var heartRate = segmentBytes[5] & 0xff;
                    var spo2 = segmentBytes[6] & 0xff;
                    var reserved = segmentBytes[7] & 0xff;

                    // Map sleepType
                    var sleepTypeDescription = "Unknown";
                    if (sleepType === 1) sleepTypeDescription = "Awake";
                    else if (sleepType === 2) sleepTypeDescription = "Light Sleep";
                    else if (sleepType === 3) sleepTypeDescription = "Deep Sleep";
                    else if (sleepType === 5) sleepTypeDescription = "REM";

                    result.analysis.segments.push({
                        offset: offset,
                        timestamp: timestamp,
                        timestamp_formatted: formatTimestamp(timestamp * 1000),
                        sleep_type: sleepType,
                        sleep_type_desc: sleepTypeDescription,
                        heart_rate: heartRate,
                        spo2: spo2,
                        reserved: reserved,
                        raw: bytesToHex(segmentBytes)
                    });

                    offset += 8;
                }
                result.analysis.pattern = "timestamp(4) + sleepType(1) + heartRate(1) + spo2(1) + reserved(1)";
            }
            // Phân tích mẫu phụ
            if (dataBytes.length >= 4) {
                // Kiểm tra có phải là timestamp không
                var possibleTs = ((dataBytes[3] & 0xff) << 24) |
                    ((dataBytes[2] & 0xff) << 16) |
                    ((dataBytes[1] & 0xff) << 8) |
                    (dataBytes[0] & 0xff);

                var date = new Date(possibleTs * 1000);
                // Nếu timestamp nằm trong khoảng hợp lý (2020-2030)
                if (date.getFullYear() >= 2020 && date.getFullYear() <= 2030) {
                    result.analysis.possible_start_timestamp = possibleTs;
                    result.analysis.possible_start_time = formatTimestamp(possibleTs * 1000);
                }

                // Kiểm tra các byte cuối có phải là timestamp không
                if (dataBytes.length >= 8) {
                    var lastIndex = dataBytes.length - 4;
                    var possibleEndTs = ((dataBytes[lastIndex + 3] & 0xff) << 24) |
                        ((dataBytes[lastIndex + 2] & 0xff) << 16) |
                        ((dataBytes[lastIndex + 1] & 0xff) << 8) |
                        (dataBytes[lastIndex] & 0xff);

                    var endDate = new Date(possibleEndTs * 1000);
                    if (endDate.getFullYear() >= 2020 && endDate.getFullYear() <= 2030) {
                        result.analysis.possible_end_timestamp = possibleEndTs;
                        result.analysis.possible_end_time = formatTimestamp(possibleEndTs * 1000);
                    }
                }
            }

            return JSON.stringify(result, null, 2);
        } catch (e) {
            return "Lỗi phân tích dữ liệu giấc ngủ: " + e;
        }
    }

    // ======================= HOOKS CHÍNH =======================

    // 1. Hook YCBTClient để debug các chức năng giấc ngủ
    try {
        var YCBTClient = Java.use("com.yucheng.ycbtsdk.YCBTClient");

        // Hook hàm lấy thông tin giấc ngủ
        YCBTClient.getSleepStatus.implementation = function (bleDataResponse) {
            console.log("\n[SLEEP] Gọi YCBTClient.getSleepStatus()");
            console.log("  ├── Tham số bleDataResponse: " + objectToDetailedString(bleDataResponse));

            try {
                var result = this.getSleepStatus(bleDataResponse);
                console.log("  ├── Kết quả trả về: " + objectToDetailedString(result));

                // Log chi tiết object response nếu không null
                if (result) {
                    console.log("  ├── CHI TIẾT KẾT QUẢ GIẤC NGỦ:");
                    console.log(dumpAllJavaPropertiesDetailed(result));

                    // Access dataBytes nếu có
                    try {
                        var dataBytes = result.dataBytes.value;
                        if (dataBytes) {
                            console.log("  ├── Phân tích dataBytes từ kết quả:");
                            console.log(analyzeSleepData(dataBytes));
                        }
                    } catch (e) {
                        console.log("  ├── Không thể truy cập dataBytes: " + e);
                    }
                }

                console.log("  └── Kết thúc YCBTClient.getSleepStatus()");
                return result;
            } catch (e) {
                console.log("  ├── Lỗi: " + e);
                console.log("  ├── Stack trace: " + getStackTrace(e));
                console.log("  └── Kết thúc YCBTClient.getSleepStatus() với lỗi");
                throw e;
            }
        };

        // Hook hàm ghi lại dữ liệu giấc ngủ
        YCBTClient.appSleepWriteBack.implementation = function (sleepArray, bleDataResponse) {
            console.log("\n[SLEEP] Gọi YCBTClient.appSleepWriteBack()");
            console.log("  ├── Tham số sleepArray: " + objectToDetailedString(sleepArray));
            console.log("  ├── Tham số bleDataResponse: " + objectToDetailedString(bleDataResponse));

            try {
                // Log chi tiết sleepArray nếu là mảng
                if (sleepArray && sleepArray.length > 0) {
                    console.log("  ├── CHI TIẾT SLEEP ARRAY:");
                    for (var i = 0; i < sleepArray.length; i++) {
                        console.log("  ├── -- Item #" + i + ":");
                        console.log(dumpAllJavaPropertiesDetailed(sleepArray[i]));
                    }
                }

                var result = this.appSleepWriteBack(sleepArray, bleDataResponse);
                console.log("  ├── Kết quả trả về: " + result);
                console.log("  └── Kết thúc YCBTClient.appSleepWriteBack()");
                return result;
            } catch (e) {
                console.log("  ├── Lỗi: " + e);
                console.log("  ├── Stack trace: " + getStackTrace(e));
                console.log("  └── Kết thúc YCBTClient.appSleepWriteBack() với lỗi");
                throw e;
            }
        };

        console.log("[+] Đã hook YCBTClient.getSleepStatus() và YCBTClient.appSleepWriteBack()");
    } catch (e) {
        console.log("[-] Lỗi khi hook YCBTClient: " + e);
    }

    // 2. Hook YCBTClientImpl để debug việc gửi/nhận dữ liệu BLE
    try {
        var YCBTClientImpl = Java.use("com.yucheng.ycbtsdk.YCBTClientImpl");

        // Hook hàm gửi dữ liệu đến thiết bị
        YCBTClientImpl.sendSingleData2Device.implementation = function (dataType, data, timeout, bleDataResponse) {
            console.log("\n[BLE] Gọi YCBTClientImpl.sendSingleData2Device()");
            console.log("  ├── DataType: " + dataType + " (" + "0x" + dataType.toString(16) + ")");
            console.log("  ├── Tên DataType: " + getDataTypeName(dataType));
            console.log("  ├── Data: [" + bytesToHex(data) + "]");
            console.log("  ├── Timeout: " + timeout);
            console.log("  ├── BleDataResponse: " + objectToDetailedString(bleDataResponse));

            // Phân tích dữ liệu dựa vào dataType
            if (dataType === 0x504) { // CMD_GET_HEALTH_DATA - bao gồm cả dữ liệu giấc ngủ
                console.log("  ├── ĐANG GỬI LỆNH LẤY DỮ LIỆU SỨC KHỎE");
                if (data && data.length > 0) {
                    console.log("  ├── Phân tích tham số gửi đến nhẫn:");
                    console.log("  ├── Parameter bytes: " + bytesToHex(data));
                }
            } else if (dataType === 0x502) { // CMD_GET_SLEEP_DATA
                console.log("  ├── ĐANG GỬI LỆNH LẤY DỮ LIỆU GIẤC NGỦ");
                if (data && data.length > 0) {
                    console.log("  ├── Phân tích tham số gửi đến nhẫn:");
                    console.log("  ├── Parameter bytes: " + bytesToHex(data));
                }
            }

            try {
                var result = this.sendSingleData2Device(dataType, data, timeout, bleDataResponse);
                console.log("  ├── Kết quả trả về: " + objectToDetailedString(result));
                console.log("  └── Kết thúc YCBTClientImpl.sendSingleData2Device()");
                return result;
            } catch (e) {
                console.log("  ├── Lỗi: " + e);
                console.log("  ├── Stack trace: " + getStackTrace(e));
                console.log("  └── Kết thúc YCBTClientImpl.sendSingleData2Device() với lỗi");
                throw e;
            }
        };

        console.log("[+] Đã hook YCBTClientImpl.sendSingleData2Device()");
    } catch (e) {
        console.log("[-] Lỗi khi hook YCBTClientImpl: " + e);
    }

    // 3. Hook BluetoothGattCallback để debug dữ liệu BLE trực tiếp
    try {
        var BluetoothGattCallback = Java.use("android.bluetooth.BluetoothGattCallback");

        // Hook hàm onCharacteristicChanged với overload cụ thể
        BluetoothGattCallback.onCharacteristicChanged.overload('android.bluetooth.BluetoothGatt', 'android.bluetooth.BluetoothGattCharacteristic').implementation = function (gatt, characteristic) {
            console.log("\n[BLE] Gọi BluetoothGattCallback.onCharacteristicChanged()");
            console.log("  ├── BluetoothGatt: " + objectToDetailedString(gatt));
            console.log("  ├── Characteristic UUID: " + characteristic.getUuid());

            try {
                // Lấy dữ liệu từ characteristic
                var value = characteristic.getValue();
                if (value) {
                    console.log("  ├── Giá trị dạng hex: " + bytesToHex(value));

                    // Phân tích dữ liệu nếu đủ dài
                    if (value.length >= 4) {
                        var possibleDataType = ((value[1] & 0xff) << 8) | (value[0] & 0xff);
                        console.log("  ├── Có thể là DataType: " + possibleDataType + " (0x" + possibleDataType.toString(16) + ")");
                        console.log("  ├── Tên có thể: " + getDataTypeName(possibleDataType));

                        // Nếu có thể là dữ liệu giấc ngủ
                        if (possibleDataType === 0x1282 || possibleDataType === 0x1284 ||
                            possibleDataType === 0x1286 || possibleDataType === 0x1288 ||
                            possibleDataType === 0x1289) {
                            console.log("  ├── ĐÂY LÀ DỮ LIỆU GIẤC NGỦ DẠNG RAW!");
                            console.log("  ├── Phân tích dữ liệu:");
                            console.log(analyzeSleepData(value.slice(4))); // Bỏ 4 byte header
                        }
                    }
                }

                this.onCharacteristicChanged(gatt, characteristic);
                console.log("  └── Kết thúc BluetoothGattCallback.onCharacteristicChanged()");
            } catch (e) {
                console.log("  ├── Lỗi: " + e);
                console.log("  ├── Stack trace: " + getStackTrace(e));
                console.log("  └── Kết thúc BluetoothGattCallback.onCharacteristicChanged() với lỗi");
                throw e;
            }
        };

        // Hook hàm onCharacteristicChanged với overload có mảng byte
        BluetoothGattCallback.onCharacteristicChanged.overload('android.bluetooth.BluetoothGatt', 'android.bluetooth.BluetoothGattCharacteristic', '[B').implementation = function (gatt, characteristic, value) {
            console.log("\n[BLE] Gọi BluetoothGattCallback.onCharacteristicChanged() with byte array");
            console.log("  ├── BluetoothGatt: " + objectToDetailedString(gatt));
            console.log("  ├── Characteristic UUID: " + characteristic.getUuid());

            try {
                if (value) {
                    console.log("  ├── Giá trị dạng hex: " + bytesToHex(value));

                    // Phân tích dữ liệu nếu đủ dài
                    if (value.length >= 4) {
                        var possibleDataType = ((value[1] & 0xff) << 8) | (value[0] & 0xff);
                        console.log("  ├── Có thể là DataType: " + possibleDataType + " (0x" + possibleDataType.toString(16) + ")");
                        console.log("  ├── Tên có thể: " + getDataTypeName(possibleDataType));

                        // Nếu có thể là dữ liệu giấc ngủ
                        if (possibleDataType === 0x1282 || possibleDataType === 0x1284 ||
                            possibleDataType === 0x1286 || possibleDataType === 0x1288 ||
                            possibleDataType === 0x1289) {
                            console.log("  ├── ĐÂY LÀ DỮ LIỆU GIẤC NGỦ DẠNG RAW!");
                            console.log("  ├── Phân tích dữ liệu:");
                            console.log(analyzeSleepData(value.slice(4))); // Bỏ 4 byte header
                        }
                    }
                }

                this.onCharacteristicChanged(gatt, characteristic, value);
                console.log("  └── Kết thúc BluetoothGattCallback.onCharacteristicChanged() with byte array");
            } catch (e) {
                console.log("  ├── Lỗi: " + e);
                console.log("  ├── Stack trace: " + getStackTrace(e));
                console.log("  └── Kết thúc BluetoothGattCallback.onCharacteristicChanged() with byte array với lỗi");
                throw e;
            }
        };

        console.log("[+] Đã hook BluetoothGattCallback.onCharacteristicChanged() (cả 2 overload)");
    } catch (e) {
        console.log("[-] Lỗi khi hook BluetoothGattCallback: " + e);
    }

    // 4. Hook DataUnpack để debug quá trình giải mã dữ liệu
    try {
        var DataUnpack = Java.use("com.yucheng.ycbtsdk.DataUnpack");

        // Hook các hàm unpack quan trọng liên quan đến giấc ngủ và dữ liệu sức khỏe
        var unpackMethods = [
            "unpackGetSleepStatus",
            "unpackHealthData"
        ];

        unpackMethods.forEach(function (methodName) {
            if (DataUnpack[methodName]) {
                var originalMethod = DataUnpack[methodName];

                DataUnpack[methodName].implementation = function () {
                    console.log("\n[UNPACK] Gọi DataUnpack." + methodName + "()");

                    // Log tất cả tham số
                    for (var i = 0; i < arguments.length; i++) {
                        console.log("  ├── Tham số " + i + ": " + objectToDetailedString(arguments[i]));

                        // Nếu là mảng byte, phân tích thêm
                        if (arguments[i] && arguments[i].constructor === Array) {
                            console.log("  ├── Tham số " + i + " dạng hex: " + bytesToHex(arguments[i]));
                            console.log("  ├── Phân tích dữ liệu byte:");
                            console.log(analyzeSleepData(arguments[i]));
                        }
                    }

                    try {
                        var result = originalMethod.apply(this, arguments);
                        console.log("  ├── Kết quả trả về: " + objectToDetailedString(result));

                        // Log chi tiết kết quả nếu không null
                        if (result) {
                            console.log("  ├── CHI TIẾT KẾT QUẢ:");
                            console.log(dumpAllJavaPropertiesDetailed(result));

                            // Lấy dataType từ kết quả nếu có
                            try {
                                var dataType = result.dataType.value;
                                console.log("  ├── DataType trong kết quả: " + dataType);
                                console.log("  ├── Tên DataType: " + getDataTypeName(dataType));
                            } catch (e) {
                                console.log("  ├── Không thể lấy dataType: " + e);
                            }

                            // Dựa vào methodName để phân tích cụ thể
                            if (methodName === "unpackHealthData") {
                                // Nếu là dữ liệu sức khỏe, kiểm tra nếu có thông tin giấc ngủ
                                try {
                                    if (result.healthDataArrayList) {
                                        var items = result.healthDataArrayList.value;
                                        console.log("  ├── Số lượng health data: " + items.size());

                                        for (var i = 0; i < items.size(); i++) {
                                            var item = items.get(i);
                                            console.log("  ├── Health Data #" + i + ":");
                                            console.log(dumpAllJavaPropertiesDetailed(item));
                                        }
                                    }
                                } catch (e) {
                                    console.log("  ├── Không thể truy cập healthDataArrayList: " + e);
                                }
                            }
                            else if (methodName === "unpackGetSleepStatus") {
                                // Nếu là dữ liệu giấc ngủ, thực hiện phân tích đặc biệt
                                try {
                                    if (result.sleepDataList) {
                                        var items = result.sleepDataList.value;
                                        console.log("  ├── Số lượng sleep data: " + items.size());

                                        for (var i = 0; i < items.size(); i++) {
                                            var item = items.get(i);
                                            console.log("  ├── Sleep Data #" + i + ":");
                                            console.log(dumpAllJavaPropertiesDetailed(item));
                                        }
                                    }
                                } catch (e) {
                                    console.log("  ├── Không thể truy cập sleepDataList: " + e);
                                }
                            }
                        }

                        console.log("  └── Kết thúc DataUnpack." + methodName + "()");
                        return result;
                    } catch (e) {
                        console.log("  ├── Lỗi: " + e);
                        console.log("  ├── Stack trace: " + getStackTrace(e));
                        console.log("  └── Kết thúc DataUnpack." + methodName + "() với lỗi");
                        throw e;
                    }
                };

                console.log("[+] Đã hook DataUnpack." + methodName + "()");
            }
        });
    } catch (e) {
        console.log("[-] Lỗi khi hook DataUnpack: " + e);
    }

    // Thêm ngay sau phần hook DataUnpack, trước phần hook SleepDbUtils:
    try {
        // Thử tìm và hook các lớp phân tích giấc ngủ khác (SleepDataParser, SleepAnalyzer...)
        var parserClasses = [
            "com.yucheng.ycbtsdk.Utils.SleepDataParser",
            "com.yucheng.ycbtsdk.Utils.SleepAnalyzer",
            "com.yucheng.smarthealthpro.utils.SleepDataParser",
            "com.yucheng.smarthealthpro.utils.SleepDataConverter"
        ];

        parserClasses.forEach(function (className) {
            try {
                var clazz = Java.use(className);
                var methods = clazz.class.getDeclaredMethods();

                for (var i = 0; i < methods.length; i++) {
                    var method = methods[i];
                    var methodName = method.getName();

                    // Chỉ hook các phương thức liên quan đến giấc ngủ
                    if (methodName.toLowerCase().includes("sleep") ||
                        methodName.toLowerCase().includes("parse") ||
                        methodName.toLowerCase().includes("convert") ||
                        methodName.toLowerCase().includes("analyze")) {

                        try {
                            // Tạo implementation động cho mỗi phương thức
                            eval(`
                            if (clazz.${methodName}.overloads.length > 0) {
                                for (var j = 0; j < clazz.${methodName}.overloads.length; j++) {
                                    var overload = clazz.${methodName}.overloads[j];
                                    overload.implementation = function() {
                                        console.log("\\n[PARSER] Gọi ${className}.${methodName}()");
                                        for (var k = 0; k < arguments.length; k++) {
                                            console.log("  ├── Tham số " + k + ": " + objectToDetailedString(arguments[k]));
                                            if (arguments[k] && arguments[k].constructor === Array) {
                                                console.log("  ├── Tham số " + k + " dạng hex: " + bytesToHex(arguments[k]));
                                            }
                                        }
                                        try {
                                            var result = this.${methodName}.apply(this, arguments);
                                            console.log("  ├── Kết quả trả về: " + objectToDetailedString(result));
                                            if (result) {
                                                console.log("  ├── CHI TIẾT KẾT QUẢ:");
                                                console.log(dumpAllJavaPropertiesDetailed(result));
                                            }
                                            console.log("  └── Kết thúc ${className}.${methodName}()");
                                            return result;
                                        } catch (e) {
                                            console.log("  ├── Lỗi: " + e);
                                            console.log("  ├── Stack trace: " + getStackTrace(e));
                                            console.log("  └── Kết thúc ${className}.${methodName}() với lỗi");
                                            throw e;
                                        }
                                    };
                                }
                                console.log("[+] Đã hook ${className}.${methodName}() (tất cả overload)");
                            }
                        `);
                        } catch (e) {
                            console.log("[-] Lỗi khi hook " + className + "." + methodName + ": " + e);
                        }
                    }
                }
                console.log("[+] Đã hook các phương thức trong " + className);
            } catch (e) {
                console.log("[-] Không tìm thấy class: " + className);
            }
        });
    } catch (e) {
        console.log("[-] Lỗi khi hook các lớp parser: " + e);
    }

    // 5. Hook SleepDbUtils để debug việc lưu và truy vấn dữ liệu giấc ngủ
    try {
        var SleepDbUtils = Java.use("com.yucheng.smarthealthpro.greendao.utils.SleepDbUtils");

        // Hook hàm ghi vào DB
        SleepDbUtils.insertMsgModel.implementation = function (sleepDb) {
            console.log("\n[DB] Gọi SleepDbUtils.insertMsgModel()");

            try {
                // Log chi tiết đối tượng sleepDb
                if (sleepDb) {
                    console.log("  ├── CHI TIẾT ĐỐI TƯỢNG SLEEPDB (RAW):");
                    console.log(dumpAllJavaPropertiesDetailed(sleepDb));

                    // Log các trường quan trọng với định dạng dễ đọc
                    var sleepDbClass = Java.use("com.yucheng.smarthealthpro.greendao.bean.SleepDb");
                    var obj = Java.cast(sleepDb, sleepDbClass);

                    try {
                        var id = obj.getId ? obj.getId() : null;
                        console.log("  ├── ID: " + id);
                    } catch (e) {
                        console.log("  ├── Lỗi đọc ID: " + e);
                    }

                    try {
                        var startTime = obj.getStartTime ? obj.getStartTime() : null;
                        console.log("  ├── StartTime: " + startTime + " (" + formatTimestamp(startTime) + ")");
                    } catch (e) {
                        console.log("  ├── Lỗi đọc StartTime: " + e);
                    }

                    try {
                        var endTime = obj.getEndTime ? obj.getEndTime() : null;
                        console.log("  ├── EndTime: " + endTime + " (" + formatTimestamp(endTime) + ")");
                    } catch (e) {
                        console.log("  ├── Lỗi đọc EndTime: " + e);
                    }

                    try {
                        var deepSleepTotal = obj.getDeepSleepTotal ? obj.getDeepSleepTotal() : null;
                        console.log("  ├── DeepSleepTotal: " + deepSleepTotal + " giây (" + formatSeconds(deepSleepTotal) + ")");
                    } catch (e) {
                        console.log("  ├── Lỗi đọc DeepSleepTotal: " + e);
                    }

                    try {
                        var lightSleepTotal = obj.getLightSleepTotal ? obj.getLightSleepTotal() : null;
                        console.log("  ├── LightSleepTotal: " + lightSleepTotal + " giây (" + formatSeconds(lightSleepTotal) + ")");
                    } catch (e) {
                        console.log("  ├── Lỗi đọc LightSleepTotal: " + e);
                    }

                    try {
                        var remTotal = obj.getRemTotal ? obj.getRemTotal() : null;
                        console.log("  ├── REM Total: " + remTotal + " giây (" + formatSeconds(remTotal) + ")");
                    } catch (e) {
                        console.log("  ├── Lỗi đọc REM Total: " + e);
                    }

                    try {
                        var wakeCount = obj.getWakeCount ? obj.getWakeCount() : null;
                        console.log("  ├── WakeCount: " + wakeCount + " lần");
                    } catch (e) {
                        console.log("  ├── Lỗi đọc WakeCount: " + e);
                    }

                    try {
                        var wakeDuration = obj.getWakeDuration ? obj.getWakeDuration() : null;
                        console.log("  ├── WakeDuration: " + wakeDuration + " giây (" + formatSeconds(wakeDuration) + ")");
                    } catch (e) {
                        console.log("  ├── Lỗi đọc WakeDuration: " + e);
                    }

                    try {
                        var timeYearToDate = obj.getTimeYearToDate ? obj.getTimeYearToDate() : null;
                        console.log("  ├── TimeYearToDate: " + timeYearToDate);
                    } catch (e) {
                        console.log("  ├── Lỗi đọc TimeYearToDate: " + e);
                    }

                    try {
                        var heartRateAvg = obj.getHeartRateAvg ? obj.getHeartRateAvg() : null;
                        console.log("  ├── HeartRateAvg: " + heartRateAvg + " bpm");
                    } catch (e) {
                        console.log("  ├── Lỗi đọc HeartRateAvg: " + e);
                    }

                    try {
                        var spo2Avg = obj.getSpo2Avg ? obj.getSpo2Avg() : null;
                        console.log("  ├── SPO2Avg: " + spo2Avg + " %");
                    } catch (e) {
                        console.log("  ├── Lỗi đọc SPO2Avg: " + e);
                    }

                    // Tính tổng thời gian ngủ
                    try {
                        var totalSleepTime = 0;
                        if (deepSleepTotal) totalSleepTime += deepSleepTotal;
                        if (lightSleepTotal) totalSleepTime += lightSleepTotal;
                        if (remTotal) totalSleepTime += remTotal;
                        console.log("  ├── [TỔNG HỢP] Thời gian ngủ: " + totalSleepTime + " giây (" + formatSeconds(totalSleepTime) + ")");
                    } catch (e) {
                        console.log("  ├── Lỗi tính tổng thời gian ngủ: " + e);
                    }

                    // Nếu có trường rawData, phân tích
                    try {
                        var rawData = obj.getRawData ? obj.getRawData() : null;
                        if (rawData) {
                            console.log("  ├── RawData: " + bytesToHex(rawData));
                            console.log("  ├── Phân tích RawData:");
                            console.log(analyzeSleepData(rawData));
                        }
                    } catch (e) {
                        console.log("  ├── Không tìm thấy hoặc lỗi đọc RawData: " + e);
                    }

                    // Nếu có trường detailData, phân tích
                    try {
                        var detailData = obj.getDetailData ? obj.getDetailData() : null;
                        if (detailData) {
                            console.log("  ├── DetailData: " + bytesToHex(detailData));
                            console.log("  ├── Phân tích DetailData:");
                            console.log(analyzeSleepData(detailData));
                        }
                    } catch (e) {
                        console.log("  ├── Không tìm thấy hoặc lỗi đọc DetailData: " + e);
                    }
                }

                var result = this.insertMsgModel(sleepDb);
                console.log("  ├── Kết quả: " + result);
                console.log("  └── Kết thúc SleepDbUtils.insertMsgModel()");
                return result;
            } catch (e) {
                console.log("  ├── Lỗi: " + e);
                console.log("  ├── Stack trace: " + getStackTrace(e));
                console.log("  └── Kết thúc SleepDbUtils.insertMsgModel() với lỗi");
                throw e;
            }
        };

        // Hook hàm truy vấn từ DB
        SleepDbUtils.queryIdYearToDay.implementation = function (timeYearToDate) {
            console.log("\n[DB] Gọi SleepDbUtils.queryIdYearToDay()");
            console.log("  ├── Tham số ngày: " + timeYearToDate);

            try {
                var result = this.queryIdYearToDay(timeYearToDate);

                if (result) {
                    console.log("  ├── Số lượng kết quả: " + result.size());

                    // Log chi tiết từng kết quả
                    for (var i = 0; i < result.size(); i++) {
                        console.log("  ├── Kết quả #" + i);
                        var item = result.get(i);

                        // Log các trường quan trọng
                        if (item) {
                            try {
                                var sleepDbClass = Java.use("com.yucheng.smarthealthpro.greendao.bean.SleepDb");
                                var obj = Java.cast(item, sleepDbClass);

                                var id = obj.getId ? obj.getId() : null;
                                var startTime = obj.getStartTime ? obj.getStartTime() : null;
                                var endTime = obj.getEndTime ? obj.getEndTime() : null;
                                var deepSleepTotal = obj.getDeepSleepTotal ? obj.getDeepSleepTotal() : null;
                                var lightSleepTotal = obj.getLightSleepTotal ? obj.getLightSleepTotal() : null;
                                var remTotal = obj.getRemTotal ? obj.getRemTotal() : null;
                                var wakeCount = obj.getWakeCount ? obj.getWakeCount() : null;
                                var wakeDuration = obj.getWakeDuration ? obj.getWakeDuration() : null;
                                var heartRateAvg = obj.getHeartRateAvg ? obj.getHeartRateAvg() : null;
                                var spo2Avg = obj.getSpo2Avg ? obj.getSpo2Avg() : null;

                                console.log("    ID: " + id);
                                console.log("    Thời gian bắt đầu: " + formatTimestamp(startTime));
                                console.log("    Thời gian kết thúc: " + formatTimestamp(endTime));
                                console.log("    Giấc ngủ sâu: " + formatSeconds(deepSleepTotal));
                                console.log("    Giấc ngủ nhẹ: " + formatSeconds(lightSleepTotal));
                                console.log("    REM: " + formatSeconds(remTotal));
                                console.log("    Số lần thức giấc: " + wakeCount);
                                console.log("    Thời gian thức giấc: " + formatSeconds(wakeDuration));
                                console.log("    Nhịp tim trung bình: " + heartRateAvg + " bpm");
                                console.log("    SPO2 trung bình: " + spo2Avg + " %");

                                // Tổng thời gian ngủ
                                var totalSleepTime = 0;
                                if (deepSleepTotal) totalSleepTime += deepSleepTotal;
                                if (lightSleepTotal) totalSleepTime += lightSleepTotal;
                                if (remTotal) totalSleepTime += remTotal;
                                console.log("    Tổng thời gian ngủ: " + formatSeconds(totalSleepTime));

                                // Log chi tiết object nếu cần
                                console.log("    CHI TIẾT OBJECT:");
                                console.log(dumpAllJavaPropertiesDetailed(item));
                            } catch (e) {
                                console.log("    Lỗi đọc chi tiết: " + e);
                            }
                        }
                    }
                } else {
                    console.log("  ├── Kết quả trả về null");
                }

                console.log("  └── Kết thúc SleepDbUtils.queryIdYearToDay()");
                return result;
            } catch (e) {
                console.log("  ├── Lỗi: " + e);
                console.log("  ├── Stack trace: " + getStackTrace(e));
                console.log("  └── Kết thúc SleepDbUtils.queryIdYearToDay() với lỗi");
                throw e;
            }
        };

        console.log("[+] Đã hook SleepDbUtils.insertMsgModel() và SleepDbUtils.queryIdYearToDay()");
    } catch (e) {
        console.log("[-] Lỗi khi hook SleepDbUtils: " + e);
    }

    // 6. Hook SleepResponse hoặc các bean khác liên quan đến giấc ngủ
    try {
        var classes = [
            "com.yucheng.ycbtsdk.response.SleepResponse",
            "com.yucheng.ycbtsdk.bean.SleepDataBean",
            "com.yucheng.smarthealthpro.greendao.bean.SleepDb"
        ];

        classes.forEach(function (className) {
            try {
                var clazz = Java.use(className);

                // Hook constructor
                var ctors = clazz.class.getDeclaredConstructors();
                for (var i = 0; i < ctors.length; i++) {
                    var ctor = ctors[i];
                    var paramTypes = ctor.getParameterTypes();
                    var paramSigs = [];

                    for (var j = 0; j < paramTypes.length; j++) {
                        paramSigs.push(paramTypes[j].getName());
                    }

                    try {
                        if (paramSigs.length > 0) {
                            var overloadSig = "overload('" + paramSigs.join("', '") + "')";
                            eval("clazz.$init." + overloadSig + ".implementation = function() {\
                                    console.log('\\n[BEAN] Tạo mới " + className + "');\
                                    for (var k = 0; k < arguments.length; k++) {\
                                        console.log('  ├── Tham số ' + k + ': ' + objectToDetailedString(arguments[k]));\
                                    }\
                                    var result = this.$init.apply(this, arguments);\
                                    console.log('  ├── Đối tượng sau khi tạo:');\
                                    console.log(dumpAllJavaPropertiesDetailed(this));\
                                    console.log('  └── Kết thúc tạo " + className + "');\
                                    return result;\
                                }");
                        } else {
                            clazz.$init.implementation = function () {
                                console.log("\n[BEAN] Tạo mới " + className);
                                var result = this.$init();
                                console.log("  ├── Đối tượng sau khi tạo:");
                                console.log(dumpAllJavaPropertiesDetailed(this));
                                console.log("  └── Kết thúc tạo " + className);
                                return result;
                            };
                        }

                        console.log("[+] Đã hook constructor của " + className);
                    } catch (e) {
                        console.log("[-] Lỗi khi hook constructor của " + className + ": " + e);
                    }
                }
            } catch (e) {
                console.log("[-] Không tìm thấy class: " + className);
            }
        });
    } catch (e) {
        console.log("[-] Lỗi khi hook SleepResponse beans: " + e);
    }

    // Thêm sau phần hook các bean:
    try {
        // Hook vào các phương thức callback nhận dữ liệu từ thiết bị
        var callbackClasses = [
            "com.yucheng.ycbtsdk.response.BleDataResponse",
            "com.yucheng.ycbtsdk.response.SleepDataCallback"
        ];

        callbackClasses.forEach(function (className) {
            try {
                var clazz = Java.use(className);
                var methods = clazz.class.getDeclaredMethods();

                for (var i = 0; i < methods.length; i++) {
                    var method = methods[i];
                    var methodName = method.getName();

                    // Chỉ hook các phương thức liên quan đến nhận dữ liệu
                    if (methodName.toLowerCase().includes("success") ||
                        methodName.toLowerCase().includes("complete") ||
                        methodName.toLowerCase().includes("receive") ||
                        methodName.toLowerCase().includes("data")) {

                        try {
                            // Nếu phương thức có nhiều overload
                            if (clazz[methodName] && clazz[methodName].overloads && clazz[methodName].overloads.length > 0) {
                                for (var j = 0; j < clazz[methodName].overloads.length; j++) {
                                    eval(`
                                    clazz.${methodName}.overloads[j].implementation = function() {
                                        console.log("\\n[CALLBACK] Gọi ${className}.${methodName}()");
                                        for (var k = 0; k < arguments.length; k++) {
                                            console.log("  ├── Tham số " + k + ": " + objectToDetailedString(arguments[k]));
                                            if (arguments[k] && arguments[k].constructor === Array) {
                                                console.log("  ├── Tham số " + k + " dạng hex: " + bytesToHex(arguments[k]));
                                            } else if (arguments[k] && typeof arguments[k].getClass === 'function') {
                                                console.log("  ├── CHI TIẾT ĐỐI TƯỢNG:");
                                                console.log(dumpAllJavaPropertiesDetailed(arguments[k]));
                                            }
                                        }
                                        var result = this.${methodName}.apply(this, arguments);
                                        console.log("  └── Kết thúc ${className}.${methodName}()");
                                        return result;
                                    };
                                `);
                                }
                                console.log("[+] Đã hook " + className + "." + methodName + " (overloads)");
                            }
                            // Nếu chỉ có một implementation
                            else if (clazz[methodName]) {
                                eval(`
                                clazz.${methodName}.implementation = function() {
                                    console.log("\\n[CALLBACK] Gọi ${className}.${methodName}()");
                                    for (var k = 0; k < arguments.length; k++) {
                                        console.log("  ├── Tham số " + k + ": " + objectToDetailedString(arguments[k]));
                                        if (arguments[k] && arguments[k].constructor === Array) {
                                            console.log("  ├── Tham số " + k + " dạng hex: " + bytesToHex(arguments[k]));
                                        } else if (arguments[k] && typeof arguments[k].getClass === 'function') {
                                            console.log("  ├── CHI TIẾT ĐỐI TƯỢNG:");
                                            console.log(dumpAllJavaPropertiesDetailed(arguments[k]));
                                        }
                                    }
                                    var result = this.${methodName}.apply(this, arguments);
                                    console.log("  └── Kết thúc ${className}.${methodName}()");
                                    return result;
                                };
                            `);
                                console.log("[+] Đã hook " + className + "." + methodName);
                            }
                        } catch (e) {
                            console.log("[-] Lỗi khi hook " + className + "." + methodName + ": " + e);
                        }
                    }
                }
            } catch (e) {
                console.log("[-] Không tìm thấy class: " + className);
            }
        });
    } catch (e) {
        console.log("[-] Lỗi khi hook các lớp callback: " + e);
    }

    console.log("[+] Script đã khởi tạo hoàn tất - Đang theo dõi các chức năng liên quan đến giấc ngủ...");
}
);