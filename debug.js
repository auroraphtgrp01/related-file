Java.perform(function () {
  console.log("🚀 Bắt đầu quá trình tìm kiếm các lớp SDK...");

  // Tìm đúng namespace cho SDK
  var sdkNamespaces = [
      "com.yucheng.ycbtsdk",
      "com.zhuoting.ycbtsdk",
      "com.zhuoting.healthyucheng.sdk"
  ];

  var foundSDK = false;
  var DataUnpack = null;
  var DataUnpackClassName = "";
  var Constants = null;
  var ConstantsClassName = "";
  var YCBTClient = null;
  var YCBTClientClassName = "";
  var YCBTClientImpl = null;
  var YCBTClientImplClassName = "";

  // Tìm lớp DataUnpack
  for (var i = 0; i < sdkNamespaces.length && !DataUnpack; i++) {
      try {
          DataUnpackClassName = sdkNamespaces[i] + ".core.DataUnpack";
          DataUnpack = Java.use(DataUnpackClassName);
          console.log("✅ Tìm thấy lớp DataUnpack tại: " + DataUnpackClassName);
          foundSDK = true;
      } catch (e) {
          console.log("⚠️ Không tìm thấy DataUnpack tại: " + DataUnpackClassName);
      }
  }

  if (!DataUnpack) {
      console.log("❌ Không thể tìm thấy lớp DataUnpack trong bất kỳ namespace nào. Kết thúc script.");
      return;
  }

  // Tìm lớp Constants
  var baseNamespace = DataUnpackClassName.substring(0, DataUnpackClassName.lastIndexOf(".core"));
  try {
      ConstantsClassName = baseNamespace + ".Constants";
      Constants = Java.use(ConstantsClassName);
      console.log("✅ Tìm thấy lớp Constants tại: " + ConstantsClassName);
  } catch (e) {
      console.log("⚠️ Không tìm thấy Constants tại: " + ConstantsClassName);
      Constants = null;
  }

  // Tìm lớp YCBTClient
  try {
      YCBTClientClassName = baseNamespace + ".YCBTClient";
      YCBTClient = Java.use(YCBTClientClassName);
      console.log("✅ Tìm thấy lớp YCBTClient tại: " + YCBTClientClassName);
  } catch (e) {
      console.log("⚠️ Không tìm thấy YCBTClient tại: " + YCBTClientClassName);
      YCBTClient = null;
  }

  // Tìm lớp YCBTClientImpl
  try {
      YCBTClientImplClassName = 'com.yucheng.ycbtsdk.core' + ".YCBTClientImpl";
      YCBTClientImpl = Java.use(YCBTClientImplClassName);
      console.log("✅ Tìm thấy lớp YCBTClientImpl tại: " + YCBTClientImplClassName);
  } catch (e) {
      console.log("⚠️ Không tìm thấy YCBTClientImpl tại: " + YCBTClientImplClassName);
      YCBTClientImpl = null;
  }

  function byteArrayToHex(byteArray) {
      return Array.from(byteArray).map(function (b) {
          return ('0' + (b & 0xFF).toString(16)).slice(-2);
      }).join(' ');
  }

  // 🛌 Giải mã trạng thái giấc ngủ
  DataUnpack.unpackGetSleepStatus.overload("[B").implementation = function (data) {
      console.log("📥 CALL: unpackGetSleepStatus");
      console.log("  🛌 Giải mã trạng thái giấc ngủ");
      console.log("  Input: " + byteArrayToHex(data));
      var result = this.unpackGetSleepStatus(data);
      console.log("  Result: " + JSON.stringify(result));
      return result;
  };

  // 📊 Giải mã dữ liệu sức khoẻ tổng hợp (nhịp tim, SpO2, huyết áp, giấc ngủ...)
  DataUnpack.unpackHealthData.overload("[B", "int").implementation = function (data, type) {
      console.log("📥 CALL: unpackHealthData");
      console.log("  📊 Giải mã dữ liệu sức khoẻ, type=" + type + (type === 4 ? " (SLEEP DATA)" : ""));
      console.log("  Input: " + byteArrayToHex(data));
      var result = this.unpackHealthData(data, type);
      console.log("  Result: " + JSON.stringify(result));

      // Nếu là dữ liệu giấc ngủ, phân tích chi tiết
      if (type === 4) {
          try {
              // Phân tích timestamp
              if (data.length >= 14) {
                  var timeStart = parseTimestampFromBytes(data, 2);
                  var timeEnd = parseTimestampFromBytes(data, 8);
                  console.log("  🕒 Thời gian bắt đầu: " + timeStart.toString());
                  console.log("  🕒 Thời gian kết thúc: " + timeEnd.toString());

                  // Phân tích dữ liệu giấc ngủ
                  if (data.length >= 24) {
                      var deepSleepCount = ((data[14] & 255) | ((data[15] & 255) << 8));
                      var lightSleepCount = ((data[16] & 255) | ((data[17] & 255) << 8));
                      var deepSleepTotal = ((data[18] & 255) | ((data[19] & 255) << 8));
                      var lightSleepTotal = ((data[20] & 255) | ((data[21] & 255) << 8));
                      var remTotal = ((data[22] & 255) | ((data[23] & 255) << 8));

                      console.log("  😴 Số giai đoạn ngủ sâu: " + deepSleepCount);
                      console.log("  🛏️ Số giai đoạn ngủ nhẹ: " + lightSleepCount);
                      console.log("  ⏱️ Tổng thời gian ngủ sâu: " + formatDuration(deepSleepTotal));
                      console.log("  ⏱️ Tổng thời gian ngủ nhẹ: " + formatDuration(lightSleepTotal));
                      console.log("  ⏱️ Tổng thời gian REM: " + formatDuration(remTotal));
                  }
              }
          } catch (e) {
              console.log("  ❌ Lỗi khi phân tích chi tiết dữ liệu giấc ngủ: " + e);
          }
      }
      return result;
  };

  // 🧾 Thông tin tóm tắt (ngủ lúc mấy giờ, dậy lúc mấy giờ...)
  try {
      if (DataUnpack.unpackCollectSummaryInfo) {
          DataUnpack.unpackCollectSummaryInfo.overload("[B").implementation = function (data) {
              console.log("📥 CALL: unpackCollectSummaryInfo");
              console.log("  🧾 Thông tin tóm tắt (ngủ lúc mấy giờ, dậy lúc mấy giờ...)");
              console.log("  Input: " + byteArrayToHex(data));
              var result = this.unpackCollectSummaryInfo(data);
              console.log("  Result: " + JSON.stringify(result));
              return result;
          };
      }
  } catch (e) {
      console.log("❌ Lỗi khi hook unpackCollectSummaryInfo: " + e);
  }

  // 🛌 Giải mã dữ liệu giấc ngủ thời gian thực (gói tin 06 00)
  try {
      if (DataUnpack.unpackSleepDataRealTime) {
          DataUnpack.unpackSleepDataRealTime.overload("[B").implementation = function (data) {
              console.log("📥 CALL: unpackSleepDataRealTime");
              console.log("  🛌 Giải mã dữ liệu giấc ngủ thời gian thực (gói tin 06 00)");
              console.log("  Input: " + byteArrayToHex(data));
              var result = this.unpackSleepDataRealTime(data);
              console.log("  Result: " + JSON.stringify(result));

              // Phân tích chi tiết gói tin 06 00
              if (data.length >= 12) {
                  var parameter = ((data[4] & 255) | ((data[5] & 255) << 8));
                  var sleepDuration = ((data[6] & 255) | ((data[7] & 255) << 8));
                  var cycleCount = ((data[8] & 255) | ((data[9] & 255) << 8));
                  var qualityIndex = ((data[10] & 255) | ((data[11] & 255) << 8));

                  console.log("  📊 SpO2/Chất lượng: " + parameter);
                  console.log("  ❤️ Nhịp tim khi ngủ: " + sleepDuration + " bpm");
                  console.log("  🔄 Số chu kỳ giấc ngủ: " + cycleCount);
                  console.log("  📈 Chỉ số chất lượng: " + qualityIndex);
              }
              return result;
          };
          console.log("✅ Đã hook thành công method unpackSleepDataRealTime");
      }
  } catch (error) {
      console.log("❌ Lỗi khi hook unpackSleepDataRealTime: " + error);
  }

  // 🛌 Giải mã chi tiết từng đoạn giấc ngủ
  try {
      var methodNames = [
          "unpackSleepDetailData",
          "unpackSleepDetail",
          "unpackSleepStagesData"
      ];

      methodNames.forEach(function (methodName) {
          if (DataUnpack[methodName]) {
              DataUnpack[methodName].overload("[B").implementation = function (data) {
                  console.log("📥 CALL: " + methodName);
                  console.log("  🛌 Giải mã chi tiết từng đoạn giấc ngủ");
                  console.log("  Input: " + byteArrayToHex(data));
                  var result = this[methodName](data);
                  console.log("  Result: " + JSON.stringify(result));
                  return result;
              };
              console.log("✅ Đã hook thành công method " + methodName);
          }
      });
  } catch (error) {
      console.log("❌ Lỗi khi hook các phương thức chi tiết giấc ngủ: " + error);
  }

  // Hook YCBTClient methods if available
  if (YCBTClient) {
      // Theo dõi YCBTClient.getSleepStatus
      if (YCBTClient.getSleepStatus) {
          YCBTClient.getSleepStatus.implementation = function (response) {
              console.log("🛌 YCBTClient.getSleepStatus được gọi - Bắt đầu lấy dữ liệu giấc ngủ");
              return this.getSleepStatus(response);
          };
          console.log("✅ Đã hook thành công YCBTClient.getSleepStatus");
      }

      // Theo dõi healthHistoryData cho giấc ngủ
      if (YCBTClient.healthHistoryData) {
          YCBTClient.healthHistoryData.implementation = function (type, response) {
              console.log("📊 YCBTClient.healthHistoryData được gọi với type=" + type);
              if (type == 4) {
                  console.log("🛌 Đang lấy dữ liệu lịch sử giấc ngủ");
              }
              return this.healthHistoryData(type, response);
          };
          console.log("✅ Đã hook thành công YCBTClient.healthHistoryData");
      }
  }

  // Hook SaveDBDataUtil (tìm cả ở hai namespace)
  var SaveDBDataUtil = null;
  var dbUtilNamespaces = [
      'com.yucheng.smarthealthpro.home' + ".util.SaveDBDataUtil",
      'com.yucheng.smarthealthpro.home' + ".util.SaveDBDataUtil"
  ];

  for (var i = 0; i < dbUtilNamespaces.length && !SaveDBDataUtil; i++) {
      try {
          SaveDBDataUtil = Java.use(dbUtilNamespaces[i]);
          console.log("✅ Tìm thấy lớp SaveDBDataUtil tại: " + dbUtilNamespaces[i]);

          if (SaveDBDataUtil.savaSleepData) {
              SaveDBDataUtil.savaSleepData.implementation = function () {
                  console.log("💾 SaveDBDataUtil.savaSleepData - Lưu dữ liệu giấc ngủ vào cơ sở dữ liệu");
                  console.log("📊 Dữ liệu đầu vào: " + JSON.stringify(arguments[1]));
                  var result = this.savaSleepData.apply(this, arguments);
                  console.log("💾 Kết quả lưu: " + (result ? "Thành công (có " + result.size() + " bản ghi)" : "Thất bại"));
                  return result;
              };
              console.log("✅ Đã hook thành công SaveDBDataUtil.savaSleepData");
          }
      } catch (e) {
          console.log("⚠️ Không thể hook SaveDBDataUtil tại: " + dbUtilNamespaces[i]);
      }
  }

  // Theo dõi các lớp model chính
  try {
      var modelNamespaces = [
          "com.yucheng.smarthealthpro",
          "com.zhuoting.healthyucheng"
      ];

      var foundSleepResponse = false;

      for (var i = 0; i < modelNamespaces.length && !foundSleepResponse; i++) {
          var namespacePaths = [
              modelNamespaces[i] + ".home.bean.SleepResponse",
              modelNamespaces[i] + ".bean.SleepResponse",
              modelNamespaces[i] + ".model.SleepResponse"
          ];

          for (var j = 0; j < namespacePaths.length && !foundSleepResponse; j++) {
              try {
                  var SleepResponse = Java.use('com.yucheng.smarthealthpro.home.bean.SleepResponse');
                  console.log("✅ Tìm thấy lớp SleepResponse tại: " + namespacePaths[j]);
                  foundSleepResponse = true;

                  // Hook các phương thức của SleepResponse
                  var methodNames = ["setCode", "setData", "getCode", "getData"];
                  methodNames.forEach(function (methodName) {
                      if (SleepResponse[methodName]) {
                          SleepResponse[methodName].implementation = function () {
                              var result = this[methodName].apply(this, arguments);
                              console.log("📝 SleepResponse." + methodName + "() được gọi");
                              if (arguments.length > 0) {
                                  console.log("  Tham số: " + JSON.stringify(arguments[0]));
                              }
                              return result;
                          };
                      }
                  });

                  // Tìm SleepDataBean nếu có
                  try {
                      var SleepDataBean = SleepResponse.SleepDataBean;
                      if (SleepDataBean) {
                          console.log("✅ Tìm thấy lớp SleepDataBean trong SleepResponse");
                          // Hook setter methods
                          var beanMethods = [
                              "setStartTime", "setEndTime", "setDeepSleepTotal", "setLightSleepTotal",
                              "setRapidEyeMovementTotal", "setDeepSleepCount", "setLightSleepCount",
                              "setWakeCount", "setWakeDuration", "setSleepData"
                          ];

                          beanMethods.forEach(function (methodName) {
                              if (SleepDataBean[methodName]) {
                                  SleepDataBean[methodName].implementation = function (value) {
                                      console.log("📝 SleepDataBean." + methodName + "(" + value + ") được gọi");
                                      return this[methodName](value);
                                  };
                              }
                          });
                      }
                  } catch (e) {
                      console.log("⚠️ Không tìm thấy SleepDataBean trong SleepResponse: " + e);
                  }
              } catch (e) {
                  console.log("⚠️ Không tìm thấy SleepResponse tại: " + namespacePaths[j]);
              }
          }
      }
  } catch (e) {
      console.log("❌ Lỗi khi tìm kiếm các lớp model: " + e);
  }

  // Hook BluetoothGattCallback để theo dõi tất cả các gói tin Bluetooth
  try {
      var BluetoothGattCallback = Java.use("android.bluetooth.BluetoothGattCallback");

      // Theo dõi khi nhận dữ liệu từ thiết bị
      BluetoothGattCallback.onCharacteristicChanged.overload('android.bluetooth.BluetoothGatt', 'android.bluetooth.BluetoothGattCharacteristic').implementation = function (gatt, characteristic) {
          try {
              var deviceName = gatt.getDevice().getName();
              var uuid = characteristic.getUuid().toString();
              var value = characteristic.getValue();

              if (value && value.length > 0) {
                  var dataHex = byteArrayToHex(value);

                  if (value[0] === 5) { // Lệnh liên quan đến giấc ngủ
                      console.log("📥 Nhận dữ liệu giấc ngủ từ " + deviceName);
                      console.log("🆔 UUID: " + uuid);
                      console.log("📊 Dữ liệu: " + dataHex);
                      console.log("📋 Loại: " + analyzeSleepCommand(value));
                  } else if (value[0] === 6) { // Dữ liệu giấc ngủ thời gian thực
                      console.log("📥 Nhận dữ liệu giấc ngủ thời gian thực từ " + deviceName);
                      console.log("🆔 UUID: " + uuid);
                      console.log("📊 Dữ liệu: " + dataHex);

                      // Phân tích dữ liệu giấc ngủ thời gian thực
                      if (value.length >= 12) {
                          var parameter = ((value[4] & 255) | ((value[5] & 255) << 8));
                          var heartRate = ((value[6] & 255) | ((value[7] & 255) << 8));
                          var cycleCount = ((value[8] & 255) | ((value[9] & 255) << 8));
                          var qualityIndex = ((value[10] & 255) | ((value[11] & 255) << 8));

                          console.log("📊 SpO2/Chất lượng: " + parameter);
                          console.log("❤️ Nhịp tim khi ngủ: " + heartRate + " bpm");
                          console.log("🔄 Số chu kỳ giấc ngủ: " + cycleCount);
                          console.log("📈 Chỉ số chất lượng: " + qualityIndex);
                      }
                  }
              }
          } catch (err) {
              console.log("❌ Lỗi khi xử lý onCharacteristicChanged: " + err);
          }

          return this.onCharacteristicChanged(gatt, characteristic);
      };
      console.log("✅ Đã hook thành công BluetoothGattCallback.onCharacteristicChanged");

      // Theo dõi khi gửi yêu cầu đến thiết bị
      BluetoothGattCallback.onCharacteristicWrite.overload('android.bluetooth.BluetoothGatt', 'android.bluetooth.BluetoothGattCharacteristic', 'int').implementation = function (gatt, characteristic, status) {
          try {
              var deviceName = gatt.getDevice().getName();
              var uuid = characteristic.getUuid().toString();
              var value = characteristic.getValue();

              if (value && value.length > 0 && value[0] === 5) { // Lệnh liên quan đến giấc ngủ
                  console.log("📤 Gửi lệnh giấc ngủ đến " + deviceName);
                  console.log("🆔 UUID: " + uuid);
                  console.log("📊 Dữ liệu: " + byteArrayToHex(value));
                  console.log("📋 Loại: " + analyzeSleepCommand(value));
              }
          } catch (err) {
              console.log("❌ Lỗi khi xử lý onCharacteristicWrite: " + err);
          }

          return this.onCharacteristicWrite(gatt, characteristic, status);
      };
      console.log("✅ Đã hook thành công BluetoothGattCallback.onCharacteristicWrite");

  } catch (e) {
      console.log("❌ Lỗi khi hook BluetoothGattCallback: " + e);
  }

  // Các hàm tiện ích

  // Phân tích ý nghĩa của lệnh giấc ngủ
  function analyzeSleepCommand(bytes) {
      if (!bytes || bytes.length < 2) return "Lệnh không xác định";

      const cmd1 = bytes[0];
      const cmd2 = bytes[1];

      if (cmd1 === 5) {
          switch (cmd2) {
              case 0x02:
                  return "Lệnh lấy trạng thái giấc ngủ";
              case 0x04:
                  return "Lệnh lấy dữ liệu giấc ngủ gần đây";
              case 0x06:
                  return "Lệnh lấy thông tin thống kê giấc ngủ";
              case 0x08:
                  return "Lệnh lấy chi tiết các giai đoạn giấc ngủ";
              case 0x09:
                  return "Lệnh lấy thông tin giấc ngủ chi tiết";
              case 0x11:
                  return "Dữ liệu giấc ngủ cơ bản";
              case 0x13:
                  return "Dữ liệu giấc ngủ chi tiết theo giờ";
              case 0x15:
                  return "Dữ liệu tổng hợp giấc ngủ";
              case 0x17:
                  return "Dữ liệu giấc ngủ lịch sử";
              case 0x18:
                  return "Dữ liệu chi tiết giấc ngủ lịch sử";
              case 0x80:
                  return "Xóa dữ liệu giấc ngủ";
              default:
                  return `Lệnh giấc ngủ khác: 0x${cmd1.toString(16)} 0x${cmd2.toString(16)}`;
          }
      } else if (cmd1 === 6 && cmd2 === 0) {
          return "Dữ liệu giấc ngủ thời gian thực";
      }

      return "Không phải lệnh giấc ngủ";
  }

  // Chuyển đổi timestamp từ mảng byte
  function parseTimestampFromBytes(bytes, offset) {
      if (!bytes || bytes.length < offset + 6) return null;

      try {
          // Phân tích các phần của timestamp (format BCD)
          var year = 2000 + bcdToDecimal(bytes[offset]);
          var month = bcdToDecimal(bytes[offset + 1]);
          var day = bcdToDecimal(bytes[offset + 2]);
          var hour = bcdToDecimal(bytes[offset + 3]);
          var minute = bcdToDecimal(bytes[offset + 4]);
          var second = bcdToDecimal(bytes[offset + 5]);

          // Tạo đối tượng Date
          return new Date(year, month - 1, day, hour, minute, second);
      } catch (e) {
          console.log("❌ Lỗi khi phân tích timestamp: " + e);
          return null;
      }
  }

  // Chuyển đổi BCD (Binary-Coded Decimal) sang decimal
  function bcdToDecimal(bcd) {
      return ((bcd >> 4) & 0x0F) * 10 + (bcd & 0x0F);
  }

  // Định dạng thời lượng
  function formatDuration(seconds) {
      var hours = Math.floor(seconds / 3600);
      var minutes = Math.floor((seconds % 3600) / 60);
      return hours + "h" + minutes + "p";
  }

  console.log("🚀 Hoàn tất thiết lập hook giám sát dữ liệu giấc ngủ");

  // Logs thêm các class và field hiện có liên quan đến giấc ngủ
  try {
      console.log("🔍 Bắt đầu tìm kiếm các lớp liên quan đến giấc ngủ...");

      var sleepRelatedClasses = [];
      Java.enumerateLoadedClasses({
          onMatch: function (className) {
              if (className.toLowerCase().indexOf("sleep") !== -1) {
                  sleepRelatedClasses.push(className);
                  console.log("🔎 Tìm thấy lớp: " + className);
              }
          },
          onComplete: function () {
              console.log("✅ Tìm thấy " + sleepRelatedClasses.length + " lớp liên quan đến giấc ngủ");

              // Duyệt qua các lớp tìm được và thử hook các phương thức
              for (var i = 0; i < Math.min(sleepRelatedClasses.length, 5); i++) { // Giới hạn 5 lớp để tránh quá tải
                  try {
                      var SleepClass = Java.use(sleepRelatedClasses[i]);
                      var methods = SleepClass.class.getDeclaredMethods();

                      for (var j = 0; j < methods.length; j++) {
                          var methodName = methods[j].getName();
                          if (methodName.indexOf("get") === 0 ||
                              methodName.indexOf("set") === 0 ||
                              methodName.indexOf("save") === 0 ||
                              methodName.indexOf("insert") === 0 ||
                              methodName.indexOf("update") === 0) {

                              try {
                                  console.log("  🔍 Tìm thấy method: " + sleepRelatedClasses[i] + "." + methodName);
                                  // Hook các phương thức getter/setter
                                  // Cẩn thận khi hook vì có thể gây crash
                              } catch (e) {
                                  // Bỏ qua lỗi khi hook
                              }
                          }
                      }
                  } catch (e) {
                      // Bỏ qua lỗi
                  }
              }
          }
      });
  } catch (e) {
      console.log("❌ Lỗi khi tìm kiếm lớp: " + e);
  }
});

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => ('00' + b.toString(16)).slice(-2)).join(' ');
}

