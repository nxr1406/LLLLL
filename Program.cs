var builder = WebApplication.CreateBuilder(args);

// =========================
// Future Admin Credentials
// =========================
string username = "COMMING_SOON";
string password = "COMMING_SOON";

// Add services to the container.
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Redirect all /blog requests to coming.html
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/blog"))
    {
        context.Response.Redirect("/coming.html");
        return;
    }

    await next();
});

app.UseAuthorization();

app.UseStatusCodePagesWithReExecute("/Error/PageNotFound");

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();