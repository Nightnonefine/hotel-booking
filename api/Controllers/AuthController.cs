using System.Net.Mail;
using HotelBooking.Api.Data;
using HotelBooking.Api.Models;
using HotelBooking.Api.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    public const int MinPasswordLength = 8;

    private readonly AppDbContext _db;

    public AuthController(AppDbContext db) => _db = db;

    // POST /api/auth/register  { email, password }
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AuthRequest input)
    {
        var email = input.Email?.Trim().ToLowerInvariant() ?? string.Empty;
        var password = input.Password ?? string.Empty;

        var errors = Validate(email, password);
        if (errors.Count > 0) return BadRequest(new { message = errors[0], errors });

        if (await _db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { message = "Email này đã được đăng ký." });

        var user = new User { Email = email, PasswordHash = PasswordHasher.Hash(password) };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return StatusCode(StatusCodes.Status201Created, new AuthResponse(user.Id, user.Email));
    }

    // POST /api/auth/login  { email, password }
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthRequest input)
    {
        var email = input.Email?.Trim().ToLowerInvariant() ?? string.Empty;
        var password = input.Password ?? string.Empty;

        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);

        // Cùng một thông báo cho "sai email" và "sai mật khẩu" để không lộ email nào tồn tại.
        if (user is null || !PasswordHasher.Verify(password, user.PasswordHash))
            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng." });

        return Ok(new AuthResponse(user.Id, user.Email));
    }

    // Validate phía server — client cũng validate nhưng không được tin client.
    private static List<string> Validate(string email, string password)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(email))
            errors.Add("Email không được để trống.");
        else if (email.Length > 160 || !MailAddress.TryCreate(email, out _))
            errors.Add("Email không hợp lệ.");

        if (string.IsNullOrEmpty(password))
            errors.Add("Mật khẩu không được để trống.");
        else if (password.Length < MinPasswordLength)
            errors.Add($"Mật khẩu phải có ít nhất {MinPasswordLength} ký tự.");

        return errors;
    }
}