// Hàm kiểm tra xem một mảng byte có liên quan đến giấc ngủ không
function isSleepRelated(bytes) {
  if (!bytes || bytes.length < 2) return false;

  // Các prefix liên quan đến giấc ngủ từ log đã phân tích
  const sleepPrefixes = [
      [0x05, 0x02], // Lệnh lấy trạng thái giấc ngủ
      [0x05, 0x04], // Lệnh lấy dữ liệu giấc ngủ gần đây
      [0x05, 0x06], // Lệnh lấy thông tin thống kê giấc ngủ
      [0x05, 0x08], // Lệnh lấy chi tiết các giai đoạn giấc ngủ
      [0x05, 0x09], // Lệnh lấy thông tin giấc ngủ chi tiết
      [0x05, 0x11], // Dữ liệu giấc ngủ cơ bản
      [0x05, 0x15], // Dữ liệu tổng hợp giấc ngủ
      [0x05, 0x17], // Dữ liệu giấc ngủ lịch sử
      [0x05, 0x18], // Dữ liệu chi tiết giấc ngủ lịch sử 
      [0x05, 0x80], // Kết thúc truyền dữ liệu giấc ngủ
  ];

  return sleepPrefixes.some(prefix =>
      prefix[0] === bytes[0] && (prefix.length === 1 || prefix[1] === bytes[1]));
}

