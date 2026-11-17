namespace HotelBooking.Api.Models;

// Body của POST /api/auth/register và /api/auth/login.
public record AuthRequest(string? Email, string? Password);

// Trả về cho client — không bao giờ trả PasswordHash.
public record AuthResponse(int Id, string Email);
