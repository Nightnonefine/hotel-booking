"""Smoke test API: chạy khi server đang bật (dotnet run).
    python3 tests/smoke_test.py [base_url]
Kiểm tra đủ GET/POST/PUT/DELETE cho /api/hotels và /api/bookings.
"""
import json
import sys
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5080/api"
ok = failed = 0


def call(method, path, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        BASE + path, data=data, method=method,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            body = res.read().decode()
            return res.status, (json.loads(body) if body else None)
    except urllib.error.HTTPError as err:
        body = err.read().decode()
        return err.code, (json.loads(body) if body else None)


def check(name, expected, actual):
    global ok, failed
    if expected == actual:
        ok += 1
        print(f"ok   {name} -> {actual}")
    else:
        failed += 1
        print(f"FAIL {name} -> mong đợi {expected}, nhận {actual}")


check("GET /hotels", 200, call("GET", "/hotels")[0])
check("GET /hotels?city=Đà Nẵng", 200, call("GET", "/hotels?city=%C4%90%C3%A0%20N%E1%BA%B5ng")[0])

status, hotel = call("POST", "/hotels", {
    "name": "Test Hotel", "city": "Huế", "address": "Lê Lợi",
    "pricePerNight": 650000, "rating": 4.2,
})
check("POST /hotels", 201, status)
hotel_id = hotel["id"]
check("GET /hotels/{id}", 200, call("GET", f"/hotels/{hotel_id}")[0])

check("PUT /hotels/{id}", 204, call("PUT", f"/hotels/{hotel_id}", {
    "name": "Test Hotel (đã sửa)", "city": "Huế", "address": "Lê Lợi",
    "pricePerNight": 700000, "rating": 4.4,
})[0])
check("GET /hotels/{id} sau PUT", 200, call("GET", f"/hotels/{hotel_id}")[0])
check("PUT /hotels/{id} không tồn tại -> 404", 404, call("PUT", "/hotels/99999", {
    "name": "x", "city": "x", "pricePerNight": 1, "rating": 1,
})[0])

status, booking = call("POST", "/bookings", {
    "hotelId": hotel_id, "guestName": "Nguyễn Văn A", "phone": "0901234567",
    "checkIn": "2026-11-10", "checkOut": "2026-11-12", "rooms": 2,
})
check("POST /bookings", 201, status)
booking_id = booking["id"]
check("POST /bookings sai ngày -> 400", 400, call("POST", "/bookings", {
    "hotelId": hotel_id, "guestName": "B", "phone": "0900000000",
    "checkIn": "2026-11-12", "checkOut": "2026-11-10", "rooms": 1,
})[0])
check("GET /bookings", 200, call("GET", "/bookings")[0])
check("PUT /bookings/{id} (Cancelled)", 204, call("PUT", f"/bookings/{booking_id}", {
    "guestName": "Nguyễn Văn A", "phone": "0901234567",
    "checkIn": "2026-11-10", "checkOut": "2026-11-12", "rooms": 2, "status": "Cancelled",
})[0])
check("DELETE /hotels/{id} khi còn đơn -> 409", 409, call("DELETE", f"/hotels/{hotel_id}")[0])
check("DELETE /bookings/{id}", 204, call("DELETE", f"/bookings/{booking_id}")[0])
check("DELETE /hotels/{id}", 204, call("DELETE", f"/hotels/{hotel_id}")[0])
check("GET /hotels/{id} đã xoá -> 404", 404, call("GET", f"/hotels/{hotel_id}")[0])

print(f"\n{ok} pass, {failed} fail")
sys.exit(1 if failed else 0)