// Hàm phân tích ý nghĩa của lệnh giấc ngủ
function analyzeSleepCommand(bytes) {
  if (!bytes || bytes.length < 3) return "Lệnh không xác định";

  const cmd1 = bytes[0];
  const cmd2 = bytes[1];

  if (cmd1 === 0x05) {
      switch (cmd2) {
          case 0x02:
              return "Lệnh lấy trạng thái giấc ngủ";
          case 0x04:
              return "Lệnh lấy dữ liệu giấc ngủ gần đây";
          case 0x06:
              return "Lệnh lấy thông tin thống kê giấc ngủ";
          case 0x08:
              return "Lệnh lấy chi tiết các giai đoạn giấc ngủ";
          case 0x09:
              return "Lệnh lấy thông tin giấc ngủ chi tiết";
          case 0x11:
              return "Dữ liệu giấc ngủ cơ bản";
          case 0x15:
              return "Dữ liệu tổng hợp giấc ngủ";
          case 0x17:
              return "Dữ liệu giấc ngủ lịch sử";
          case 0x18:
              return "Dữ liệu chi tiết giấc ngủ lịch sử";
          case 0x80:
              return "Kết thúc truyền dữ liệu giấc ngủ";
          default:
              return `Lệnh giấc ngủ khác: 0x${cmd1.toString(16)} 0x${cmd2.toString(16)}`;
      }
  }

  return "Không phải lệnh giấc ngủ";
}

