function setActiveMenu(link) {
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
}

function cargarVista(vista, link) {
    if (link) setActiveMenu(link);
    const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");
    const nombre = usuario?.Usuario || usuario?.Username || "Invitado";
    const perfil = usuario?.Perfil || usuario?.perfil || "";

    if (vista === 'inicio') {
        document.getElementById('contenido').innerHTML = `
            <h2 class="mt-4 mb-3 fw-bold">¡Bienvenido, ${nombre}${perfil ? " (" + perfil + ")" : ""}!</h2>
            <p class="lead mb-4">Selecciona una opción en el menú.</p>
            <section class="hero">
                <div class="hero-text">
                    <h1>Encuentra el vehículo de tus sueños</h1>
                    <p>Compra y vende autos fácilmente, al mejor precio y con seguridad garantizada.</p>
                    <a href="#" class="btn" onclick="cargarVista('vehiculos', document.getElementById('menu-vehiculos'));">Ver vehículos</a>
                </div>
                <div class="hero-image">
                    <img id="banner-img" src="Estilos/webfonts/BMW.jpg" alt="Vehículo destacado" style="max-width:100%;border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,0.1);">
                </div>
            </section>
            <section class="features">
                <div class="feature">
                    <i class="fa-solid fa-tags"></i>
                    <h3>Los Mejores Precios</h3>
                    <p>Compara entre cientos de opciones y encuentra tu mejor oferta.</p>
                </div>
                <div class="feature">
                    <i class="fa-solid fa-shield-halved"></i>
                    <h3>Compra Segura</h3>
                    <p>Transacciones seguras con asesoramiento profesional.</p>
                </div>
                <div class="feature">
                    <i class="fa-solid fa-tools"></i>
                    <h3>Revisión Mecánica</h3>
                    <p>Vehículos inspeccionados y listos para conducir.</p>
                </div>
            </section>
        `;
    } else if (vista === 'vehiculos') {
        fetch('vehiculos.html')
            .then(r => r.text())
            .then(html => {
                document.getElementById('contenido').innerHTML = html;
                let oldScript = document.getElementById('vehiculos-script');
                if (oldScript) oldScript.remove();
                var script = document.createElement('script');
                script.src = 'Scripts/Vehiculos.js';
                script.id = 'vehiculos-script';
                script.onload = function () {
                    console.log('Vehiculos.js cargado y ejecutado');
                };
                document.body.appendChild(script);
            });
    } else if (vista === 'pedidos') {
        fetch('pedidos.html')
            .then(r => r.text())
            .then(html => {
                document.getElementById('contenido').innerHTML = html;
                let oldScript = document.getElementById('pedidos-script');
                if (oldScript) oldScript.remove();
                var script = document.createElement('script');
                script.src = 'Scripts/Pedidos.js';
                script.id = 'pedidos-script';
                script.onload = function () {
                    setTimeout(function () {
                        // Cargar los vehículos (como antes)
                        if (window.cargarVehiculos) {
                            window.cargarVehiculos();
                        } else if (window.PedidosApp && window.PedidosApp.cargarVehiculos) {
                            window.PedidosApp.cargarVehiculos();
                        }
                        // ---- NUEVO: autocompletar documento cliente ----
                        if (window.PedidosApp && typeof window.PedidosApp.autocompletarDocumentoCliente === "function") {
                            window.PedidosApp.autocompletarDocumentoCliente();
                            console.log("[Pedidos] Se llamó a autocompletarDocumentoCliente");
                        } else {
                            console.log("[Pedidos] La función autocompletarDocumentoCliente NO está disponible");
                        }
                    }, 100);
                };
                document.body.appendChild(script);
            });
} else if (vista === 'pedidos_aprobar') {
        fetch('pedidos_aprobar.html')
            .then(r => r.text())
            .then(html => {
                document.getElementById('contenido').innerHTML = html;
                let oldScript = document.getElementById('pedidos-aprobar-script');
                if (oldScript) oldScript.remove();
                var script = document.createElement('script');
                script.src = 'Scripts/pedidos_aprobar.js';
                script.id = 'pedidos-aprobar-script';
                script.onload = function () {
                    if (window.PedidosAprobarApp && typeof window.PedidosAprobarApp.cargarPedidosPendientes === 'function') {
                        window.PedidosAprobarApp.cargarPedidosPendientes();
                    }
                };
                document.body.appendChild(script);
            });
    } else if (vista === 'facturacion') {
        fetch('facturacion.html')
            .then(r => r.text())
            .then(html => {
                document.getElementById('contenido').innerHTML = html;
                let oldScript = document.getElementById('facturacion-script');
                if (oldScript) oldScript.remove();
                var script = document.createElement('script');
                script.src = 'Scripts/Facturacion.js';
                script.id = 'facturacion-script';
                document.body.appendChild(script);
            });
    } else if (vista === 'mis_pedidos') {
        fetch('mis_pedidos.html')
            .then(r => r.text())
            .then(html => {
                document.getElementById('contenido').innerHTML = html;
                let oldScript = document.getElementById('mis-pedidos-script');
                if (oldScript) oldScript.remove();
                var script = document.createElement('script');
                script.src = 'Scripts/mis_pedidos.js';
                script.id = 'mis-pedidos-script';
                document.body.appendChild(script);
            });
    } else if (vista === 'perfil') {
        fetch('perfil.html')
            .then(r => r.text())
            .then(html => {
                document.getElementById('contenido').innerHTML = html;
                let oldScript = document.getElementById('perfil-script');
                if (oldScript) oldScript.remove();
                var script = document.createElement('script');
                script.src = 'Scripts/Perfil.js';
                script.id = 'perfil-script';
                document.body.appendChild(script);
            });
    } else if (vista === 'citaTaller') {
        fetch('citaTaller.html')
            .then(r => r.text())
            .then(html => {
                document.getElementById('contenido').innerHTML = html;

                let oldScript = document.getElementById('citaTaller-script');
                if (oldScript) oldScript.remove();

                var script = document.createElement('script');
                script.src = 'Scripts/citaTaller.js';
                script.id = 'citaTaller-script';
                script.onload = function () {
                    // ¡AQUÍ DEBES LLAMAR!
                    if (typeof inicializarCitaTaller === 'function') {
                        inicializarCitaTaller();
                    }
                };
                document.body.appendChild(script);
            });
    }
    else if (vista === 'garantia') {
        fetch('garantia.html')
            .then(r => r.text())
            .then(html => {
                document.getElementById('contenido').innerHTML = html;
                let oldScript = document.getElementById('garantia-script');
                if (oldScript) oldScript.remove();
                var script = document.createElement('script');
                script.src = 'Scripts/garantia.js';
                script.id = 'garantia-script';
                script.onload = function () {
                    if (window.GarantiaApp && typeof window.GarantiaApp.inicializar === 'function') {
                        window.GarantiaApp.inicializar();
                    }
                };
                document.body.appendChild(script);
            });
    }
    else if (vista === 'citas_aprobar') {
        fetch('citas_aprobar.html')
            .then(r => r.text())
            .then(html => {
                document.getElementById('contenido').innerHTML = html;
                let oldScript = document.getElementById('citas-aprobar-script');
                if (oldScript) oldScript.remove();
                var script = document.createElement('script');
                script.src = 'Scripts/citas_aprobar.js';
                script.id = 'citas-aprobar-script';
                script.onload = function () {
                    if (window.CitasAprobarApp && typeof window.CitasAprobarApp.inicializar === 'function') {
                        window.CitasAprobarApp.inicializar();
                    }
                };
                document.body.appendChild(script);
            });
    }
    else if (vista === 'citas_factura') {
        fetch('citas_factura.html')
            .then(r => r.text())
            .then(html => {
                document.getElementById('contenido').innerHTML = html;
                let oldScript = document.getElementById('citas-factura-script');
                if (oldScript) oldScript.remove();
                var script = document.createElement('script');
                script.src = 'Scripts/citas_factura.js';
                script.id = 'citas-factura-script';
                script.onload = function () {
                    if (window.CitasFacturaApp && typeof window.CitasFacturaApp.inicializar === 'function') {
                        window.CitasFacturaApp.inicializar();
                    }
                };
                document.body.appendChild(script);
            });
    }


    else {
        document.getElementById('contenido').innerHTML = `
            <div class="alert alert-secondary">Módulo en construcción (${vista})</div>
        `;
    }
}

window.onload = function () {
    const usuario = JSON.parse(sessionStorage.getItem("usuario") || "null");
    const lblUsuario = document.getElementById("lblUsuario");
    const btnLogout = document.getElementById("btnLogout");

    // Valida ambos campos (Username o Usuario) para evitar ciclo infinito de Login
    if (!usuario || (!usuario.Username && !usuario.Usuario)) {
        window.location.href = "Login.html";
        return;
    }

    lblUsuario.textContent = (usuario.Username || usuario.Usuario) + " - " + (usuario.Perfil || usuario.perfil || "");

    // Restricciones por perfil (robusto para cualquier mayúscula/minúscula)
    const perfil = usuario.Perfil || usuario.perfil || "";
    if (perfil === "Cliente") {
        ["menu-aprobar-pedidos", "menu-facturacion", "menu-usuarios", "menu-reportes"].forEach(id => ocultarMenu(id));
    } else if (perfil === "Vendedor") {
        ["menu-aprobar-pedidos", "menu-usuarios", "menu-reportes"].forEach(id => ocultarMenu(id));
    }
    // Administrador ve todo

    function ocultarMenu(id) {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    }

    btnLogout.addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "Login.html";
    });

    cargarVista('inicio', document.getElementById('menu-inicio'));
};