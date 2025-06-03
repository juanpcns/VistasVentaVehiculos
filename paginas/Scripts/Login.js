async function Ingresar() {
    let BaseURL = "http://ventavehiculos.runasp.net";
    let URL = BaseURL + "/api/login/Ingresar";
    const login = new Login($("#txtUsername").val(), $("#txtClave").val());

    let Respuesta = null;

    try {
        Respuesta = await EjecutarComandoServicioRpta("POST", URL, login);
    } catch (error) {
        Respuesta = null;
    }

    // Manejo si la respuesta es un array (según tu backend, corrígelo si es necesario)
    if (Respuesta && Array.isArray(Respuesta)) {
        Respuesta = Respuesta[0];
    }

    if (!Respuesta) {
        $("#dvMensaje")
            .removeClass("alert-success")
            .addClass("alert alert-danger")
            .html("No se pudo conectar con el servicio.");
        return;
    }

    if (Respuesta.Autenticado === true) {
        // Login exitoso
        $("#dvMensaje")
            .removeClass("alert-danger")
            .addClass("alert alert-success")
            .html("Bienvenido, " + (Respuesta.Username || "") + "!");

        // Aquí puedes guardar cookies o redirigir
        // Por ejemplo:
        // window.location.href = "/Home/Index";
    } else {
        // Login fallido (credenciales inválidas, etc.)
        $("#dvMensaje")
            .removeClass("alert-success")
            .addClass("alert alert-danger")
            .html(Respuesta.Mensaje || "Usuario o clave inválidos.");
    }
}

class Login {
    constructor(Username, Clave) {
        this.Username = Username;
        this.Clave = Clave;
    }
}