// Ghi log với thời gian hiện tại
function logWithTimestamp(message) {
  const now = new Date();
  const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
  console.log(`[${timestamp}] ${message}`);
}

// Tìm và liệt kê các lớp liên quan đến giấc ngủ
function findSleepRelatedClasses() {
  logWithTimestamp("🔍 Đang tìm kiếm các lớp liên quan đến giấc ngủ...");

  try {
      // Tìm các lớp có chứa "sleep" hoặc "Sleep" trong tên
      Java.enumerateLoadedClasses({
          onMatch: function (className) {
              if (className.toLowerCase().indexOf("sleep") !== -1) {
                  logWithTimestamp(`🔎 Tìm thấy lớp: ${className}`);
              }
          },
          onComplete: function () {
              logWithTimestamp("✅ Đã hoàn tất tìm kiếm các lớp liên quan đến giấc ngủ");
          }
      });

      // Tìm các lớp có chứa "zhuoting" trong tên (package mới)
      Java.enumerateLoadedClasses({
          onMatch: function (className) {
              if (className.indexOf("zhuoting") !== -1) {
                  logWithTimestamp(`🔎 Package mới: ${className}`);
              }
          },
          onComplete: function () {
              logWithTimestamp("✅ Đã hoàn tất tìm kiếm các lớp trong package mới");
          }
      });
  } catch (error) {
      logWithTimestamp(`❌ Lỗi khi tìm kiếm các lớp: ${error}`);
  }
}

