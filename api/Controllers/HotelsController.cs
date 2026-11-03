using HotelBooking.Api.Data;
using HotelBooking.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/hotels")]
public class HotelsController : ControllerBase
{
    private readonly AppDbContext _db;

    public HotelsController(AppDbContext db) => _db = db;

    // GET /api/hotels?city=Đà Nẵng&q=azure&page=1&pageSize=10
    [HttpGet]
    public async Task<IActionResult> GetAll(string? city, string? q, int page = 1, int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _db.Hotels.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(city)) query = query.Where(h => h.City == city);
        if (!string.IsNullOrWhiteSpace(q)) query = query.Where(h => h.Name.Contains(q));

        var total = await query.CountAsync();
        var items = await query.OrderBy(h => h.Id)
                               .Skip((page - 1) * pageSize)
                               .Take(pageSize)
                               .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    // GET /api/hotels/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var hotel = await _db.Hotels.AsNoTracking().FirstOrDefaultAsync(h => h.Id == id);
        return hotel is null ? NotFound(new { message = $"Không có khách sạn id={id}" }) : Ok(hotel);
    }

    // POST /api/hotels
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Hotel input)
    {
        input.Id = 0;
        input.Bookings.Clear();
        _db.Hotels.Add(input);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = input.Id }, input);
    }

    // PUT /api/hotels/1
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Hotel input)
    {
        var hotel = await _db.Hotels.FindAsync(id);
        if (hotel is null) return NotFound(new { message = $"Không có khách sạn id={id}" });

        hotel.Name = input.Name;
        hotel.City = input.City;
        hotel.Address = input.Address;
        hotel.PricePerNight = input.PricePerNight;
        hotel.Rating = input.Rating;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/hotels/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var hotel = await _db.Hotels.FindAsync(id);
        if (hotel is null) return NotFound(new { message = $"Không có khách sạn id={id}" });

        // Không cho xoá khách sạn còn đơn đặt phòng (FK Restrict), trả lỗi rõ ràng thay vì 500.
        if (await _db.Bookings.AnyAsync(b => b.HotelId == id))
            return Conflict(new { message = "Khách sạn còn đơn đặt phòng, xoá các đơn trước." });

        _db.Hotels.Remove(hotel);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
