using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;

var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Urls.Add($"http://0.0.0.0:{port}");

var builder = WebApplication.CreateBuilder(args);

// অ্যাপ তৈরি
var app = builder.Build();

// wwwroot থেকে Static Files সার্ভ করবে
app.UseDefaultFiles();   // index.html ডিফল্ট হিসেবে খুলবে
app.UseStaticFiles();

// Optional: Health Check Route
app.MapGet("/api/status", () =>
{
    return Results.Ok(new
    {
        Status = "Running",
        Framework = ".NET",
        Time = DateTime.UtcNow
    });
});

// অ্যাপ চালু
app.Run();