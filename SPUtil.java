package com.yucheng.ycbtsdk.utils;

import android.content.Context;
import android.content.SharedPreferences;
import com.yucheng.smarthealthpro.utils.Constant;
import java.lang.reflect.Method;
import java.util.Map;

/* loaded from: classes4.dex */
public class SPUtil {
    private static Context spContext = null;
    private static String spFileName = "ycblespinfo";

    private static class SharedPreferencesCompat {
        private static final Method sApplyMethod = findApplyMethod();

        private SharedPreferencesCompat() {
        }

        public static void apply(SharedPreferences.Editor editor) {
            try {
                Method method = sApplyMethod;
                if (method != null) {
                    method.invoke(editor, new Object[0]);
                    return;
                }
            } catch (Exception e2) {
                e2.printStackTrace();
            }
            editor.commit();
        }

        private static Method findApplyMethod() {
            try {
                return SharedPreferences.Editor.class.getMethod("apply", new Class[0]);
            } catch (NoSuchMethodException e2) {
                e2.printStackTrace();
                return null;
            }
        }
    }

    public static void clear() {
        SharedPreferences.Editor edit = spContext.getSharedPreferences(spFileName, 0).edit();
        edit.clear();
        SharedPreferencesCompat.apply(edit);
    }

    public static boolean contains(String str) {
        return spContext.getSharedPreferences(spFileName, 0).contains(str);
    }

    public static Object get(String str, Object obj) {
        Context context = spContext;
        if (context == null) {
            return obj;
        }
        SharedPreferences sharedPreferences = context.getSharedPreferences(spFileName, 0);
        return obj instanceof String ? sharedPreferences.getString(str, (String) obj) : obj instanceof Integer ? Integer.valueOf(sharedPreferences.getInt(str, ((Integer) obj).intValue())) : obj instanceof Boolean ? Boolean.valueOf(sharedPreferences.getBoolean(str, ((Boolean) obj).booleanValue())) : obj instanceof Float ? Float.valueOf(sharedPreferences.getFloat(str, ((Float) obj).floatValue())) : obj instanceof Long ? Long.valueOf(sharedPreferences.getLong(str, ((Long) obj).longValue())) : obj;
    }

    public static Map<String, ?> getAll() {
        return spContext.getSharedPreferences(spFileName, 0).getAll();
    }

    public static String getBindDeviceVersion() {
        return spContext.getSharedPreferences(spFileName, 0).getString("ycble_bindedversion", "");
    }

    public static String getBindedDeviceMac() {
        return spContext.getSharedPreferences(spFileName, 0).getString(Constant.SpConstKey.YCBLE_BINDED_MAC, "");
    }

    public static String getBindedDeviceName() {
        return spContext.getSharedPreferences(spFileName, 0).getString(Constant.SpConstKey.YCBLE_BINDED_NAME, "");
    }

    public static String getBloodSugarVersion() {
        return spContext.getSharedPreferences(spFileName, 0).getString("ycble_blood_sugar_version", "");
    }

    public static int getChipScheme() {
        return spContext.getSharedPreferences(spFileName, 0).getInt("chipScheme", 0);
    }

    public static int getDeviceBatteryState() {
        return spContext.getSharedPreferences(spFileName, 0).getInt("ycble_device_battery_state", 0);
    }

    public static int getDeviceBatteryValue() {
        return spContext.getSharedPreferences(spFileName, 0).getInt("ycble_device_battery_value", 0);
    }

    public static int getHardwareType() {
        return spContext.getSharedPreferences(spFileName, 0).getInt("hardwareType", 0);
    }

    public static String getLastBindedDeviceMac() {
        return spContext.getSharedPreferences(spFileName, 0).getString("ycble_lastbindedmac", "");
    }

    public static void init(Context context) {
        spContext = context;
    }

    public static void put(String str, Object obj) {
        String obj2;
        SharedPreferences.Editor edit = spContext.getSharedPreferences(spFileName, 0).edit();
        if (obj != null) {
            if (obj instanceof String) {
                obj2 = (String) obj;
            } else if (obj instanceof Integer) {
                edit.putInt(str, ((Integer) obj).intValue());
            } else if (obj instanceof Boolean) {
                edit.putBoolean(str, ((Boolean) obj).booleanValue());
            } else if (obj instanceof Float) {
                edit.putFloat(str, ((Float) obj).floatValue());
            } else if (obj instanceof Long) {
                edit.putLong(str, ((Long) obj).longValue());
            } else {
                obj2 = obj.toString();
            }
            edit.putString(str, obj2);
        }
        SharedPreferencesCompat.apply(edit);
    }

    public static void remove(String str) {
        SharedPreferences.Editor edit = spContext.getSharedPreferences(spFileName, 0).edit();
        edit.remove(str);
        SharedPreferencesCompat.apply(edit);
    }

    public static void saveBindedDeviceMac(String str) {
        SharedPreferences.Editor edit = spContext.getSharedPreferences(spFileName, 0).edit();
        edit.putString(Constant.SpConstKey.YCBLE_BINDED_MAC, str);
        edit.commit();
    }

    public static void saveBindedDeviceName(String str) {
        SharedPreferences.Editor edit = spContext.getSharedPreferences(spFileName, 0).edit();
        edit.putString(Constant.SpConstKey.YCBLE_BINDED_NAME, str);
        edit.commit();
    }

    public static void saveBindedDeviceVersion(String str) {
        SharedPreferences.Editor edit = spContext.getSharedPreferences(spFileName, 0).edit();
        edit.putString("ycble_bindedversion", str);
        edit.commit();
    }

    public static void saveBloodSugarVersion(String str) {
        SharedPreferences.Editor edit = spContext.getSharedPreferences(spFileName, 0).edit();
        edit.putString("ycble_blood_sugar_version", str);
        edit.commit();
    }

    public static void saveChipScheme(int i2) {
        SharedPreferences.Editor edit = spContext.getSharedPreferences(spFileName, 0).edit();
        edit.putInt("chipScheme", i2);
        edit.commit();
    }

    public static void saveDeviceBatteryState(int i2) {
        SharedPreferences.Editor edit = spContext.getSharedPreferences(spFileName, 0).edit();
        edit.putInt("ycble_device_battery_state", i2);
        edit.commit();
    }

    public static void saveDeviceBatteryValue(int i2) {
        SharedPreferences.Editor edit = spContext.getSharedPreferences(spFileName, 0).edit();
        edit.putInt("ycble_device_battery_value", i2);
        edit.commit();
    }

    public static void saveHardwareType(int i2) {
        SharedPreferences.Editor edit = spContext.getSharedPreferences(spFileName, 0).edit();
        edit.putInt("hardwareType", i2);
        edit.commit();
    }

    public static void saveLastBindedDeviceMac(String str) {
        SharedPreferences.Editor edit = spContext.getSharedPreferences(spFileName, 0).edit();
        edit.putString("ycble_lastbindedmac", str);
        edit.commit();
    }
}
