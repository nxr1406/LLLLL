using Microsoft.AspNetCore.Mvc;

namespace Portfolio.Controllers;

public class ErrorController : Controller
{
    [Route("Error/NotFound")]
    public IActionResult PageNotFound()
    {
        Response.StatusCode = 404;
        return View();
    }
}