// Theo dõi tất cả các phương thức liên quan đến Bluetooth
function hookBluetoothMethods() {
  logWithTimestamp("🔍 Đang hook các phương thức Bluetooth...");

  // Hook các phương thức xử lý Bluetooth Gatt
  try {
      // Hook phương thức onCharacteristicChanged để bắt dữ liệu từ thiết bị
      Java.use("android.bluetooth.BluetoothGattCallback").onCharacteristicChanged.overload('android.bluetooth.BluetoothGatt', 'android.bluetooth.BluetoothGattCharacteristic').implementation = function (gatt, characteristic) {
          try {
              const deviceName = gatt.getDevice().getName();
              const uuid = characteristic.getUuid().toString();
              const value = characteristic.getValue();

              if (value) {
                  const hexValue = bytesToHex(value);

                  if (isSleepRelated(value)) {
                      logWithTimestamp(`🔵 [NHẬN] Dữ liệu giấc ngủ từ ${deviceName || "thiết bị không tên"}`);
                      logWithTimestamp(`📊 UUID: ${uuid}`);
                      logWithTimestamp(`📝 Dữ liệu: ${hexValue}`);
                      logWithTimestamp(`🧐 Phân tích: ${analyzeSleepCommand(value)}`);
                  } else {
                      logWithTimestamp(`⚪ [NHẬN] Dữ liệu từ ${deviceName || "thiết bị không tên"}`);
                      logWithTimestamp(`📊 UUID: ${uuid}`);
                      logWithTimestamp(`📝 Dữ liệu: ${hexValue}`);
                  }
              }

              // Gọi phương thức gốc
              return this.onCharacteristicChanged(gatt, characteristic);
          } catch (error) {
              logWithTimestamp(`❌ Lỗi onCharacteristicChanged: ${error}`);
              return this.onCharacteristicChanged(gatt, characteristic);
          }
      };

      // Hook phương thức writeCharacteristic để bắt lệnh gửi đến thiết bị
      Java.use("android.bluetooth.BluetoothGatt").writeCharacteristic.overload('android.bluetooth.BluetoothGattCharacteristic').implementation = function (characteristic) {
          try {
              const uuid = characteristic.getUuid().toString();
              const value = characteristic.getValue();

              if (value) {
                  const hexValue = bytesToHex(value);

                  if (isSleepRelated(value)) {
                      logWithTimestamp(`🔴 [GỬI] Lệnh giấc ngủ`);
                      logWithTimestamp(`📊 UUID: ${uuid}`);
                      logWithTimestamp(`📝 Dữ liệu gửi: ${hexValue}`);
                      logWithTimestamp(`🧐 Phân tích: ${analyzeSleepCommand(value)}`);
                  } else {
                      logWithTimestamp(`⚫ [GỬI] Lệnh Bluetooth`);
                      logWithTimestamp(`📊 UUID: ${uuid}`);
                      logWithTimestamp(`📝 Dữ liệu gửi: ${hexValue}`);
                  }
              }

              // Gọi phương thức gốc
              return this.writeCharacteristic(characteristic);
          } catch (error) {
              logWithTimestamp(`❌ Lỗi writeCharacteristic: ${error}`);
              return this.writeCharacteristic(characteristic);
          }
      };

      // Hook phương thức setValue để bắt dữ liệu được thiết lập
      Java.use("android.bluetooth.BluetoothGattCharacteristic").setValue.overload('[B').implementation = function (value) {
          try {
              const uuid = this.getUuid().toString();

              if (value) {
                  const hexValue = bytesToHex(value);

                  if (isSleepRelated(value)) {
                      logWithTimestamp(`🟣 [THIẾT LẬP] Dữ liệu giấc ngủ`);
                      logWithTimestamp(`📊 UUID: ${uuid}`);
                      logWithTimestamp(`📝 Dữ liệu: ${hexValue}`);
                      logWithTimestamp(`🧐 Phân tích: ${analyzeSleepCommand(value)}`);
                  }
              }

              // Gọi phương thức gốc
              return this.setValue(value);
          } catch (error) {
              logWithTimestamp(`❌ Lỗi setValue: ${error}`);
              return this.setValue(value);
          }
      };

      logWithTimestamp("✅ Đã hook thành công các phương thức Bluetooth");
  } catch (error) {
      logWithTimestamp(`❌ Lỗi khi hook Bluetooth: ${error}`);
  }
}

