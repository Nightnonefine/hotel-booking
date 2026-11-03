using System.ComponentModel.DataAnnotations;

namespace HotelBooking.Api.Models;

public class Hotel
{
    public int Id { get; set; }

    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string City { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    [Range(0, 1_000_000_000)]
    public decimal PricePerNight { get; set; }

    [Range(0, 5)]
    public double Rating { get; set; }

    public List<Booking> Bookings { get; set; } = new();
}
