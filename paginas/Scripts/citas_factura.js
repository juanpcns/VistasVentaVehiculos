window.CitasFacturaApp = (function () {
    const API_BASE = 'http://ventavehiculos.runasp.net/api';
    let listaCitas = [];
    let verFinalizadas = false;
    let modalFinalizar, formFinalizar;

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
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay citas para mostrar</td></tr>';
            return;
        }
        listaCitas.forEach(c => {
            const esAprobada = c.Estado && c.Estado.toLowerCase() === "aprobada";
            const esFinalizada = c.Estado && c.Estado.toLowerCase() === "finalizada";
            tbody.innerHTML += `
                <tr>
                    <td>${c.Id}</td>
                    <td>
                        <span>${c.NombreCompletoCliente || ""}</span><br>
                        <small class="text-muted">${c.DocumentoCliente || ""}</small>
                    </td>
                    <td>${c.MarcaNombre && c.ModeloNombre
                    ? (c.MarcaNombre + ' - ' + c.ModeloNombre + ' (' + c.Año + ')')
                    : c.CodigoVehiculo}</td>
                    <td>${(c.FechaCita || '').substring(0, 10)}</td>
                    <td>${c.Motivo || ''}</td>
                    <td>${c.Estado || ''}</td>
                    <td>
                        ${esAprobada && !verFinalizadas ? `
                            <button class="btn btn-primary btn-sm" onclick="CitasFacturaApp.abrirModalFinalizar(${c.Id})">
                                <i class="fa-solid fa-file-invoice-dollar"></i> Finalizar
                            </button>
                        ` : esFinalizada && verFinalizadas ? `
                            <button class="btn btn-info btn-sm" onclick="CitasFacturaApp.verFactura(${c.Id})">
                                <i class="fa-solid fa-receipt"></i> Ver factura
                            </button>
                        ` : `<span class="text-muted">-</span>`}
                    </td>
                </tr>
            `;
        });
    }

    function cargarCitas() {
        fetch(`${API_BASE}/CitaTaller/ConsultarTodos`)
            .then(resp => resp.json())
            .then(data => {
                if (verFinalizadas) {
                    listaCitas = (data || []).filter(c => c.Estado && c.Estado.toLowerCase() === "finalizada");
                } else {
                    listaCitas = (data || []).filter(c => c.Estado && c.Estado.toLowerCase() === "aprobada");
                }
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
        // Si tienes la lógica de garantía, aquí la usas para mostrar/ocultar el precio
        document.getElementById('campoPrecioReparacion').style.display = 'block';

        if (!modalFinalizar) modalFinalizar = new bootstrap.Modal(document.getElementById('modalFinalizarCita'));
        modalFinalizar.show();
    }

    function finalizarCita(event) {
        event.preventDefault();
        const idCita = parseInt(document.getElementById('finalizarIdCita').value);
        const descripcionServicio = document.getElementById('finalizarDescripcionServicio').value.trim();
        const precioReparacion = document.getElementById('finalizarPrecioReparacion').value.trim();

        let observaciones = "Servicio: " + descripcionServicio;
        if (!precioReparacion || isNaN(precioReparacion) || Number(precioReparacion) < 0)
            return mostrarMensaje("Debes ingresar el precio de la reparación.", true);
        observaciones += " | Precio reparación: $" + precioReparacion;

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

    // -------- Botón para ver la factura de una cita finalizada ----------
    function verFactura(idCita) {
        // Aquí puedes pedir al backend la factura por idCita; ejemplo estático:
        const ejemploFactura = {
            Numero: 123,
            Cliente: "Juan Cliente",
            Vehiculo: "Nissan - March (2025)",
            Fecha: "2025-06-24",
            Total: "$2.400.000",
            Detalles: [
                { descripcion: "Reparación motor", valor: 1200000 },
                { descripcion: "Pintura", valor: 800000 },
                { descripcion: "IVA", valor: 400000 }
            ]
        };
        mostrarModalFactura(ejemploFactura);
    }

    function mostrarModalFactura(factura) {
        let html = `
            <h5>Factura Nº ${factura.Numero}</h5>
            <p><b>Cliente:</b> ${factura.Cliente}</p>
            <p><b>Vehículo:</b> ${factura.Vehiculo}</p>
            <p><b>Fecha:</b> ${factura.Fecha}</p>
            <table class="table">
                <thead><tr><th>Concepto</th><th>Valor</th></tr></thead>
                <tbody>
                    ${factura.Detalles.map(d =>
            `<tr><td>${d.descripcion}</td><td>$${d.valor.toLocaleString()}</td></tr>`
        ).join("")}
                </tbody>
                <tfoot>
                    <tr><td><b>Total</b></td><td><b>${factura.Total}</b></td></tr>
                </tfoot>
            </table>
        `;
        // Modal dinámico si no existe
        let modal = document.getElementById("modalFactura");
        if (!modal) {
            modal = document.createElement("div");
            modal.className = "modal fade";
            modal.id = "modalFactura";
            modal.tabIndex = -1;
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Factura</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="facturaBody"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        document.getElementById("facturaBody").innerHTML = html;
        new bootstrap.Modal(modal).show();
    }

    function inicializar() {
        document.getElementById("btnVerFinalizadas").onclick = function () {
            verFinalizadas = true;
            cargarCitas();
        };
        document.getElementById("btnVerAprobadas").onclick = function () {
            verFinalizadas = false;
            cargarCitas();
        };
        cargarCitas();
        formFinalizar = document.getElementById('formFinalizarCita');
        if (formFinalizar) formFinalizar.onsubmit = finalizarCita;
    }

    return { inicializar, abrirModalFinalizar, verFactura };
})();

document.addEventListener('DOMContentLoaded', CitasFacturaApp.inicializar);
