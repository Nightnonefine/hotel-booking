using HotelBooking.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Hotel> Hotels => Set<Hotel>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Hotel)
            .WithMany(h => h.Bookings)
            .HasForeignKey(b => b.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Hotel>().HasIndex(h => h.City);

        // SQL Server mặc định decimal(18,2); khai báo rõ để giá tiền không bị cắt.
        modelBuilder.Entity<Hotel>().Property(h => h.PricePerNight).HasPrecision(18, 2);

        // Email là định danh đăng nhập -> phải duy nhất ở tầng DB, không chỉ ở code.
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

        // Dữ liệu mẫu để GET /api/hotels có kết quả ngay sau migration.
        modelBuilder.Entity<Hotel>().HasData(
            new Hotel { Id = 1, Name = "Azure Bay Resort", City = "Đà Nẵng", Address = "Võ Nguyên Giáp, Sơn Trà", PricePerNight = 1850000m, Rating = 4.8 },
            new Hotel { Id = 2, Name = "Lotus Boutique Hotel", City = "Hà Nội", Address = "Hàng Bạc, Hoàn Kiếm", PricePerNight = 920000m, Rating = 4.6 },
            new Hotel { Id = 3, Name = "Saigon Riverside Hotel", City = "TP. Hồ Chí Minh", Address = "Tôn Đức Thắng, Quận 1", PricePerNight = 1350000m, Rating = 4.5 },
            new Hotel { Id = 4, Name = "Pine Hill Retreat", City = "Đà Lạt", Address = "Trần Phú, Phường 3", PricePerNight = 780000m, Rating = 4.7 });
    }
}
