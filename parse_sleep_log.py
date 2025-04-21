#!/usr/bin/env python3
import datetime
import sys

# Mô tả các mã lệnh CMD2
CMD2_DESCRIPTIONS = {
    0x02: "Lệnh lấy trạng thái giấc ngủ (0x05 02)",
    0x04: "Lệnh lấy dữ liệu giấc ngủ gần đây (0x05 04)",
    0x06: "Lệnh lấy thông tin thống kê giấc ngủ (0x05 06)",
    0x08: "Lệnh lấy chi tiết các giai đoạn giấc ngủ (0x05 08)",
    0x09: "Lệnh lấy thông tin giấc ngủ chi tiết (0x05 09)",
    0x11: "Dữ liệu giấc ngủ cơ bản (0x05 11)",
    0x13: "Dữ liệu giấc ngủ chi tiết theo giờ (0x05 13)",
    0x15: "Dữ liệu tổng hợp giấc ngủ (0x05 15)",
    0x17: "Dữ liệu giấc ngủ lịch sử (0x05 17)",
    0x18: "Dữ liệu chi tiết giấc ngủ lịch sử (0x05 18)",
    0x80: "Xóa dữ liệu giấc ngủ (0x05 80)",
}

# Mô tả các giai đoạn giấc ngủ
SLEEP_STAGE = {
    241: "Deep Sleep",
    242: "Light Sleep",
    243: "REM",
    244: "Awake",
}

# Phân tách và parse một dòng hex từ file log
def parse_line(line):
    tokens = line.strip().split()
    if len(tokens) < 4:
        return None
    try:
        # Chuyển mọi token sang số nguyên 0-255
        vals = [(int(tok, 16) & 0xFF) for tok in tokens]
    except ValueError:
        return None
    return vals

# Định dạng timestamp từ raw
def format_time(raw):
    # Theo công thức Java: (raw + 946684800) * 1000 -> ms
    # Ở đây ta chỉ cần giây
    t = raw + 946684800
    dt = datetime.datetime.utcfromtimestamp(t)
    return dt.strftime("%Y-%m-%d %H:%M:%S UTC")

# Định dạng thời lượng
def format_duration(sec):
    h = sec // 3600
    m = (sec % 3600) // 60
    s = sec % 60
    return f"{h}h {m}m {s}s"

# Giải mã một packet sleep
def decode_packet(vals):
    cmd1, cmd2 = vals[0], vals[1]
    desc = CMD2_DESCRIPTIONS.get(cmd2, f"Gói sleep khác: 0x{cmd1:02X} 0x{cmd2:02X}")
    length = vals[2] | (vals[3] << 8)
    start_raw = vals[4] | (vals[5] << 8) | (vals[6] << 16) | (vals[7] << 24)
    end_raw   = vals[8] | (vals[9] << 8) | (vals[10] << 16) | (vals[11] << 24)

    lines = []
    lines.append(f"--- Packet: {desc}")
    lines.append(f"Length: {length} bytes")
    lines.append(f"StartRaw: 0x{start_raw:08X} ({start_raw}) -> {format_time(start_raw)}")
    lines.append(f"EndRaw  : 0x{end_raw:08X} ({end_raw}) -> {format_time(end_raw)}")

    # Phân tích tổng hợp nếu có
    if length >= 28 and len(vals) >= 28:
        deep_count  = vals[12] | (vals[13] << 8)
        light_count = vals[14] | (vals[15] << 8)
        awake_count = vals[16] | (vals[17] << 8)
        deep_total  = vals[18] | (vals[19] << 8)
        light_total = vals[20] | (vals[21] << 8)
        awake_total = vals[22] | (vals[23] << 8)
        rem_total   = vals[24] | (vals[25] << 8)
        wake_times  = vals[26] | (vals[27] << 8)
        lines.append("== Tổng hợp ==")
        lines.append(f"Deep count: {deep_count}, Light count: {light_count}, Awake count: {awake_count}")
        lines.append(f"Deep total: {deep_total} phút, Light total: {light_total} phút, Awake total: {awake_total} phút")
        lines.append(f"REM total: {rem_total} phút, Wake times: {wake_times}")

    # Phân tích block stage
    if length > 28:
        lines.append("== Chi tiết đoạn giấc ngủ ==")
        offset = 28
        block = 1
        while offset + 8 <= len(vals):
            t   = vals[offset]
            start = vals[offset+1] | (vals[offset+2] << 8) | (vals[offset+3] << 16) | (vals[offset+4] << 24)
            dur   = vals[offset+5] | (vals[offset+6] << 8) | (vals[offset+7] << 16)
            stg   = SLEEP_STAGE.get(t, f"Unknown({t})")
            lines.append(f"Block {block}: {stg}")
            lines.append(f"  Start   : {format_time(start)}")
            lines.append(f"  Duration: {format_duration(dur)}")
            offset += 8
            block += 1

    return "\n".join(lines)

# Main
if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "log-connect.txt"
    try:
        with open(path, encoding="utf-8") as f:
            for line in f:
                vals = parse_line(line)
                if not vals or vals[0] != 0x05:
                    continue
                print(decode_packet(vals))
                print()
    except Exception as e:
        print(f"❌ Lỗi khi mở hoặc xử lý file {path}: {e}")