// Hook các phương thức xử lý dữ liệu giấc ngủ - Cải tiến để xử lý các package khác nhau
function hookSleepDataProcessingMethods() {
  logWithTimestamp("🔍 Đang hook các phương thức xử lý dữ liệu giấc ngủ...");

  try {
      // Tìm kiếm xem có lớp SleepDb trong các namespace khác nhau
      const possibleNamespaces = [
          "com.yucheng.smarthealthpro.greendao.SleepDb",
          "com.zhuoting.healthyucheng.greendao.SleepDb",
          "com.zhuoting.healthyucheng.database.SleepDb",
          "com.zhuoting.healthyucheng.db.SleepDb"
      ];

      let sleepDbClass = null;

      for (const namespace of possibleNamespaces) {
          try {
              sleepDbClass = Java.use(namespace);
              logWithTimestamp(`✅ Tìm thấy lớp SleepDb tại: ${namespace}`);
              break;
          } catch (error) {
              logWithTimestamp(`ℹ️ Không tìm thấy lớp tại: ${namespace}`);
          }
      }

      if (sleepDbClass) {
          // Hook setter của các trường quan trọng
          [
              "setDeepSleepTotal", "setLightSleepTotal", "setRapidEyeMovementTotal",
              "setStartTime", "setEndTime", "setWakeCount", "setDeepSleepCount",
              "setLightSleepCount", "setSleepData"
          ].forEach(method => {
              if (sleepDbClass[method]) {
                  sleepDbClass[method].implementation = function (value) {
                      logWithTimestamp(`💾 [SLEEP_DB] ${method} = ${value}`);
                      return this[method](value);
                  };
              }
          });

          logWithTimestamp("✅ Đã hook thành công các phương thức của SleepDb");
      } else {
          logWithTimestamp("⚠️ Không tìm thấy lớp SleepDb ở tất cả các namespace đã thử");
      }

      // Hook lớp BleHelper để theo dõi xử lý dữ liệu Bluetooth cấp cao hơn
      try {
          const bleHelper = Java.use("com.yucheng.ycbtsdk.gatt.BleHelper");

          if (bleHelper.onCharacteristicChanged) {
              bleHelper.onCharacteristicChanged.implementation = function (gatt, characteristic) {
                  const uuid = characteristic.getUuid().toString();
                  const value = characteristic.getValue();

                  if (value && isSleepRelated(value)) {
                      logWithTimestamp(`🔍 [BleHelper] onCharacteristicChanged nhận dữ liệu giấc ngủ`);
                      logWithTimestamp(`   UUID: ${uuid}`);
                      logWithTimestamp(`   Dữ liệu: ${bytesToHex(value)}`);
                      logWithTimestamp(`   Phân tích: ${analyzeSleepCommand(value)}`);
                  }

                  return this.onCharacteristicChanged(gatt, characteristic);
              };
          }

          if (bleHelper.sendDataToDevice) {
              bleHelper.sendDataToDevice.implementation = function (data) {
                  if (data && isSleepRelated(data)) {
                      logWithTimestamp(`🔍 [BleHelper] sendDataToDevice gửi lệnh giấc ngủ`);
                      logWithTimestamp(`   Dữ liệu: ${bytesToHex(data)}`);
                      logWithTimestamp(`   Phân tích: ${analyzeSleepCommand(data)}`);
                  }

                  return this.sendDataToDevice(data);
              };
          }

          logWithTimestamp("✅ Đã hook thành công các phương thức của BleHelper");
      } catch (error) {
          logWithTimestamp(`⚠️ Không thể hook BleHelper: ${error}`);
      }
  } catch (error) {
      logWithTimestamp(`❌ Lỗi khi hook các phương thức xử lý dữ liệu giấc ngủ: ${error}`);
  }
}

