package com.yucheng.ycbtsdk.utils;

import androidx.core.view.MotionEventCompat;
import androidx.core.view.ViewCompat;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import kotlin.UShort;

/* loaded from: classes4.dex */
public class ByteUtil {
    public static byte[] HexCommandtoByte(byte[] bArr) {
        if (bArr == null) {
            return null;
        }
        String[] split = new String(bArr, 0, bArr.length).split(" ");
        int length = split.length;
        byte[] bArr2 = new byte[length];
        for (int i2 = 0; i2 < length; i2++) {
            if (split[i2].length() != 2) {
                bArr2[i2] = 0;
            } else {
                try {
                    bArr2[i2] = (byte) Integer.parseInt(split[i2], 16);
                } catch (Exception unused) {
                    bArr2[i2] = 0;
                }
            }
        }
        return bArr2;
    }

    public static String boolByteToString(byte[] bArr) {
        StringBuilder sb = new StringBuilder();
        if (!isEmpty(bArr)) {
            int i2 = 9;
            while (true) {
                int i3 = i2 + 2;
                if (i3 >= bArr.length) {
                    break;
                }
                sb.append(((bArr[i2] & 255) + ((bArr[i2 + 1] & 255) << 8)) + "," + (bArr[i3] & 255) + "\n");
                i2 += 3;
            }
        }
        return sb.toString();
    }

    public static String boolIntToString(int[] iArr) {
        StringBuilder sb = new StringBuilder();
        if (iArr != null && iArr.length > 0) {
            int i2 = 9;
            while (true) {
                int i3 = i2 + 2;
                if (i3 >= iArr.length) {
                    break;
                }
                sb.append(((iArr[i2] & 255) + ((iArr[i2 + 1] & 255) << 8)) + "," + (iArr[i3] & 255) + "\n");
                i2 += 3;
            }
        }
        return sb.toString();
    }

    public static byte[] byteMerger(byte[] bArr, byte[] bArr2) {
        byte[] bArr3 = new byte[bArr.length + bArr2.length];
        System.arraycopy(bArr, 0, bArr3, 0, bArr.length);
        System.arraycopy(bArr2, 0, bArr3, bArr.length, bArr2.length);
        return bArr3;
    }

    public static String byteToStr(byte[] bArr) {
        int i2 = 0;
        while (true) {
            try {
                if (i2 >= bArr.length) {
                    i2 = 0;
                    break;
                }
                if (bArr[i2] == 0) {
                    break;
                }
                i2++;
            } catch (Exception unused) {
                return "";
            }
        }
        return new String(bArr, 0, i2, StandardCharsets.UTF_8);
    }

    public static String byteToString(byte[] bArr) {
        StringBuilder sb = new StringBuilder();
        if (!isEmpty(bArr)) {
            for (byte b2 : bArr) {
                sb.append(String.format("%02X", Byte.valueOf(b2)));
            }
        }
        return sb.toString();
    }

    public static String byteToStringSpace(byte[] bArr) {
        StringBuilder sb = new StringBuilder();
        if (!isEmpty(bArr)) {
            for (int i2 = 0; i2 < bArr.length; i2++) {
                sb.append((bArr[i2] & 255) + "," + (i2 % 8 == 0 ? "\n" : ""));
            }
        }
        return sb.toString();
    }

    public static int crc16_compute(byte[] bArr, int i2) {
        short s = -1;
        for (int i3 = 0; i3 < i2; i3++) {
            short s2 = (short) (((short) (((short) (((s << 8) & MotionEventCompat.ACTION_POINTER_INDEX_MASK) | ((s >> 8) & 255))) ^ (bArr[i3] & 255))) ^ ((byte) ((r0 & 255) >> 4)));
            short s3 = (short) (s2 ^ ((s2 << 8) << 4));
            s = (short) (s3 ^ (((s3 & 255) << 4) << 1));
        }
        return 65535 & s;
    }

    public static int crc16_compute(byte[] bArr, int i2, int i3) {
        if (i3 == -1) {
            i3 = 65535;
        }
        short s = (short) i3;
        for (int i4 = 0; i4 < i2; i4++) {
            short s2 = (short) (((short) (((short) (((s << 8) & MotionEventCompat.ACTION_POINTER_INDEX_MASK) | ((s >> 8) & 255))) ^ (bArr[i4] & 255))) ^ ((byte) ((r6 & 255) >> 4)));
            short s3 = (short) (s2 ^ ((s2 << 8) << 4));
            s = (short) (s3 ^ (((s3 & 255) << 4) << 1));
        }
        return s & UShort.MAX_VALUE;
    }

    public static String ecgByteToString(byte[] bArr) {
        StringBuilder sb = new StringBuilder();
        if (!isEmpty(bArr)) {
            for (int i2 = 0; i2 < bArr.length - 2; i2 += 3) {
                int i3 = (bArr[i2] & 255) + (bArr[i2 + 1] << 8);
                byte b2 = bArr[i2 + 2];
                int i4 = i3 + (b2 << 16);
                if ((b2 & 128) != 0) {
                    i4 |= ViewCompat.MEASURED_STATE_MASK;
                }
                sb.append(i4 + "\n");
            }
        }
        return sb.toString();
    }

