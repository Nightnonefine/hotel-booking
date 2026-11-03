using System.ComponentModel.DataAnnotations;

namespace HotelBooking.Api.Models;

public class Booking
{
    public int Id { get; set; }

    [Required]
    public int HotelId { get; set; }

    public Hotel? Hotel { get; set; }

    [Required, MaxLength(120)]
    public string GuestName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public DateOnly CheckIn { get; set; }

    [Required]
    public DateOnly CheckOut { get; set; }

    [Range(1, 20)]
    public int Rooms { get; set; } = 1;

    // Pending | Confirmed | Cancelled | CheckedIn — giữ dạng chuỗi cho đơn giản ở tuần này.
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
