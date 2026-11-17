using System.ComponentModel.DataAnnotations;

namespace HotelBooking.Api.Models;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(160)]
    public string Email { get; set; } = string.Empty;

    // Chỉ lưu hash PBKDF2, không bao giờ lưu mật khẩu gốc.
    [Required, MaxLength(200)]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