    public static byte[] fromInt(int i2) {
        byte[] bArr = new byte[4];
        for (int i3 = 0; i3 < 4; i3++) {
            bArr[i3] = (byte) (i2 >>> (i3 * 8));
        }
        return bArr;
    }

    public static byte[] fromLong(long j2) {
        byte[] bArr = new byte[8];
        for (int i2 = 0; i2 < 8; i2++) {
            bArr[i2] = (byte) (j2 >>> (i2 * 8));
        }
        return bArr;
    }

    public static byte[] fromShort(short s) {
        return new byte[]{(byte) s, (byte) (s >>> 8)};
    }

    public static String getData(String str, int i2) {
        int i3;
        if (str == null) {
            return str;
        }
        try {
        } catch (Exception e2) {
            e = e2;
            i3 = 0;
        }
        if (str.length() <= i2 / 3) {
            return str;
        }
        byte[] bytes = str.substring(0, i2 / 3).getBytes("utf-8");
        boolean z = true;
        i3 = 0;
        while (z) {
            i3++;
            try {
                if (bytes.length > i2 - 1 || (i2 / 3) + i3 > str.length()) {
                    z = false;
                } else {
                    bytes = str.substring(0, (i2 / 3) + i3).getBytes("utf-8");
                }
            } catch (Exception e3) {
                e = e3;
                e.printStackTrace();
                return str.substring(0, ((i2 / 3) + i3) - 1);
            }
        }
        return str.substring(0, ((i2 / 3) + i3) - 1);
    }

    public static boolean isEmpty(byte[] bArr) {
        return bArr == null || bArr.length == 0;
    }

    public static byte[] pdNumberToByte(String str, int i2, String str2, int i3, List<HashMap<String, Integer>> list, int i4) {
        if (str != null) {
            try {
                if (str.length() > 0 && str2 != null && str2.length() > 0) {
                    if (str.getBytes("utf-8").length > i2) {
                        str = getData(str, i2);
                    }
                    if (str2.getBytes("utf-8").length > i3) {
                        str2 = getData(str2, i3);
                    }
                    byte[] bArr = {0};
                    byte[] byteMerger = byteMerger(byteMerger(byteMerger(str.getBytes("utf-8"), bArr), str2.getBytes("utf-8")), bArr);
                    byte[] bArr2 = new byte[list.size() * 2];
                    for (int i5 = 0; i5 < list.size(); i5++) {
                        int i6 = i5 * 2;
                        bArr2[i6] = (byte) list.get(i5).get("pdNumber").intValue();
                        bArr2[i6 + 1] = (byte) list.get(i5).get("time").intValue();
                    }
                    return byteMerger(byteMerger(byteMerger, bArr2), new byte[]{(byte) i4});
                }
            } catch (Exception e2) {
                e2.printStackTrace();
            }
        }
        return new byte[0];
    }

    public static byte[] stringToByte(String str, String str2, int i2, int i3) {
        if (i2 > 0 && str != null) {
            try {
                if (str.length() > 0 && str2 != null && str2.length() > 0) {
                    if (str2.length() > i2) {
                        str2 = getData(str2, i2 * 3);
                    }
                    byte[] bArr = {0};
                    return byteMerger(byteMerger(byteMerger(byteMerger(new byte[]{(byte) i3}, str.getBytes("utf-8")), bArr), str2.getBytes("utf-8")), bArr);
                }
            } catch (Exception e2) {
                e2.printStackTrace();
            }
        }
        return new byte[0];
    }

    public static String threeByteToString(byte[] bArr) {
        StringBuilder sb = new StringBuilder();
        if (!isEmpty(bArr)) {
            int i2 = 0;
            while (true) {
                int i3 = i2 + 8;
                if (i3 >= bArr.length) {
                    break;
                }
                sb.append(((int) ((short) ((bArr[i2] & 255) + ((bArr[i2 + 1] & 255) << 8) + ((bArr[i2 + 2] & 255) << 16)))) + "," + ((int) ((short) ((bArr[i2 + 3] & 255) + ((bArr[i2 + 4] & 255) << 8) + ((bArr[i2 + 5] & 255) << 16)))) + "," + ((int) ((short) ((bArr[i2 + 6] & 255) + ((bArr[i2 + 7] & 255) << 8) + ((bArr[i3] & 255) << 16)))) + "\n");
                i2 += 9;
            }
        }
        return sb.toString();
    }

    public static int ubyteToInt(byte b2) {
        return b2 & 255;
    }

    public static void writeBytesToFile(File file, byte[] bArr) {
        FileOutputStream fileOutputStream = new FileOutputStream(file, true);
        ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(bArr);
        byte[] bArr2 = new byte[1024];
        while (true) {
            int read = byteArrayInputStream.read(bArr2);
            if (read == -1) {
                byteArrayInputStream.close();
                fileOutputStream.close();
                return;
            }
            fileOutputStream.write(bArr2, 0, read);
        }
    }
}
