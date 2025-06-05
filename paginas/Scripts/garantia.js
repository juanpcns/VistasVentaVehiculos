window.GarantiaApp = (function () {
    const API_BASE = 'http://ventavehiculos.runasp.net/api';

    function mostrarMensaje(msg, error = false) {
        const div = document.getElementById('mensajeGarantia');
        if (!div) return;
        div.innerHTML = `<div class="alert alert-${error ? 'danger' : 'success'}">${msg}</div>`;
        setTimeout(() => { div.innerHTML = ""; }, 3500);
    }

    function renderizarGarantias(lista) {
        const tbody = document.querySelector("#tablaGarantias tbody");
        if (!tbody) return;
        tbody.innerHTML = '';
        if (!lista || lista.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay garantías registradas</td></tr>';
            return;
        }
        lista.forEach(g => {
            tbody.innerHTML += `
                <tr>
                    <td>${g.Id}</td>
                    <td>${g.MarcaNombre && g.ModeloNombre
                    ? (g.MarcaNombre + ' - ' + g.ModeloNombre + ' (' + g.Año + ')')
                    : g.CodigoVehiculo
                }</td>
                    <td>${g.NumeroFactura}</td>
                    <td>${(g.FechaInicio || '').substring(0, 10)}</td>
                    <td>${(g.FechaFin || '').substring(0, 10)}</td>
                    <td>${g.Cobertura}</td>
                    <td>${g.Estado}</td>
                </tr>
            `;
        });
    }

    function cargarGarantias() {
        fetch(`${API_BASE}/Garantia/ConsultarTodos`)
            .then(resp => resp.json())
            .then(data => renderizarGarantias(data))
            .catch(e => mostrarMensaje("Error cargando garantías: " + (e.message || e), true));
    }

    function buscarPorVehiculo(event) {
        event.preventDefault(); // ¡No recargar la página!
        const placa = document.getElementById('inputPlacaBuscar').value.trim();
        if (!placa) return mostrarMensaje("Ingrese el código del vehículo a buscar", true);

        fetch(`${API_BASE}/Garantia/ConsultarTodosXPlaca?placa=${encodeURIComponent(placa)}`)
            .then(resp => resp.json())
            .then(data => {
                if (!data || !data.Id) {
                    renderizarGarantias([]);
                    mostrarMensaje("No hay garantía registrada para ese vehículo", true);
                } else {
                    renderizarGarantias([data]);
                }
            })
            .catch(e => mostrarMensaje("Error en la búsqueda: " + (e.message || e), true));
    }

    function limpiarFormulario() {
        document.getElementById('formNuevaGarantia').reset();
        document.getElementById('inputCobertura').value = "Cobertura total por 6 meses";
        document.getElementById('inputEstado').value = "Activa";
    }

    function guardarGarantia(event) {
        event.preventDefault(); // ¡No recargar la página!
        const CodigoVehiculo = parseInt(document.getElementById('inputCodigoVehiculo').value);
        const NumeroFactura = parseInt(document.getElementById('inputNumeroFactura').value);
        const FechaInicio = document.getElementById('inputFechaInicio').value;
        const FechaFin = document.getElementById('inputFechaFin').value;
        const Cobertura = document.getElementById('inputCobertura').value.trim();
        const Estado = document.getElementById('inputEstado').value;

        if (!CodigoVehiculo || !NumeroFactura || !FechaInicio || !FechaFin || !Cobertura || !Estado)
            return mostrarMensaje("Todos los campos son obligatorios", true);

        const data = { CodigoVehiculo, NumeroFactura, FechaInicio, FechaFin, Cobertura, Estado };

        fetch(`${API_BASE}/Garantia/Insertar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(resp => resp.text())
            .then(text => {
                mostrarMensaje(text, !text.toLowerCase().includes('éxito'));
                if (text.toLowerCase().includes('éxito')) {
                    limpiarFormulario();
                    cargarGarantias();
                }
            })
            .catch(e => mostrarMensaje("Error al registrar garantía: " + (e.message || e), true));
    }

    // Inicializa siempre los eventos al cargar la vista
    function inicializar() {
        cargarGarantias();
        // Enlaza eventos cada vez que se carga la vista
        const formGuardar = document.getElementById('formNuevaGarantia');
        if (formGuardar) {
            formGuardar.onsubmit = null;
            formGuardar.addEventListener('submit', guardarGarantia);
        }
        const formBuscar = document.getElementById('formBuscarPorVehiculo');
        if (formBuscar) {
            formBuscar.onsubmit = null;
            formBuscar.addEventListener('submit', buscarPorVehiculo);
        }
        const btnTodas = document.getElementById('btnMostrarTodas');
        if (btnTodas) {
            btnTodas.onclick = function () {
                cargarGarantias();
                document.getElementById('inputPlacaBuscar').value = '';
            };
        }
    }

    return { inicializar };
})();

document.addEventListener('DOMContentLoaded', GarantiaApp.inicializar);