// Hook các lớp model để nắm bắt cấu trúc dữ liệu - Cải tiến để xử lý các namespace khác nhau
function hookModelClasses() {
  logWithTimestamp("🔍 Đang hook các lớp model giấc ngủ...");

  try {
      // Tìm kiếm trong các namespace khác nhau
      const possibleNamespaces = [
          "com.yucheng.smarthealthpro.home.bean.SleepResponse",
          "com.zhuoting.healthyucheng.home.bean.SleepResponse",
          "com.zhuoting.healthyucheng.bean.SleepResponse",
          "com.zhuoting.healthyucheng.model.SleepResponse"
      ];

      let SleepResponse = null;

      for (const namespace of possibleNamespaces) {
          try {
              SleepResponse = Java.use(namespace);
              logWithTimestamp(`✅ Tìm thấy lớp SleepResponse tại: ${namespace}`);
              break;
          } catch (error) {
              logWithTimestamp(`ℹ️ Không tìm thấy lớp tại: ${namespace}`);
          }
      }

      if (SleepResponse) {
          // Thử truy cập SleepDataBean
          try {
              const SleepDataBean = SleepResponse.SleepDataBean;

              if (SleepDataBean) {
                  // Hook constructor
                  SleepDataBean.$init.implementation = function () {
                      logWithTimestamp("🏗️ [SleepDataBean] Khởi tạo đối tượng mới");
                      return this.$init();
                  };

                  // Hook các getter quan trọng
                  [
                      "getDeepSleepTotal", "getLightSleepTotal", "getStartTime", "getEndTime",
                      "getDeepSleepCount", "getLightSleepCount", "getSleepData"
                  ].forEach(method => {
                      if (SleepDataBean[method]) {
                          SleepDataBean[method].implementation = function () {
                              const result = this[method]();
                              logWithTimestamp(`📊 [SleepDataBean] ${method}() = ${result}`);
                              return result;
                          };
                      }
                  });

                  logWithTimestamp("✅ Đã hook thành công các phương thức của SleepResponse.SleepDataBean");
              } else {
                  logWithTimestamp("⚠️ Không tìm thấy SleepDataBean trong SleepResponse");
              }
          } catch (error) {
              logWithTimestamp(`⚠️ Không thể hook SleepDataBean: ${error}`);
          }
      } else {
          logWithTimestamp("⚠️ Không tìm thấy lớp SleepResponse ở tất cả các namespace đã thử");
      }
  } catch (error) {
      logWithTimestamp(`❌ Lỗi khi hook các lớp model: ${error}`);
  }
}

// Hàm chính để thiết lập tất cả các hook
function main() {
  logWithTimestamp("🚀 Bắt đầu script theo dõi dữ liệu giấc ngủ từ nhẫn thông minh");

  // Chờ Java sẵn sàng
  Java.perform(function () {
      logWithTimestamp("✅ Java runtime đã sẵn sàng");

      // Tìm kiếm các lớp trước
      findSleepRelatedClasses();

      // Thiết lập các hook
      hookBluetoothMethods();
      hookSleepDataProcessingMethods();
      hookModelClasses();

      logWithTimestamp("✅ Đã thiết lập tất cả các hook");
      logWithTimestamp("📱 Vui lòng mở ứng dụng và kết nối với nhẫn thông minh");
      logWithTimestamp("💤 Đang theo dõi tất cả các trao đổi dữ liệu giấc ngủ...");
  });
}

// Chạy hàm chính
main();


