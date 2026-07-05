# ॐ SANATAN EDITION — Community Website

A premium ASP.NET Core MVC landing page for **SANATAN EDITION**, a Hindu creative editing community focused on video editing content, preset sharing, and community building (Alight Motion / After Effects).

## Tech Stack

- **ASP.NET Core MVC** (.NET 8)
- **Tailwind CSS** (via CDN)
- **Vanilla JavaScript** (scroll reveal, mobile menu, TikTok embeds)

## Project Structure

```
Portfolio/
├── Controllers/
│   └── HomeController.cs
├── Models/
│   └── ErrorViewModel.cs
├── Views/
│   ├── Home/
│   │   ├── Index.cshtml
│   │   ├── _Hero.cshtml
│   │   ├── _Features.cshtml
│   │   ├── _Portfolio.cshtml
│   │   ├── _About.cshtml
│   │   ├── _Team.cshtml
│   │   ├── _CTA.cshtml
│   │   └── _Contact.cshtml
│   ├── Shared/
│   │   ├── _Layout.cshtml
│   │   ├── _Navigation.cshtml
│   │   ├── _Footer.cshtml
│   │   ├── Error.cshtml
│   │   └── _ValidationScriptsPartial.cshtml
│   ├── _ViewImports.cshtml
│   └── _ViewStart.cshtml
├── wwwroot/
│   ├── Js/main.js
│   ├── fav.svg
│   ├── OG_IMAGE.png
│   ├── OWNER.jpg
│   ├── ANU.jpg
│   └── TANU.jpg
├── Program.cs
├── Portfolio.csproj
├── Dockerfile
└── README.md
```

## Running Locally

```bash
dotnet restore
dotnet run
```

Then open `https://localhost:5001` (or the port shown in the console).

## Running with Docker

```bash
docker build -t sanatan-edition .
docker run -p 8080:8080 sanatan-edition
```

Then open `http://localhost:8080`.

## Notes

- All page sections (Hero, Features, Portfolio, About, Team, CTA) are rendered as partial views inside `Views/Home/Index.cshtml`.
- The contact section currently lives inside the footer (`_Footer.cshtml`, `id="contact"`); `_Contact.cshtml` is a placeholder reserved for a future dedicated form.
- TikTok video embeds are loaded via `https://www.tiktok.com/embed.js` in `_Layout.cshtml`.

## License

© Ensor-X (Nirob Sarkar). All Rights Reserved.
