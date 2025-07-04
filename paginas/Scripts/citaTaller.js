﻿window.CitaTallerApp = (function () {
    const API_BASE = 'http://ventavehiculos.runasp.net/api';
    let listaVehiculos = [];
    let listaCitas = [];

    // Cargar vehículos disponibles en el select. Callback para asegurar orden.
    function cargarVehiculos(callback) {
        fetch(`${API_BASE}/Vehiculo/ListarDisponibles`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(resp => resp.json())
            .then(data => {
                listaVehiculos = data || [];
                const select = document.getElementById('inputVehiculo');
                if (select) {
                    select.innerHTML = '<option value="">Seleccione...</option>';
                    listaVehiculos.forEach(v => {
                        select.innerHTML += `<option value="${v.Codigo}">
                            ${v.MarcaNombre} - ${v.ModeloNombre} (${v.Año})
                        </option>`;
                    });
                }
                if (typeof callback === "function") callback();
            })
            .catch(e => {
                mostrarMensaje("Error cargando vehículos: " + (e.message || e), true);
                if (typeof callback === "function") callback();
            });
    }

    // Consultar y renderizar todas las citas
    function cargarCitas() {
        fetch(`${API_BASE}/CitaTaller/ConsultarTodos`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(resp => resp.json())
            .then(data => {
                listaCitas = data || [];
                renderizarCitas();
            })
            .catch(e => {
                mostrarMensaje("Error cargando citas: " + (e.message || e), true);
            });
    }

    // Renderiza la tabla de citas de taller (con nombre completo del cliente)
    function renderizarCitas() {
        const tbody = document.querySelector("#tablaCitas tbody");
        if (!tbody) return;
        tbody.innerHTML = '';
        if (listaCitas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay citas registradas</td></tr>';
            return;
        }
        listaCitas.forEach(c => {
            const vehiculo = listaVehiculos.find(v => v.Codigo == c.CodigoVehiculo);
            tbody.innerHTML += `
                <tr>
                    <td>${c.Id}</td>
                    <td>
                        <span>${c.NombreCompletoCliente}</span><br>
                        <small class="text-muted">${c.DocumentoCliente}</small>
                    </td>
                    <td>
                        ${c.CodigoVehiculo} - ${c.MarcaNombre} - ${c.ModeloNombre} (${c.Año})
                    </td>
                    <td>${(c.FechaCita || '').substring(0, 10)}</td>
                    <td>${c.Motivo || ''}</td>
                    <td>${c.Estado || ''}</td>
                    <td>${c.Observaciones || '-'}</td>
                    <td>
                        ${c.Estado === 'Pendiente'
                                ? `<button class="btn btn-danger btn-sm" onclick="CitaTallerApp.cancelarCita(${c.Id})"><i class="fa-solid fa-xmark"></i> Cancelar</button>`
                                : '<span class="text-muted">N/A</span>'}
                    </td>
                </tr>
            `;
        });
    }

    // Mostrar mensajes al usuario
    function mostrarMensaje(msg, error = false) {
        const div = document.getElementById('mensaje');
        if (!div) return;
        div.innerHTML = `<div class="alert alert-${error ? 'danger' : 'success'}">${msg}</div>`;
        setTimeout(() => { div.innerHTML = ""; }, 3500);
    }

    // Enviar formulario para nueva cita
    function guardarCita(event) {
        if (event) event.preventDefault();

        const documento = document.getElementById('inputDocumento').value.trim();
        const codigoVehiculo = parseInt(document.getElementById('inputVehiculo').value);
        const fecha = document.getElementById('inputFecha').value;
        const motivo = document.getElementById('inputMotivo').value.trim();

        if (!documento) return mostrarMensaje("Ingrese el documento del cliente", true);
        if (!codigoVehiculo) return mostrarMensaje("Seleccione un vehículo", true);
        if (!fecha) return mostrarMensaje("Seleccione la fecha de la cita", true);
        if (!motivo) return mostrarMensaje("Indique el motivo de la cita", true);

        const data = {
            DocumentoCliente: documento,
            CodigoVehiculo: codigoVehiculo,
            FechaCita: fecha,
            Motivo: motivo,
            Estado: "Pendiente",
            Observaciones: "-"
        };

        fetch(`${API_BASE}/CitaTaller/Insertar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(resp => resp.text())
            .then(text => {
                mostrarMensaje(text, !text.toLowerCase().includes('éxito'));
                if (text.toLowerCase().includes('éxito')) {
                    document.getElementById('formNuevaCita').reset();
                    cargarCitas();
                }
            })
            .catch(e => mostrarMensaje("Error al registrar cita: " + (e.message || e), true));
    }

    // Cancelar una cita de taller (solo si está pendiente)
    function cancelarCita(id) {
        if (!confirm("¿Está seguro de cancelar esta cita?")) return;
        fetch(`${API_BASE}/CitaTaller/Cancelar/${id}`, {
            method: 'POST'
        })
            .then(resp => resp.text())
            .then(text => {
                mostrarMensaje(text, !text.toLowerCase().includes('correctamente'));
                cargarCitas();
            })
            .catch(e => mostrarMensaje("Error al cancelar cita: " + (e.message || e), true));
    }

    // --- Exporta funciones para uso global ---
    return {
        cargarVehiculos,
        cargarCitas,
        cancelarCita,
        guardarCita
    };

})();

// --- Inicialización flexible para carga dinámica de vistas (SPA y carga directa) ---
function inicializarCitaTaller() {
    console.log("[CitaTaller] Inicializando...");
    if (window.CitaTallerApp) {
        // ATENCIÓN: Cargar vehículos y SOLO cuando estén listos, cargar las citas:
        window.CitaTallerApp.cargarVehiculos(() => {
            window.CitaTallerApp.cargarCitas();
        });
    }
    const form = document.getElementById('formNuevaCita');
    if (form) {
        form.onsubmit = null;
        form.addEventListener('submit', function (event) {
            if (window.CitaTallerApp && window.CitaTallerApp.guardarCita) {
                window.CitaTallerApp.guardarCita(event);
            }
        });
    }

    // --- Autocompletar documento de cliente si es cliente ---
    const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");
    const perfil = (usuario.Perfil || usuario.perfil || "").toLowerCase();
    const username = usuario.Usuario || usuario.Username || usuario.usuario || "";
    console.log("[CitaTaller] Perfil detectado:", perfil);
    console.log("[CitaTaller] Username detectado:", username);

    if (perfil === "cliente" && username) {
        console.log("[CitaTaller] Es cliente, autocompletando documento...");
        fetch(`http://ventavehiculos.runasp.net/api/Usuario/ObtenerDocumentoPorUsername/${username}`)
            .then(resp => resp.ok ? resp.text() : "")
            .then(documento => {
                console.log("[CitaTaller] Documento recibido:", documento);
                const inputDoc = document.getElementById('inputDocumento');
                if (inputDoc) {
                    inputDoc.value = documento.replace(/^"(.*)"$/, '$1');
                    inputDoc.readOnly = true;
                }
            });
    } else {
        console.log("[CitaTaller] No es cliente o falta username, no autocompleta documento");
    }
}

// Si cargas la página directamente, también inicializa
document.addEventListener('DOMContentLoaded', inicializarCitaTaller);
