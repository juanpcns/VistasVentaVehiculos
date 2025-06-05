document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const mensaje = document.getElementById("dvMensaje");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        mensaje.className = "";
        mensaje.textContent = "";

        const usuario = document.getElementById("txtUsername").value.trim();
        const clave = document.getElementById("txtClave").value.trim();

        if (!usuario || !clave) {
            mensaje.className = "text-danger";
            mensaje.textContent = "Debes ingresar usuario y clave.";
            return;
        }

        // Aquí cambia la URL a la de tu API si es diferente
        fetch("http://ventavehiculos.runasp.net/api/login/Ingresar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Usuario: usuario,
                Clave: clave
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.Autenticado) {
                    // Guarda el usuario en sessionStorage
                    sessionStorage.setItem("usuario", JSON.stringify(data));
                    mensaje.className = "text-success";
                    mensaje.textContent = "Bienvenido, redirigiendo...";
                    setTimeout(() => {
                        window.location.href = "Home.html";
                    }, 900);
                } else {
                    mensaje.className = "text-danger";
                    mensaje.textContent = data.Mensaje || "Usuario o clave incorrectos.";
                }
            })
            .catch(() => {
                mensaje.className = "text-danger";
                mensaje.textContent = "Error conectando al servidor. Intenta más tarde.";
            });
    });
});
