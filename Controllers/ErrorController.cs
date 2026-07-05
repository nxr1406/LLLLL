using Microsoft.AspNetCore.Mvc;

namespace Portfolio.Controllers;

public class ErrorController : Controller
{
    [Route("Error/NotFound")]
    public IActionResult NotFound()
    {
        Response.StatusCode = 404;
        return View();
    }
}