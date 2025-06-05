window.CitasFacturaApp = (function () {
    const API_BASE = 'http://ventavehiculos.runasp.net/api';
    let listaCitas = [];
    let modalFinalizar, formFinalizar;

    // Simulación: aquí deberías consultar si el vehículo tiene garantía activa según la cita
    // Puedes obtenerlo del backend, aquí lo pongo manual (true/false)
    function tieneGarantiaActiva(cita) {
        // Reemplaza por tu lógica real (consulta Garantia por CodigoVehiculo, etc)
        return cita.EstadoGarantia === "Activa"; // O similar
    }

    function mostrarMensaje(msg, error = false) {
        const div = document.getElementById('mensajeFinalizarCita');
        if (!div) return;
        div.innerHTML = `<div class="alert alert-${error ? 'danger' : 'success'}">${msg}</div>`;
        setTimeout(() => { div.innerHTML = ""; }, 3500);
    }

    function renderizarCitas() {
        const tbody = document.querySelector("#tablaCitasFinalizar tbody");
        if (!tbody) return;
        tbody.innerHTML = '';
        if (!listaCitas || listaCitas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay citas aprobadas para finalizar</td></tr>';
            return;
        }
        listaCitas.forEach(c => {
            // Solo habilita para citas "Aprobada"
            const esAprobada = c.Estado && c.Estado.toLowerCase() === "aprobada";
            tbody.innerHTML += `
                <tr>
                    <td>${c.Id}</td>
                    <td>${c.DocumentoCliente}</td>
                    <td>${c.MarcaNombre && c.ModeloNombre
                    ? (c.MarcaNombre + ' - ' + c.ModeloNombre + ' (' + c.Año + ')')
                    : c.CodigoVehiculo}</td>
                    <td>${(c.FechaCita || '').substring(0, 10)}</td>
                    <td>${c.Motivo || ''}</td>
                    <td>${c.Estado || ''}</td>
                    <td>
                        ${esAprobada ? `
                        <button class="btn btn-primary btn-sm" onclick="CitasFacturaApp.abrirModalFinalizar(${c.Id})">
                            <i class="fa-solid fa-file-invoice-dollar"></i> Finalizar
                        </button>
                        ` : `<span class="text-muted">-</span>`}
                    </td>
                </tr>
            `;
        });
    }

    function cargarCitas() {
        // Suponiendo que tienes un endpoint para obtener citas aprobadas, si no usa ConsultarTodos y filtra aquí
        fetch(`${API_BASE}/CitaTaller/ConsultarTodos`)
            .then(resp => resp.json())
            .then(data => {
                listaCitas = (data || []).filter(c => c.Estado && c.Estado.toLowerCase() === "aprobada");
                renderizarCitas();
            })
            .catch(e => mostrarMensaje("Error cargando citas: " + (e.message || e), true));
    }

    function abrirModalFinalizar(idCita) {
        const cita = listaCitas.find(c => c.Id === idCita);
        if (!cita) return mostrarMensaje("Cita no encontrada", true);

        document.getElementById('finalizarIdCita').value = idCita;
        document.getElementById('finalizarDescripcionServicio').value = '';
        document.getElementById('finalizarPrecioReparacion').value = '';
        // Decide si mostrar el campo de precio
        const garantia = tieneGarantiaActiva(cita);
        document.getElementById('campoPrecioReparacion').style.display = garantia ? 'none' : 'block';

        if (!modalFinalizar) modalFinalizar = new bootstrap.Modal(document.getElementById('modalFinalizarCita'));
        modalFinalizar.show();
    }

    function finalizarCita(event) {
        event.preventDefault();
        const idCita = parseInt(document.getElementById('finalizarIdCita').value);
        const descripcionServicio = document.getElementById('finalizarDescripcionServicio').value.trim();
        const precioReparacion = document.getElementById('finalizarPrecioReparacion').value.trim();
        // Busca la cita para saber si tiene garantía
        const cita = listaCitas.find(c => c.Id === idCita);
        const garantia = tieneGarantiaActiva(cita);

        let observaciones = "Servicio: " + descripcionServicio;
        if (!garantia) {
            if (!precioReparacion || isNaN(precioReparacion) || Number(precioReparacion) < 0)
                return mostrarMensaje("Debes ingresar el precio de la reparación.", true);
            observaciones += " | Precio reparación: $" + precioReparacion;
        } else {
            observaciones += " | Reparación cubierta por garantía.";
        }

        fetch(`${API_BASE}/CitaTaller/Finalizar/${idCita}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(observaciones)
        })
            .then(resp => resp.text())
            .then(text => {
                mostrarMensaje(text, !text.toLowerCase().includes('correctamente'));
                if (text.toLowerCase().includes('correctamente')) {
                    if (modalFinalizar) modalFinalizar.hide();
                    cargarCitas();
                }
            })
            .catch(e => mostrarMensaje("Error al guardar servicio: " + (e.message || e), true));
    }

    function inicializar() {
        cargarCitas();
        formFinalizar = document.getElementById('formFinalizarCita');
        if (formFinalizar) formFinalizar.onsubmit = finalizarCita;
    }

    return { inicializar, abrirModalFinalizar };
})();

document.addEventListener('DOMContentLoaded', CitasFacturaApp.inicializar);