Java.perform(function () {
  var targetClass = Java.use('com.yucheng.ycbtsdk.core.DataUnpack');
  console.log('📦 Hooking methods in com.yucheng.ycbtsdk.core.DataUnpack');
  if (targetClass.unpackAlarmData) {
      targetClass.unpackAlarmData.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackAlarmData');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackAlarmData(data);
          console.log('✅ Method unpackAlarmData executed');
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackAlarmData');
  }
  if (targetClass.unpackAppEcgPpgStatus) {
      targetClass.unpackAppEcgPpgStatus.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackAppEcgPpgStatus');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackAppEcgPpgStatus(data);
          console.log('✅ Method unpackAppEcgPpgStatus executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackAppEcgPpgStatus');
  }
  if (targetClass.unpackBodyData) {
      targetClass.unpackBodyData.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackBodyData');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackBodyData(data);
          console.log('✅ Method unpackBodyData executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackBodyData');
  }
  if (targetClass.unpackCollectSummaryInfo) {
      targetClass.unpackCollectSummaryInfo.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackCollectSummaryInfo');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackCollectSummaryInfo(data);
          console.log('✅ Method unpackCollectSummaryInfo executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackCollectSummaryInfo');
  }
  if (targetClass.unpackContacts) {
      targetClass.unpackContacts.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackContacts');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackContacts(data);
          console.log('✅ Method unpackContacts executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackContacts');
  }
  if (targetClass.unpackCustomizeCGM) {
      targetClass.unpackCustomizeCGM.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackCustomizeCGM');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackCustomizeCGM(data);
          console.log('✅ Method unpackCustomizeCGM executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackCustomizeCGM');
  }
  if (targetClass.unpackCustomizeData) {
      targetClass.unpackCustomizeData.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackCustomizeData');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackCustomizeData(data);
          console.log('✅ Method unpackCustomizeData executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackCustomizeData');
  }
  if (targetClass.unpackDeviceInfoData) {
      targetClass.unpackDeviceInfoData.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackDeviceInfoData');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackDeviceInfoData(data);
          console.log('✅ Method unpackDeviceInfoData executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackDeviceInfoData');
  }
  if (targetClass.unpackDeviceName) {
      targetClass.unpackDeviceName.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackDeviceName');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackDeviceName(data);
          console.log('✅ Method unpackDeviceName executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackDeviceName');
  }
  if (targetClass.unpackDeviceScreenInfo) {
      targetClass.unpackDeviceScreenInfo.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackDeviceScreenInfo');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackDeviceScreenInfo(data);
          console.log('✅ Method unpackDeviceScreenInfo executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackDeviceScreenInfo');
  }
  if (targetClass.unpackDeviceUserConfigData) {
      targetClass.unpackDeviceUserConfigData.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackDeviceUserConfigData');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackDeviceUserConfigData(data);
          console.log('✅ Method unpackDeviceUserConfigData executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackDeviceUserConfigData');
  }
  if (targetClass.unpackDialInfo) {
      targetClass.unpackDialInfo.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackDialInfo');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackDialInfo(data);
          console.log('✅ Method unpackDialInfo executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackDialInfo');
  }
  if (targetClass.unpackEcgLocation) {
      targetClass.unpackEcgLocation.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackEcgLocation');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackEcgLocation(data);
          console.log('✅ Method unpackEcgLocation executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackEcgLocation');
  }
  if (targetClass.unpackFileCount) {
      targetClass.unpackFileCount.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackFileCount');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackFileCount(data);
          console.log('✅ Method unpackFileCount executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackFileCount');
  }
  if (targetClass.unpackFileData) {
      targetClass.unpackFileData.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackFileData');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackFileData(data);
          console.log('✅ Method unpackFileData executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackFileData');
  }
  if (targetClass.unpackFileList) {
      targetClass.unpackFileList.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackFileList');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackFileList(data);
          console.log('✅ Method unpackFileList executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackFileList');
  }
  if (targetClass.unpackFileSync) {
      targetClass.unpackFileSync.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackFileSync');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackFileSync(data);
          console.log('✅ Method unpackFileSync executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackFileSync');
  }
  if (targetClass.unpackFileSyncVerify) {
      targetClass.unpackFileSyncVerify.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackFileSyncVerify');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackFileSyncVerify(data);
          console.log('✅ Method unpackFileSyncVerify executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackFileSyncVerify');
  }
  if (targetClass.unpackGetALiIOTActivationState) {
      targetClass.unpackGetALiIOTActivationState.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackGetALiIOTActivationState');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackGetALiIOTActivationState(data);
          console.log('✅ Method unpackGetALiIOTActivationState executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackGetALiIOTActivationState');
  }
  if (targetClass.unpackGetAllRealDataFromDevice) {
      targetClass.unpackGetAllRealDataFromDevice.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackGetAllRealDataFromDevice');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackGetAllRealDataFromDevice(data);
          console.log('✅ Method unpackGetAllRealDataFromDevice executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackGetAllRealDataFromDevice');
  }
  if (targetClass.unpackGetCardInfo) {
      targetClass.unpackGetCardInfo.overload('[B').implementation = function (data) {
          console.log('🟠 Method called: unpackGetCardInfo');
          var hex = Array.prototype.map.call(data, x => ('00' + (x & 0xFF).toString(16)).slice(-2)).join(' ');
          console.log('📥 Input Data (hex): ' + hex);
          var result = this.unpackGetCardInfo(data);
          console.log('✅ Method unpackGetCardInfo executed', result);
          return result;
      };
  } else {
      console.log('❌ Method not found: unpackGetCardInfo');
  }
  console.log('✅ All hooks installed for DataUnpack');
});