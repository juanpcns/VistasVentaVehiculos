window.PedidosApp = (function () {
    const API_BASE = 'http://ventavehiculos.runasp.net/api';
    let carrito = [];
    let listaVehiculos = [];

    // -------------- AUTOCOMPLETAR DOCUMENTO DEL CLIENTE --------------
    function autocompletarDocumentoCliente() {
        const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");
        const username = usuario.Usuario || usuario.Username || "";

        if (username) {
            fetch(`${API_BASE}/Usuario/ObtenerDocumentoPorUsername/${encodeURIComponent(username)}`)
                .then(resp => resp.ok ? resp.text() : "")
                .then(documento => {
                    const inputDoc = document.getElementById('pedidoDocumentoCliente');
                    if (documento && inputDoc) {
                        // Quita comillas si vienen del backend como string JSON
                        inputDoc.value = documento.replace(/^"(.*)"$/, '$1');
                        inputDoc.readOnly = true; // Para que no lo pueda editar el usuario
                    }
                });
        }
    }

    // ----------- Cargar vehículos y llenar el <select> -----------
    function cargarVehiculos() {
        fetch(`${API_BASE}/Vehiculo/ListarDisponibles`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(resp => resp.json())
            .then(data => {
                listaVehiculos = data || [];
                const select = document.getElementById('selectVehiculo');
                if (!select) return;
                select.innerHTML = '<option value="">Seleccione...</option>';
                listaVehiculos.forEach(v => {
                    select.innerHTML += `<option value="${v.Codigo}">
                        ${v.MarcaNombre} - ${v.ModeloNombre} (${v.Año}) - $${v.ValorUnitario}
                    </option>`;
                });
            });
    }

    function agregarAlCarrito() {
        const codigoVehiculo = parseInt(document.getElementById('selectVehiculo').value);
        const cantidad = parseInt(document.getElementById('inputCantidad').value);

        if (!codigoVehiculo) {
            alert("Seleccione un vehículo.");
            return;
        }
        if (!cantidad || cantidad < 1) {
            alert("Ingrese una cantidad válida.");
            return;
        }
        const yaExiste = carrito.find(item => item.CodigoVehiculo === codigoVehiculo);
        if (yaExiste) {
            yaExiste.Cantidad += cantidad;
        } else {
            carrito.push({ CodigoVehiculo: codigoVehiculo, Cantidad: cantidad });
        }
        renderizarCarrito();
    }

    function eliminarDeCarrito(idx) {
        carrito.splice(idx, 1);
        renderizarCarrito();
    }

    function renderizarCarrito() {
        const tbody = document.querySelector("#tablaCarrito tbody");
        if (!tbody) return;
        tbody.innerHTML = '';
        if (carrito.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Agregue vehículos al carrito</td></tr>';
            return;
        }
        carrito.forEach((item, idx) => {
            const vehiculo = listaVehiculos.find(v => v.Codigo == item.CodigoVehiculo);
            tbody.innerHTML += `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${vehiculo ? (vehiculo.MarcaNombre + ' - ' + vehiculo.ModeloNombre + ' (' + vehiculo.Año + ')') : item.CodigoVehiculo}</td>
                    <td>${vehiculo ? '$' + vehiculo.ValorUnitario : '-'}</td>
                    <td>${item.Cantidad}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="PedidosApp.eliminarDeCarrito(${idx})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    function limpiarFormulario() {
        document.getElementById('pedidoObservaciones').value = '';
        document.getElementById('selectVehiculo').selectedIndex = 0;
        document.getElementById('inputCantidad').value = 1;
        carrito = [];
        renderizarCarrito();
    }

    function guardarPedido(event) {
        event.preventDefault();
        const documento = document.getElementById('pedidoDocumentoCliente').value.trim();
        const observaciones = document.getElementById('pedidoObservaciones').value.trim();
        if (!documento) {
            alert("No se pudo detectar el documento del cliente.");
            return;
        }
        if (carrito.length === 0) {
            alert("Debe agregar al menos un vehículo al pedido.");
            return;
        }
        const data = {
            pedido: {
                DocumentoCliente: documento,
                Observaciones: observaciones
            },
            detalles: carrito.map(item => ({
                CodigoVehiculo: item.CodigoVehiculo,
                Cantidad: item.Cantidad
            }))
        };
        fetch(`${API_BASE}/Pedido/Insertar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(async resp => {
                const text = await resp.text();
                alert(text);
                if (text && text.toLowerCase().includes('exitosamente')) {
                    limpiarFormulario();
                    cargarVehiculos();
                }
            })
            .catch(e => {
                alert("Error registrando pedido:\n" + (e.message || e));
            });
    }

    // --- Expone funciones para uso externo ---
    return {
        agregarAlCarrito,
        eliminarDeCarrito,
        guardarPedido,
        cargarVehiculos,
        autocompletarDocumentoCliente
    };
})();

// Si la función cargarVehiculos no está en global, la expone (para Home)
if (!window.cargarVehiculos) {
    window.cargarVehiculos = window.PedidosApp.cargarVehiculos;
}
