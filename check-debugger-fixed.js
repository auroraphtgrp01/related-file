Java.perform(function () {
    console.log("[+] Script bắt đầu chạy - Debug các chức năng liên quan đến giấc ngủ");

    // ======================= CÁC HÀM TIỆN ÍCH =======================

    // Chuyển đổi byte array thành chuỗi hex để dễ đọc
    function bytesToHex(bytes) {
        if (!bytes || bytes.length === 0) return "[]";
        let result = "[";
        for (let i = 0; i < bytes.length; i++) {
            if (i > 0) result += " ";
            let hex = (bytes[i] & 0xFF).toString(16);
            result += (hex.length === 1 ? "0" + hex : hex);
        }
        return result + "]";
    }

    // Chuyển đổi timestamp thành chuỗi thời gian có thể đọc được
    function timestampToDate(timestamp) {
        try {
            if (!timestamp) return "<null>";
            return new Date(timestamp).toLocaleString();
        } catch (e) {
            return "<lỗi chuyển đổi: " + e + ">";
        }
    }

    // In đối tượng theo định dạng đẹp và an toàn
    function prettyPrintObject(obj) {
        try {
            if (obj === null || obj === undefined) return "<null>";

            // Nếu là đối tượng Java
            if (obj && obj.getClass) {
                try {
                    return obj.toString();
                } catch (e) {
                    // Không thể gọi toString, thử phương pháp khác
                }
            }

            return JSON.stringify(obj, function (key, value) {
                // Loại bỏ các thông tin nhạy cảm
                if (key === 'auth' || key === 'token') return '[REDACTED]';

                // Rút gọn các mảng lớn
                if (value instanceof Array && value.length > 10)
                    return '[Array với ' + value.length + ' phần tử]';

                // Rút gọn các object lớn
                if (typeof value === 'object' && value !== null && Object.keys(value).length > 20)
                    return '[Object với ' + Object.keys(value).length + ' thuộc tính]';

                return value;
            }, 2);
        } catch (e) {
            return String(obj);
        }
    }

    // Lấy tất cả thuộc tính của đối tượng Java bằng reflection
    function dumpAllJavaProperties(obj) {
        if (!obj) return "<null>";

        try {
            let result = {};
            let clazz = obj.getClass();
            let methods = clazz.getMethods();

            // Tìm tất cả các getter
            for (let i = 0; i < methods.length; i++) {
                let method = methods[i];
                let methodName = method.getName();

                // Chỉ xử lý các getter (bắt đầu bằng "get" hoặc "is" và không có tham số)
                if ((methodName.startsWith("get") || methodName.startsWith("is")) &&
                    method.getParameterTypes().length === 0 &&
                    methodName !== "getClass") {

                    try {
                        let propertyName;
                        if (methodName.startsWith("get")) {
                            propertyName = methodName.substring(3, 4).toLowerCase() + methodName.substring(4);
                        } else { // starts with "is"
                            propertyName = methodName.substring(2, 3).toLowerCase() + methodName.substring(3);
                        }

                        let value = obj[methodName]();

                        // Xử lý giá trị đặc biệt
                        if (value !== null && typeof value === 'object') {
                            if (value.getClass && value.getClass().isArray && value.getClass().isArray()) {
                                result[propertyName] = "[Array với " + value.length + " phần tử]";
                            } else if (methodName.toLowerCase().includes("time")) {
                                result[propertyName] = value + " (" + timestampToDate(value) + ")";
                            } else {
                                result[propertyName] = String(value);
                            }
                        } else {
                            result[propertyName] = value;
                        }
                    } catch (e) {
                        result[propertyName] = "<lỗi: " + e.message + ">";
                    }
                }
            }

            return JSON.stringify(result, null, 2);
        } catch (e) {
            return "<lỗi khi dump thuộc tính: " + e + ">";
        }
    }

    // Lấy và hiển thị stack trace
    function getStackTrace(e) {
        if (!e) return "<không có exception>";

        try {
            // Lấy stack trace từ Java exception
            if (e.getStackTrace) {
                let stackArray = e.getStackTrace();
                let stackTrace = "";
                for (let i = 0; i < Math.min(stackArray.length, 10); i++) {
                    stackTrace += "\n    at " + stackArray[i].toString();
                }
                if (stackArray.length > 10) {
                    stackTrace += "\n    ... (còn " + (stackArray.length - 10) + " dòng khác)";
                }
                return e + stackTrace;
            }

            // Lấy stack trace từ JS exception
            if (e.stack) {
                return e.toString() + "\n" + e.stack.split("\n").slice(0, 10).join("\n");
            }

            return e.toString();
        } catch (err) {
            return "<lỗi khi lấy stack trace: " + err + ">";
        }
    }

    // Kiểm tra dữ liệu bất thường
    function checkAbnormalSleepData(sleepType, sleepLen, timestamp) {
        let warnings = [];

        // Kiểm tra sleepType
        if (sleepType !== 241 && sleepType !== 242 && sleepType !== 243 && sleepType !== 244 && sleepType !== -1) {
            warnings.push("SleepType bất thường: " + sleepType + " (không thuộc 241-244 hoặc -1)");
        }

        // Kiểm tra sleepLen
        if (sleepLen <= 0) {
            warnings.push("SleepLen bất thường: " + sleepLen + " (nhỏ hơn hoặc bằng 0)");
        } else if (sleepLen > 43200) { // > 12 giờ
            warnings.push("SleepLen bất thường: " + sleepLen + " (lớn hơn 12 giờ)");
        }

        // Kiểm tra timestamp
        if (timestamp) {
            const now = Date.now();
            const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
            const oneYearLater = now + 365 * 24 * 60 * 60 * 1000;

            if (timestamp < oneYearAgo || timestamp > oneYearLater) {
                warnings.push("Timestamp bất thường: " + timestamp + " (" + timestampToDate(timestamp) + ")");
            }
        }

        return warnings;
    }

    // Trích xuất và hiển thị chi tiết về SleepDataBean
    function dumpSleepDataBean(bean) {
        if (!bean) return "<null>";

        try {
            // Sử dụng reflection để lấy tất cả thuộc tính
            let allProperties = dumpAllJavaProperties(bean);
            let result = JSON.parse(allProperties);

            // Thêm các thuộc tính đã biết (để đảm bảo tương thích ngược)
            if (!result.hasOwnProperty("deepSleepCount")) result.deepSleepCount = bean.getDeepSleepCount();
            if (!result.hasOwnProperty("lightSleepCount")) result.lightSleepCount = bean.getLightSleepCount();
            if (!result.hasOwnProperty("startTime")) result.startTime = bean.getStartTime() + " (" + timestampToDate(bean.getStartTime()) + ")";
            if (!result.hasOwnProperty("endTime")) result.endTime = bean.getEndTime() + " (" + timestampToDate(bean.getEndTime()) + ")";
            if (!result.hasOwnProperty("deepSleepTotal")) result.deepSleepTotal = bean.getDeepSleepTotal() + " giây";
            if (!result.hasOwnProperty("lightSleepTotal")) result.lightSleepTotal = bean.getLightSleepTotal() + " giây";
            if (!result.hasOwnProperty("rapidEyeMovementTotal")) result.rapidEyeMovementTotal = bean.rapidEyeMovementTotal + " giây";
            if (!result.hasOwnProperty("wakeCount")) result.wakeCount = bean.wakeCount + " lần";
            if (!result.hasOwnProperty("wakeDuration")) result.wakeDuration = bean.wakeDuration + " giây";
            if (!result.hasOwnProperty("isUpload")) result.isUpload = bean.isUpload();

            // Kiểm tra dữ liệu bất thường
            let warnings = [];
            if (bean.getStartTime() && bean.getEndTime()) {
                if (bean.getStartTime() > bean.getEndTime()) {
                    warnings.push("Thời gian bắt đầu sau thời gian kết thúc!");
                }

                let duration = (bean.getEndTime() - bean.getStartTime()) / 1000; // Chuyển sang giây
                let reportedDuration = bean.getDeepSleepTotal() + bean.getLightSleepTotal() + bean.rapidEyeMovementTotal;

                if (Math.abs(duration - reportedDuration) > 600) { // Chênh lệch > 10 phút
                    warnings.push("Thời lượng tính từ start/end (" + duration + "s) khác xa với tổng thời lượng báo cáo (" + reportedDuration + "s)");
                }
            }

            if (warnings.length > 0) {
                result.warnings = warnings;
            }

            // Chi tiết các pha giấc ngủ
            try {
                let sleepData = bean.getSleepData();
                let phases = [];

                if (sleepData && sleepData.size() > 0) {
                    for (let i = 0; i < sleepData.size(); i++) {
                        let phase = sleepData.get(i);
                        let phaseData = JSON.parse(dumpAllJavaProperties(phase));

                        // Thêm các thuộc tính đã biết (để đảm bảo tương thích ngược)
                        if (!phaseData.hasOwnProperty("sleepStartTime")) {
                            phaseData.sleepStartTime = phase.getSleepStartTime();
                            phaseData.sleepStartTimeReadable = timestampToDate(phase.getSleepStartTime());
                        }
                        if (!phaseData.hasOwnProperty("sleepLen")) {
                            phaseData.sleepLen = phase.getSleepLen() + " giây";
                        }
                        if (!phaseData.hasOwnProperty("sleepType")) {
                            phaseData.sleepType = phase.getSleepType();
                            phaseData.sleepTypeDesc = getSleepTypeDescription(phase.getSleepType());
                        }

                        // Kiểm tra dữ liệu bất thường
                        let phaseWarnings = checkAbnormalSleepData(phase.getSleepType(), phase.getSleepLen(), phase.getSleepStartTime());
                        if (phaseWarnings.length > 0) {
                            phaseData.warnings = phaseWarnings;
                        }

                        phases.push(phaseData);
                    }
                }

                result.phases = phases;
            } catch (e) {
                result.phases = "<lỗi khi lấy phases: " + getStackTrace(e) + ">";
            }

            return prettyPrintObject(result);
        } catch (e) {
            return "<lỗi khi dump SleepDataBean: " + getStackTrace(e) + ">";
        }
    }

    // Chuyển đổi mã loại giấc ngủ thành mô tả dễ hiểu
    function getSleepTypeDescription(type) {
        try {
            if (type === 241) return "Giấc ngủ sâu (Deep Sleep)";
            if (type === 242) return "Giấc ngủ nhẹ (Light Sleep)";
            if (type === 243) return "REM";
            if (type === 244) return "Thức giấc (Awake)";
            if (type === -1) return "Không xác định";
            return "Không rõ (" + type + ")";
        } catch (e) {
            return "Lỗi: " + e;
        }
    }
    // Lấy thông tin user/device
    function getUserDeviceInfo() {
        try {
            let info = {};

            // Thử lấy thông tin user
            try {
                let UserManager = Java.use("com.yucheng.smarthealthpro.user.UserManager");
                let userManager = UserManager.getInstance();
                if (userManager) {
                    let currentUser = userManager.getCurrentUser();
                    if (currentUser) {
                        info.userId = currentUser.getId();
                        info.userName = currentUser.getName();
                        info.userEmail = currentUser.getEmail();
                    }
                }
            } catch (e) {
                console.log("[-] Không thể lấy thông tin user: " + e);
            }

            // Thử lấy thông tin device
            try {
                let DeviceManager = Java.use("com.yucheng.smarthealthpro.device.DeviceManager");
                let deviceManager = DeviceManager.getInstance();
                if (deviceManager) {
                    let currentDevice = deviceManager.getCurrentDevice();
                    if (currentDevice) {
                        info.deviceId = currentDevice.getId();
                        info.deviceName = currentDevice.getName();
                        info.deviceMac = currentDevice.getMacAddress();
                        info.deviceType = currentDevice.getType();
                    }
                }
            } catch (e) {
                console.log("[-] Không thể lấy thông tin device: " + e);
            }

            return info;
        } catch (e) {
            console.log("[-] Lỗi khi lấy thông tin user/device: " + e);
            return {};
        }
    }
    // ======================= HOOK CÁC PHƯƠNG THỨC GỬI YÊU CẦU SLEEP =======================

    // 1. Hook YCBTClient.getSleepStatus - Phương thức gửi yêu cầu lấy dữ liệu giấc ngủ
    try {
        var YCBTClient = Java.use("com.yucheng.ycbtsdk.YCBTClient");

        YCBTClient.getSleepStatus.implementation = function (bleDataResponse) {
            console.log("\n[SLEEP] Gọi YCBTClient.getSleepStatus()");
            console.log("  ├── Tham số bleDataResponse: " + bleDataResponse);

            // Gọi hàm gốc
            var result = this.getSleepStatus(bleDataResponse);

            console.log("  └── Kết thúc YCBTClient.getSleepStatus()");
            return result;
        };

        console.log("[+] Đã hook YCBTClient.getSleepStatus()");
    } catch (e) {
        console.log("[-] Lỗi khi hook YCBTClient.getSleepStatus(): " + e);
    }

    // 2. Hook YCBTClient.appSleepWriteBack - Phương thức ghi dữ liệu giấc ngủ vào nhẫn
    try {
        YCBTClient.appSleepWriteBack.implementation = function (i2, i3, i4, i5, i6, i7, bleDataResponse) {
            console.log("\n[SLEEP] Gọi YCBTClient.appSleepWriteBack()");
            console.log("  ├── Tham số i2: " + i2);
            console.log("  ├── Tham số i3: " + i3);
            console.log("  ├── Tham số i4: " + i4);
            console.log("  ├── Tham số i5: " + i5);
            console.log("  ├── Tham số i6: " + i6);
            console.log("  ├── Tham số i7: " + i7);
            console.log("  ├── Tham số bleDataResponse: " + bleDataResponse);

            // Gọi hàm gốc
            var result = this.appSleepWriteBack(i2, i3, i4, i5, i6, i7, bleDataResponse);

            console.log("  └── Kết thúc YCBTClient.appSleepWriteBack()");
            return result;
        };

        console.log("[+] Đã hook YCBTClient.appSleepWriteBack()");
    } catch (e) {
        console.log("[-] Lỗi khi hook YCBTClient.appSleepWriteBack(): " + e);
    }

    // 3. Hook YCBTClient.settingSleepRemind - Phương thức thiết lập nhắc nhở giấc ngủ
    try {
        YCBTClient.settingSleepRemind.implementation = function (i2, i3, i4, bleDataResponse) {
            console.log("\n[SLEEP] Gọi YCBTClient.settingSleepRemind()");
            console.log("  ├── Tham số i2: " + i2);
            console.log("  ├── Tham số i3: " + i3);
            console.log("  ├── Tham số i4: " + i4);
            console.log("  ├── Tham số bleDataResponse: " + bleDataResponse);

            // Gọi hàm gốc
            var result = this.settingSleepRemind(i2, i3, i4, bleDataResponse);

            console.log("  └── Kết thúc YCBTClient.settingSleepRemind()");
            return result;
        };

        console.log("[+] Đã hook YCBTClient.settingSleepRemind()");
    } catch (e) {
        console.log("[-] Lỗi khi hook YCBTClient.settingSleepRemind(): " + e);
    }

    // ======================= HOOK TRUYỀN DỮ LIỆU QUA BLE =======================

    // 4. Hook YCBTClientImpl.sendSingleData2Device - Phương thức gửi dữ liệu BLE
    try {
        var YCBTClientImpl = Java.use("com.yucheng.ycbtsdk.core.YCBTClientImpl");

        YCBTClientImpl.sendSingleData2Device.overload('int', '[B', 'int', 'com.yucheng.ycbtsdk.response.BleDataResponse').implementation = function (dataType, data, timeout, bleDataResponse) {
            console.log("\n[BLE] Gọi YCBTClientImpl.sendSingleData2Device()");
            console.log("  ├── DataType: " + dataType + " (0x" + dataType.toString(16) + ")");
            console.log("  ├── Data: " + bytesToHex(data));
            console.log("  ├── Timeout: " + timeout);
            console.log("  ├── BleDataResponse: " + bleDataResponse);

            // Kiểm tra các constant để xác định loại dữ liệu
            try {
                var Constants = Java.use("com.yucheng.ycbtsdk.Constants$DATATYPE");

                // Xác định tên của dataType
                for (var field in Constants.class.getFields()) {
                    var fieldObj = Constants.class.getField(field);
                    if (fieldObj.getType().getName() === "int") {
                        var value = fieldObj.getInt(null);
                        if (value === dataType) {
                            console.log("  ├── Tên dataType: " + field);

                            // Kiểm tra nếu liên quan đến Sleep
                            if (field.includes("Sleep") || field.includes("SLEEP")) {
                                console.log("  ├── [QUAN TRỌNG] Đây là lệnh liên quan đến GIẤC NGỦ!");
                            }
                            break;
                        }
                    }
                }
            } catch (e) {
                console.log("  ├── Không thể xác định tên dataType: " + e);
            }

            // Gọi hàm gốc
            var result = this.sendSingleData2Device(dataType, data, timeout, bleDataResponse);

            console.log("  └── Kết thúc YCBTClientImpl.sendSingleData2Device()");
            return result;
        };

        console.log("[+] Đã hook YCBTClientImpl.sendSingleData2Device()");
    } catch (e) {
        console.log("[-] Lỗi khi hook YCBTClientImpl.sendSingleData2Device(): " + e);
    }

    // Hook các hàm BLE tầng thấp
    try {
        // Hook BluetoothGattCallback
        var BluetoothGattCallback = Java.use("android.bluetooth.BluetoothGattCallback");

        // onCharacteristicChanged
        BluetoothGattCallback.onCharacteristicChanged.implementation = function (gatt, characteristic) {
            console.log("\n[BLE-RAW] Gọi BluetoothGattCallback.onCharacteristicChanged()");
            console.log("  ├── Gatt: " + gatt);
            console.log("  ├── Characteristic UUID: " + characteristic.getUuid());

            var value = characteristic.getValue();
            console.log("  ├── Giá trị: " + bytesToHex(value));

            // Kiểm tra nếu có thể là dữ liệu giấc ngủ
            if (value && value.length > 2) {
                var header = value[0] & 0xFF;
                if (header >= 0x48 && header <= 0x58) {
                    console.log("  ├── [QUAN TRỌNG] Có thể là dữ liệu giấc ngủ RAW! Header: 0x" + header.toString(16));
                }
            }

            // Gọi hàm gốc
            var result = this.onCharacteristicChanged(gatt, characteristic);

            console.log("  └── Kết thúc BluetoothGattCallback.onCharacteristicChanged()");
            return result;
        };

        // onCharacteristicRead
        BluetoothGattCallback.onCharacteristicRead.implementation = function (gatt, characteristic, status) {
            console.log("\n[BLE-RAW] Gọi BluetoothGattCallback.onCharacteristicRead()");
            console.log("  ├── Gatt: " + gatt);
            console.log("  ├── Characteristic UUID: " + characteristic.getUuid());
            console.log("  ├── Status: " + status);

            var value = characteristic.getValue();
            console.log("  ├── Giá trị: " + bytesToHex(value));

            // Gọi hàm gốc
            var result = this.onCharacteristicRead(gatt, characteristic, status);

            console.log("  └── Kết thúc BluetoothGattCallback.onCharacteristicRead()");
            return result;
        };

        console.log("[+] Đã hook các phương thức BluetoothGattCallback");
    } catch (e) {
        console.log("[-] Lỗi khi hook BluetoothGattCallback: " + getStackTrace(e));
    }

    // Tìm và hook các BLE Manager khác
    try {
        // Tìm các class có thể là BLE Manager
        var potentialBleClasses = [
            "com.yucheng.ycbtsdk.ble.BleManager",
            "com.yucheng.ycbtsdk.ble.BluetoothLeService",
            "com.yucheng.ycbtsdk.ble.BleConnection"
        ];

        for (var i = 0; i < potentialBleClasses.length; i++) {
            try {
                var BleClass = Java.use(potentialBleClasses[i]);
                console.log("[+] Tìm thấy class BLE: " + potentialBleClasses[i]);

                // Hook tất cả các phương thức
                var methods = BleClass.class.getDeclaredMethods();
                for (var j = 0; j < methods.length; j++) {
                    var methodName = methods[j].getName();

                    // Chỉ quan tâm đến các phương thức liên quan đến BLE
                    if (methodName.toLowerCase().includes("ble") ||
                        methodName.toLowerCase().includes("gatt") ||
                        methodName.toLowerCase().includes("characteristic") ||
                        methodName.toLowerCase().includes("descriptor") ||
                        methodName.toLowerCase().includes("data") ||
                        methodName.toLowerCase().includes("sleep")) {

                        try {
                            // Sử dụng IIFE để giữ giá trị chính xác của methodName
                            (function (name, className) {
                                // Lấy tất cả các overload của phương thức
                                var overloads = BleClass[name].overloads;

                                for (var k = 0; k < overloads.length; k++) {
                                    overloads[k].implementation = function () {
                                        console.log("\n[BLE-MANAGER] Gọi " + className + "." + name + "()");

                                        // Log các tham số đầu vào
                                        for (var l = 0; l < arguments.length; l++) {
                                            if (arguments[l] instanceof Array) {
                                                console.log("  ├── Tham số " + l + ": " + bytesToHex(arguments[l]));
                                            } else {
                                                console.log("  ├── Tham số " + l + ": " + arguments[l]);
                                            }
                                        }

                                        // Gọi phương thức gốc
                                        var result;
                                        try {
                                            result = this[name].apply(this, arguments);
                                        } catch (e) {
                                            console.log("  ├── [LỖI] " + getStackTrace(e));
                                            throw e;
                                        }

                                        // Log kết quả
                                        if (result instanceof Array) {
                                            console.log("  ├── Kết quả: " + bytesToHex(result));
                                        } else {
                                            console.log("  ├── Kết quả: " + result);
                                        }

                                        console.log("  └── Kết thúc " + className + "." + name + "()");
                                        return result;
                                    };
                                }

                            })(methodName, potentialBleClasses[i]);

                            console.log("[+] Đã hook " + potentialBleClasses[i] + "." + methodName + "()");
                        } catch (e) {
                            console.log("[-] Lỗi khi hook " + potentialBleClasses[i] + "." + methodName + "(): " + e);
                        }
                    }
                }
            } catch (e) {
                console.log("[-] Không tìm thấy class: " + potentialBleClasses[i]);
            }
        }
    } catch (e) {
        console.log("[-] Lỗi khi tìm và hook các BLE Manager: " + getStackTrace(e));
    }

    // 5. Hook YCBTClientImpl.onDataReceiveFromDevice - Nhận dữ liệu BLE
    try {
        if (YCBTClientImpl.onDataReceiveFromDevice) {
            YCBTClientImpl.onDataReceiveFromDevice.implementation = function (data, response) {
                console.log("\n[BLE] Gọi YCBTClientImpl.onDataReceiveFromDevice()");
                console.log("  ├── Dữ liệu nhận được: " + bytesToHex(data));
                console.log("  ├── Response: " + response);

                // Gọi hàm gốc
                var result = this.onDataReceiveFromDevice(data, response);

                // Phân tích dữ liệu nhận được
                if (data && data.length > 2) {
                    var header = data[0] & 0xFF;
                    console.log("  ├── Header: 0x" + header.toString(16));

                    // Check nếu có vẻ là dữ liệu giấc ngủ (dựa trên các header trong BLE.md)
                    if (header >= 0x48 && header <= 0x58) {
                        console.log("  ├── [QUAN TRỌNG] Có thể là dữ liệu giấc ngủ! Header: 0x" + header.toString(16));

                        // Phân tích thêm
                        if (header === 0x48) console.log("  ├── Sleep period information");
                        if (header === 0x49) console.log("  ├── Sleep summary (1)");
                        if (header === 0x4B) console.log("  ├── Sleep phase information");
                        if (header === 0x4C) console.log("  ├── Sleep summary (2)");
                        if (header === 0x4D) console.log("  ├── Ring sleep feature information");
                        if (header === 0x4E) console.log("  ├── Sleep phase details");
                        if (header === 0x4F) console.log("  ├── Sleep summary (3)");
                        if (header === 0x55) console.log("  ├── Sleep heart rate");
                        if (header === 0x58) console.log("  ├── Sleep summary (4)");
                    }
                }

                console.log("  └── Kết thúc YCBTClientImpl.onDataReceiveFromDevice()");
                return result;
            };

            console.log("[+] Đã hook YCBTClientImpl.onDataReceiveFromDevice()");
        } else {
            console.log("[!] Không tìm thấy phương thức onDataReceiveFromDevice trong YCBTClientImpl");
        }
    } catch (e) {
        console.log("[-] Lỗi khi hook YCBTClientImpl.onDataReceiveFromDevice(): " + e);
    }

    // ======================= HOOK GIẢI MÃ DỮ LIỆU SLEEP =======================

    // 6. Hook DataUnpack để bắt các phương thức giải mã dữ liệu
    try {
        var DataUnpack = Java.use("com.yucheng.ycbtsdk.core.DataUnpack");
        var methods = DataUnpack.class.getDeclaredMethods();

        for (var i = 0; i < methods.length; i++) {
            var methodName = methods[i].getName();

            // Chỉ quan tâm đến các phương thức bắt đầu bằng "unpack"
            if (methodName.startsWith("unpack")) {
                try {
                    // Sử dụng IIFE để giữ giá trị chính xác của methodName
                    (function (name) {
                        // Lấy tất cả các overload của phương thức
                        var overloads = DataUnpack[name].overloads;

                        for (var j = 0; j < overloads.length; j++) {
                            overloads[j].implementation = function () {
                                console.log("\n[UNPACK] Gọi DataUnpack." + name + "()");

                                // Log các tham số đầu vào
                                for (var k = 0; k < arguments.length; k++) {
                                    if (arguments[k] instanceof Array) {
                                        console.log("  ├── Tham số " + k + ": " + bytesToHex(arguments[k]));
                                    } else {
                                        console.log("  ├── Tham số " + k + ": " + arguments[k]);
                                    }
                                }

                                // Gọi phương thức gốc
                                var result = this[name].apply(this, arguments);

                                // Kiểm tra xem kết quả có liên quan đến giấc ngủ không
                                if (result) {
                                    if (typeof result === 'object' && result.containsKey && result.get) {
                                        if (result.containsKey("dataType")) {
                                            var dataType = result.get("dataType");
                                            console.log("  ├── DataType trong kết quả: " + dataType);

                                            // Nếu có từ khóa "Sleep" trong tên DataType hoặc có giá trị liên quan đến giấc ngủ
                                            if (String(name).toLowerCase().includes("sleep") ||
                                                (dataType && (String(dataType).toLowerCase().includes("sleep") || dataType === 54))) {

                                                console.log("  ├── [QUAN TRỌNG] Đây là dữ liệu liên quan đến GIẤC NGỦ!");

                                                // Nếu có dữ liệu chi tiết về giấc ngủ
                                                if (result.containsKey("data")) {
                                                    var sleepData = result.get("data");
                                                    if (sleepData) {
                                                        console.log("  ├── Chi tiết dữ liệu giấc ngủ:");

                                                        try {
                                                            if (sleepData.size && sleepData.size() > 0) {
                                                                for (var l = 0; l < sleepData.size(); l++) {
                                                                    var bean = sleepData.get(l);

                                                                    console.log("  │   ├── Bean #" + l + ": " + dumpSleepDataBean(bean));
                                                                }
                                                            } else if (sleepData.getClass && sleepData.getClass().getName().includes("SleepDataBean")) {
                                                                console.log("  │   └── " + dumpSleepDataBean(sleepData));
                                                            }
                                                        } catch (e) {
                                                            console.log("  │   └── Lỗi khi dump dữ liệu giấc ngủ: " + e);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                console.log("  └── Kết thúc DataUnpack." + name + "()");
                                return result;
                            };
                        }

                    })(methodName);

                    console.log("[+] Đã hook DataUnpack." + methodName + "()");
                } catch (e) {
                    console.log("[-] Lỗi khi hook DataUnpack." + methodName + "(): " + e);
                }
            }
        }
    } catch (e) {
        console.log("[-] Lỗi khi hook các phương thức trong DataUnpack: " + e);
    }
    // ======================= HOOK LƯU TRỮ DỮ LIỆU SLEEP =======================

    // 7. Hook SleepDbUtils để theo dõi việc lưu dữ liệu giấc ngủ vào DB
    try {
        var SleepDbUtils = Java.use("com.yucheng.smarthealthpro.greendao.utils.SleepDbUtils");

        // Hook insertMsgModel (lưu một bản ghi giấc ngủ)
        SleepDbUtils.insertMsgModel.implementation = function (sleepDb) {
            console.log("\n[DB] Gọi SleepDbUtils.insertMsgModel()");

            if (sleepDb) {
                try {
                    console.log("  ├── ID: " + sleepDb.getId());
                    console.log("  ├── StartTime: " + sleepDb.getStartTime() + " (" + timestampToDate(sleepDb.getStartTime()) + ")");
                    console.log("  ├── EndTime: " + sleepDb.getEndTime() + " (" + timestampToDate(sleepDb.getEndTime()) + ")");
                    console.log("  ├── DeepSleepTotal: " + sleepDb.getDeepSleepTotal() + " giây");
                    console.log("  ├── LightSleepTotal: " + sleepDb.getLightSleepTotal() + " giây");
                    console.log("  ├── REM Total: " + sleepDb.rapidEyeMovementTotal + " giây");
                    console.log("  ├── WakeCount: " + (sleepDb.wakeCount || 0) + " lần");
                    console.log("  ├── WakeDuration: " + (sleepDb.wakeDuration || 0) + " giây");
                    console.log("  ├── TimeYearToDate: " + sleepDb.getTimeYearToDate());
                    console.log("  ├── [TỔNG HỢP] Thời gian ngủ: " + (sleepDb.getDeepSleepTotal() + sleepDb.getLightSleepTotal() + sleepDb.rapidEyeMovementTotal) + " giây");
                } catch (e) {
                    console.log("  ├── Lỗi khi đọc thông tin SleepDb: " + e);
                }
            } else {
                console.log("  ├── SleepDb là null");
            }

            // Gọi phương thức gốc
            var result = this.insertMsgModel(sleepDb);

            console.log("  └── Kết quả: " + result);
            return result;
        };

        // Hook insertMultMsgModel (lưu nhiều bản ghi giấc ngủ)
        SleepDbUtils.insertMultMsgModel.implementation = function (list) {
            console.log("\n[DB] Gọi SleepDbUtils.insertMultMsgModel()");
            console.log("  ├── Số lượng bản ghi: " + (list ? list.size() : 0));

            if (list && list.size() > 0) {
                for (var i = 0; i < Math.min(list.size(), 5); i++) { // Giới hạn hiển thị 5 bản ghi đầu tiên
                    var sleepDb = list.get(i);
                    console.log("  ├── Bản ghi #" + i);
                    console.log("  │   ├── StartTime: " + sleepDb.getStartTime() + " (" + timestampToDate(sleepDb.getStartTime()) + ")");
                    console.log("  │   ├── EndTime: " + sleepDb.getEndTime() + " (" + timestampToDate(sleepDb.getEndTime()) + ")");
                    console.log("  │   └── Tổng thời gian ngủ: " + (sleepDb.getDeepSleepTotal() + sleepDb.getLightSleepTotal() + sleepDb.rapidEyeMovementTotal) + " giây");
                }

                if (list.size() > 5) {
                    console.log("  ├── ... còn " + (list.size() - 5) + " bản ghi khác");
                }
            }

            // Gọi phương thức gốc
            var result = this.insertMultMsgModel(list);

            console.log("  └── Kết quả: " + result);
            return result;
        };

        // Hook queryIdYearToDay (truy vấn dữ liệu giấc ngủ theo ngày)
        SleepDbUtils.queryIdYearToDay.implementation = function (str) {
            console.log("\n[DB] Gọi SleepDbUtils.queryIdYearToDay()");
            console.log("  ├── Tham số ngày: " + str);

            // Gọi phương thức gốc
            var result = this.queryIdYearToDay(str);

            console.log("  ├── Số lượng kết quả: " + (result ? result.size() : 0));

            if (result && result.size() > 0) {
                for (var i = 0; i < Math.min(result.size(), 3); i++) { // Hiển thị tối đa 3 kết quả
                    var sleepDb = result.get(i);
                    console.log("  ├── Kết quả #" + i);
                    console.log("  │   ├── StartTime: " + timestampToDate(sleepDb.getStartTime()));
                    console.log("  │   ├── EndTime: " + timestampToDate(sleepDb.getEndTime()));
                    console.log("  │   ├── DeepSleep: " + sleepDb.getDeepSleepTotal() + " giây");
                    console.log("  │   ├── LightSleep: " + sleepDb.getLightSleepTotal() + " giây");
                    console.log("  │   └── REM: " + sleepDb.rapidEyeMovementTotal + " giây");
                }

                if (result.size() > 3) {
                    console.log("  ├── ... còn " + (result.size() - 3) + " kết quả khác");
                }
            }

            console.log("  └── Kết thúc SleepDbUtils.queryIdYearToDay()");
            return result;
        };

        console.log("[+] Đã hook các phương thức trong SleepDbUtils");
    } catch (e) {
        console.log("[-] Lỗi khi hook các phương thức trong SleepDbUtils: " + e);
    }
    // Tìm và hook các hàm đồng bộ/xóa dữ liệu sleep
    try {
        // Tìm các class có thể chứa hàm đồng bộ/xóa dữ liệu sleep
        var potentialSyncClasses = [
            "com.yucheng.smarthealthpro.home.presenter.SleepPresenter",
            "com.yucheng.smarthealthpro.home.model.SleepModel",
            "com.yucheng.smarthealthpro.greendao.utils.SleepDbUtils",
            "com.yucheng.smarthealthpro.sync.SleepSyncManager",
            "com.yucheng.smarthealthpro.sync.DataSyncManager"
        ];

        for (var i = 0; i < potentialSyncClasses.length; i++) {
            try {
                var SyncClass = Java.use(potentialSyncClasses[i]);
                console.log("[+] Tìm thấy class liên quan đến đồng bộ: " + potentialSyncClasses[i]);

                // Hook tất cả các phương thức
                var methods = SyncClass.class.getDeclaredMethods();
                for (var j = 0; j < methods.length; j++) {
                    var methodName = methods[j].getName();

                    // Chỉ quan tâm đến các phương thức liên quan đến đồng bộ/xóa dữ liệu sleep
                    if (methodName.toLowerCase().includes("sync") ||
                        methodName.toLowerCase().includes("clear") ||
                        methodName.toLowerCase().includes("delete") ||
                        methodName.toLowerCase().includes("remove") ||
                        methodName.toLowerCase().includes("reset") ||
                        methodName.toLowerCase().includes("batch") ||
                        (methodName.toLowerCase().includes("sleep") &&
                            (methodName.toLowerCase().includes("data") ||
                                methodName.toLowerCase().includes("get") ||
                                methodName.toLowerCase().includes("set") ||
                                methodName.toLowerCase().includes("update")))) {

                        try {
                            // Sử dụng IIFE để giữ giá trị chính xác của methodName
                            (function (name, className) {
                                // Lấy tất cả các overload của phương thức
                                var overloads = SyncClass[name].overloads;

                                for (var k = 0; k < overloads.length; k++) {
                                    overloads[k].implementation = function () {
                                        console.log("\n[SYNC] Gọi " + className + "." + name + "()");

                                        // Log các tham số đầu vào
                                        for (var l = 0; l < arguments.length; l++) {
                                            if (arguments[l] instanceof Array) {
                                                console.log("  ├── Tham số " + l + ": " + bytesToHex(arguments[l]));
                                            } else {
                                                console.log("  ├── Tham số " + l + ": " + arguments[l]);
                                            }
                                        }

                                        // Gọi phương thức gốc
                                        var result;
                                        try {
                                            result = this[name].apply(this, arguments);
                                        } catch (e) {
                                            console.log("  ├── [LỖI] " + getStackTrace(e));
                                            throw e;
                                        }

                                        // Log kết quả
                                        if (result instanceof Array) {
                                            console.log("  ├── Kết quả: " + bytesToHex(result));
                                        } else {
                                            console.log("  ├── Kết quả: " + result);
                                        }

                                        console.log("  └── Kết thúc " + className + "." + name + "()");
                                        return result;
                                    };
                                }

                            })(methodName, potentialSyncClasses[i]);

                            console.log("[+] Đã hook " + potentialSyncClasses[i] + "." + methodName + "()");
                        } catch (e) {
                            console.log("[-] Lỗi khi hook " + potentialSyncClasses[i] + "." + methodName + "(): " + e);
                        }
                    }
                }
            } catch (e) {
                console.log("[-] Không tìm thấy class: " + potentialSyncClasses[i]);
            }
        }
    } catch (e) {
        console.log("[-] Lỗi khi tìm và hook các hàm đồng bộ/xóa dữ liệu sleep: " + getStackTrace(e));
    }
    // ======================= HOOK RESPONSE BEANS =======================

    // 8. Hook SleepResponse.SleepDataBean để theo dõi việc tạo đối tượng dữ liệu giấc ngủ
    try {
        var SleepResponse = Java.use("com.yucheng.smarthealthpro.home.bean.SleepResponse");
        var SleepDataBean = Java.use("com.yucheng.smarthealthpro.home.bean.SleepResponse$SleepDataBean");

        // Hook constructor của SleepDataBean
        SleepDataBean.$init.implementation = function (i2, i3, j2, j3, i4, i5, i6, i7, i8, list, z) {
            console.log("\n[BEAN] Gọi SleepResponse.SleepDataBean constructor");
            console.log("  ├── deepSleepCount: " + i2);
            console.log("  ├── lightSleepCount: " + i3);
            console.log("  ├── startTime: " + j2 + " (" + timestampToDate(j2) + ")");
            console.log("  ├── endTime: " + j3 + " (" + timestampToDate(j3) + ")");
            console.log("  ├── deepSleepTotal: " + i4 + " giây");
            console.log("  ├── lightSleepTotal: " + i5 + " giây");
            console.log("  ├── rapidEyeMovementTotal: " + i6 + " giây");
            console.log("  ├── wakeCount: " + i7 + " lần");
            console.log("  ├── wakeDuration: " + i8 + " giây");
            console.log("  ├── sleepData size: " + (list ? list.size() : 0));
            console.log("  ├── isUpload: " + z);
            console.log("  ├── Tổng thời gian ngủ: " + (i4 + i5 + i6) + " giây");

            // Gọi constructor gốc
            var result = this.$init(i2, i3, j2, j3, i4, i5, i6, i7, i8, list, z);

            console.log("  └── Kết thúc tạo SleepDataBean");
            return result;
        };

        // Hook constructor của SleepData
        var SleepData = Java.use("com.yucheng.smarthealthpro.home.bean.SleepResponse$SleepDataBean$SleepData");

        SleepData.$init.implementation = function (j2, i2, i3) {
            console.log("\n[BEAN] Gọi SleepResponse.SleepDataBean.SleepData constructor");
            console.log("  ├── sleepStartTime: " + j2 + " (" + timestampToDate(j2) + ")");
            console.log("  ├── sleepLen: " + i2 + " giây");
            console.log("  ├── sleepType: " + i3 + " (" + getSleepTypeDescription(i3) + ")");

            // Gọi constructor gốc
            var result = this.$init(j2, i2, i3);

            console.log("  └── Kết thúc tạo SleepData");
            return result;
        };

        console.log("[+] Đã hook các constructors của SleepResponse beans");
    } catch (e) {
        console.log("[-] Lỗi khi hook các constructors của SleepResponse beans: " + e);
    }

    console.log("[+] Script đã khởi tạo hoàn tất - Đang theo dõi các chức năng liên quan đến giấc ngủ...");
});