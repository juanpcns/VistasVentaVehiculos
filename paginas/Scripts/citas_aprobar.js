window.CitasAprobarApp = (function () {
    const API_BASE = 'http://ventavehiculos.runasp.net/api';
    let listaCitas = [];
    let modalAprobar, formAprobar, modalRechazar, formRechazar;
    let verPendientes = true; // Estado: true = pendientes, false = todas

    function mostrarMensaje(msg, error = false) {
        const div = document.getElementById('mensajeAprobarCita');
        if (!div) return;
        div.innerHTML = `<div class="alert alert-${error ? 'danger' : 'success'}">${msg}</div>`;
        setTimeout(() => { div.innerHTML = ""; }, 3500);
    }

    function renderizarCitas() {
        const tbody = document.querySelector("#tablaCitas tbody");
        if (!tbody) return;
        tbody.innerHTML = '';
        if (!listaCitas || listaCitas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay citas registradas</td></tr>';
            return;
        }
        listaCitas.forEach(c => {
            const esPendiente = c.Estado && c.Estado.toLowerCase() === "pendiente";
            tbody.innerHTML += `
                <tr>
                    <td>${c.Id}</td>
                    <td>${c.DocumentoCliente}</td>
                    <td>${c.CodigoVehiculo}</td>
                    <td>${(c.FechaCita || '').substring(0, 10)}</td>
                    <td>${c.Motivo || ''}</td>
                    <td>${c.Estado || ''}</td>
                    <td>${c.Observaciones || ''}</td>
                    <td>
                        ${esPendiente ? `
                        <button class="btn btn-success btn-sm me-1" onclick="CitasAprobarApp.abrirModalAprobar(${c.Id})">
                            <i class="fa-solid fa-check"></i> Aprobar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="CitasAprobarApp.abrirModalRechazar(${c.Id})">
                            <i class="fa-solid fa-xmark"></i> Rechazar
                        </button>
                        ` : `<span class="text-muted">-</span>`}
                    </td>
                </tr>
            `;
        });
    }

    function cargarCitas() {
        const endpoint = verPendientes
            ? `${API_BASE}/CitaTaller/ConsultarPendientes`
            : `${API_BASE}/CitaTaller/ConsultarTodos`;

        fetch(endpoint)
            .then(resp => resp.json())
            .then(data => {
                listaCitas = data || [];
                renderizarCitas();
            })
            .catch(e => mostrarMensaje("Error cargando citas: " + (e.message || e), true));
    }

    function abrirModalAprobar(idCita) {
        document.getElementById('aprobarIdCita').value = idCita;
        document.getElementById('aprobarObservaciones').value = "";
        document.getElementById('aprobarPorGarantia').checked = false;
        document.getElementById('aprobarDescripcionProblema').value = "";
        document.getElementById('campoDescripcionProblema').style.display = 'none';
        if (!modalAprobar) modalAprobar = new bootstrap.Modal(document.getElementById('modalAprobarCita'));
        modalAprobar.show();
    }

    function onCheckPorGarantia() {
        const checked = document.getElementById('aprobarPorGarantia').checked;
        document.getElementById('campoDescripcionProblema').style.display = checked ? 'block' : 'none';
    }

    function aprobarCita(event) {
        event.preventDefault();
        const IdCita = parseInt(document.getElementById('aprobarIdCita').value);
        const Observaciones = document.getElementById('aprobarObservaciones').value.trim();
        const EsPorGarantia = document.getElementById('aprobarPorGarantia').checked;
        const DescripcionProblema = document.getElementById('aprobarDescripcionProblema').value.trim();

        if (EsPorGarantia && !DescripcionProblema)
            return mostrarMensaje("Debe ingresar la descripción del problema para el reclamo de garantía.", true);

        const data = { IdCita, Observaciones, EsPorGarantia, DescripcionProblema };

        fetch(`${API_BASE}/CitaTaller/Aprobar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(resp => resp.text())
            .then(text => {
                mostrarMensaje(text, !text.toLowerCase().includes('aprobada'));
                if (text.toLowerCase().includes('aprobada')) {
                    if (modalAprobar) modalAprobar.hide();
                    cargarCitas();
                }
            })
            .catch(e => mostrarMensaje("Error al aprobar cita: " + (e.message || e), true));
    }

    function abrirModalRechazar(idCita) {
        document.getElementById('rechazarIdCita').value = idCita;
        document.getElementById('rechazarObservaciones').value = "";
        if (!modalRechazar) modalRechazar = new bootstrap.Modal(document.getElementById('modalRechazarCita'));
        modalRechazar.show();
    }

    function rechazarCita(event) {
        event.preventDefault();
        const id = parseInt(document.getElementById('rechazarIdCita').value);
        const observaciones = document.getElementById('rechazarObservaciones').value.trim();
        if (!observaciones) return mostrarMensaje("Debes ingresar el motivo del rechazo.", true);

        fetch(`${API_BASE}/CitaTaller/Rechazar/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(observaciones)
        })
            .then(resp => resp.text())
            .then(text => {
                mostrarMensaje(text, !text.toLowerCase().includes('rechazada'));
                if (text.toLowerCase().includes('rechazada')) {
                    if (modalRechazar) modalRechazar.hide();
                    cargarCitas();
                }
            })
            .catch(e => mostrarMensaje("Error al rechazar cita: " + (e.message || e), true));
    }

    function inicializar() {
        // Botones para ver todas o solo pendientes
        document.getElementById('btnVerPendientes').onclick = function () {
            verPendientes = true;
            cargarCitas();
        };
        document.getElementById('btnVerTodas').onclick = function () {
            verPendientes = false;
            cargarCitas();
        };
        cargarCitas();

        // Modal aprobar
        formAprobar = document.getElementById('formAprobarCita');
        if (formAprobar) {
            formAprobar.onsubmit = aprobarCita;
        }
        document.getElementById('aprobarPorGarantia').addEventListener('change', onCheckPorGarantia);

        // Modal rechazar
        formRechazar = document.getElementById('formRechazarCita');
        if (formRechazar) {
            formRechazar.onsubmit = rechazarCita;
        }
    }

    return { inicializar, abrirModalAprobar, abrirModalRechazar };
})();

document.addEventListener('DOMContentLoaded', CitasAprobarApp.inicializar);
