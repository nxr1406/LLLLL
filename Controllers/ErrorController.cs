using Microsoft.AspNetCore.Mvc;

namespace Portfolio.Controllers;

public class ErrorController : Controller
{
    [Route("Error/PageNotFound")]
    public IActionResult PageNotFound()
    {
        Response.StatusCode = 404;
        return View("NotFound");
    }
}