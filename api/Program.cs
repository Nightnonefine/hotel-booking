using HotelBooking.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Chuỗi kết nối nằm trong appsettings.json -> ConnectionStrings:Default, không hardcode.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

// React (Vite) chạy cổng 3000 khi demo theo đề bài, 5173 là cổng mặc định của Vite.
// Có cả 127.0.0.1 vì trình duyệt coi localhost và 127.0.0.1 là hai origin khác nhau.
builder.Services.AddCors(options => options.AddPolicy("spa", policy =>
    policy.WithOrigins(
              "http://localhost:3000", "http://127.0.0.1:3000",
              "http://localhost:5173", "http://127.0.0.1:5173")
          .AllowAnyHeader()
          .AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("spa");
app.MapControllers();

app.Run();
