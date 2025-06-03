function cargarVista(vista, link) {
    setActiveMenu(link);

    if (vista === 'inicio') {
        document.getElementById('contenido').innerHTML = `
            <h2 class="mt-4 mb-3 fw-bold">Bienvenido al sistema de Venta de Vehículos</h2>
            <p class="lead mb-4">Selecciona una opción en el menú.</p>
        `;
    } else if (vista === 'perfil') {
        const usuario = JSON.parse(sessionStorage.getItem("usuario"));

        document.getElementById('contenido').innerHTML = `
            <div class="container mt-5" id="perfil-container">
                <h2 class="mb-4">Mi Perfil</h2>
                <div class="card">
                    <div class="card-body">
                        <p><strong>Nombre de usuario:</strong> ${usuario.Username}</p>
                        <p><strong>Nombre:</strong> ${usuario.Nombre || 'No disponible'}</p>
                        <p><strong>Email:</strong> ${usuario.Email || 'No disponible'}</p>
                        <p><strong>Rol:</strong> ${usuario.Rol || 'No disponible'}</p>
                    </div>
                </div>
            </div>
        `;
    }
    // ... otros módulos
}
