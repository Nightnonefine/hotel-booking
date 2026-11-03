using HotelBooking.Api.Data;
using HotelBooking.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public BookingsController(AppDbContext db) => _db = db;

    // GET /api/bookings?status=Cancelled&page=1&pageSize=10
    [HttpGet]
    public async Task<IActionResult> GetAll(string? status, int page = 1, int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _db.Bookings.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(b => b.Status == status);

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(b => b.Id)
                               .Skip((page - 1) * pageSize)
                               .Take(pageSize)
                               .Select(b => new
                               {
                                   b.Id, b.HotelId, HotelName = b.Hotel!.Name,
                                   b.GuestName, b.Phone, b.CheckIn, b.CheckOut,
                                   b.Rooms, b.Status, b.CreatedAt
                               })
                               .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    // GET /api/bookings/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var booking = await _db.Bookings.AsNoTracking()
            .Where(b => b.Id == id)
            .Select(b => new { b.Id, b.HotelId, HotelName = b.Hotel!.Name, b.GuestName, b.Phone, b.CheckIn, b.CheckOut, b.Rooms, b.Status, b.CreatedAt })
            .FirstOrDefaultAsync();

        return booking is null ? NotFound(new { message = $"Không có đơn id={id}" }) : Ok(booking);
    }

    // POST /api/bookings
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Booking input)
    {
        if (input.CheckOut <= input.CheckIn)
            return BadRequest(new { message = "Ngày trả phòng phải sau ngày nhận phòng." });

        if (!await _db.Hotels.AnyAsync(h => h.Id == input.HotelId))
            return BadRequest(new { message = $"Không có khách sạn id={input.HotelId}" });

        input.Id = 0;
        input.Status = "Pending";
        input.CreatedAt = DateTime.UtcNow;
        _db.Bookings.Add(input);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = input.Id }, new { input.Id, input.HotelId, input.GuestName, input.Status });
    }

    // PUT /api/bookings/1 -> đổi trạng thái (Confirmed | Cancelled | CheckedIn)
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Booking input)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking is null) return NotFound(new { message = $"Không có đơn id={id}" });

        string[] allowed = { "Pending", "Confirmed", "Cancelled", "CheckedIn" };
        if (!allowed.Contains(input.Status))
            return BadRequest(new { message = "Status phải là Pending/Confirmed/Cancelled/CheckedIn." });

        booking.Status = input.Status;
        booking.GuestName = input.GuestName;
        booking.Phone = input.Phone;
        booking.CheckIn = input.CheckIn;
        booking.CheckOut = input.CheckOut;
        booking.Rooms = input.Rooms;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/bookings/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking is null) return NotFound(new { message = $"Không có đơn id={id}" });

        _db.Bookings.Remove(booking);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
