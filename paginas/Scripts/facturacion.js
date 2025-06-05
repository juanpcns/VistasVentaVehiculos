window.FacturacionApp = (function () {
    const API_BASE = 'http://ventavehiculos.runasp.net/api';
    let pedidosAprobados = [];
    let pedidoSeleccionado = null;

    function buscarPedidosAprobados() {
        const docCliente = document.getElementById("docCliente").value.trim();
        if (!docCliente) return alert("Ingrese el documento del cliente.");

        fetch(`${API_BASE}/Pedido/ConsultarPedidosCliente/${docCliente}`, { headers: { 'Accept': 'application/json' } })
            .then(resp => resp.json())
            .then(pedidos => {
                pedidosAprobados = pedidos.filter(p => p.Estado && p.Estado.toLowerCase() === "aprobado");
                renderizarPedidosAprobados();
            })
            .catch(() => alert("Error buscando pedidos aprobados."));
    }

    function renderizarPedidosAprobados() {
        const container = document.getElementById('pedidosAprobadosContainer');
        const tbody = document.getElementById('tablaPedidosAprobados').querySelector('tbody');
        tbody.innerHTML = '';
        pedidoSeleccionado = null;
        document.getElementById('btnGenerarFacturaContainer').style.display = 'none';

        if (!pedidosAprobados.length) {
            container.style.display = 'none';
            alert("No hay pedidos aprobados para este cliente.");
            return;
        }

        pedidosAprobados.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.Id}</td>
                <td>${p.FechaPedido ? new Date(p.FechaPedido).toLocaleDateString() : '-'}</td>
                <td>${p.Estado}</td>
                <td>${p.Observaciones || '-'}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm" onclick="FacturacionApp.seleccionarPedido(${p.Id})">Seleccionar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        container.style.display = 'block';
    }

    function seleccionarPedido(id) {
        pedidoSeleccionado = pedidosAprobados.find(p => p.Id === id);
        if (pedidoSeleccionado) {
            document.getElementById('btnGenerarFacturaContainer').style.display = 'block';
        }
    }

    function generarFacturaSeleccionada() {
        if (!pedidoSeleccionado) return alert("Seleccione un pedido aprobado.");
        const docVendedor = document.getElementById("docVendedor").value.trim();
        if (!docVendedor) return alert("Ingrese el documento del vendedor.");

        fetch(`${API_BASE}/Factura/GenerarFactura?numeroPedido=${pedidoSeleccionado.Id}&documentoEmpleado=${docVendedor}`, {
            method: 'POST',
            headers: { 'Accept': 'application/json' }
        })
            .then(resp => {
                if (!resp.ok) throw new Error("No se pudo generar la factura.");
                return resp.json();
            })
            .then(factura => {
                alert(`Factura generada exitosamente. Número: ${factura.Numero}`);
                consultarHistorial(); // Refresca historial para mostrar la nueva factura
            })
            .catch(e => alert("Error generando factura: " + (e.message || e)));
    }

    function consultarHistorial() {
        const docCliente = document.getElementById("docCliente").value.trim();
        if (!docCliente) return alert("Ingrese el documento del cliente.");
        fetch(`${API_BASE}/Factura/ConsultarComprasCliente/${docCliente}`, { headers: { 'Accept': 'application/json' } })
            .then(resp => resp.json())
            .then(historial => {
                renderizarHistorial(historial);
            })
            .catch(() => alert("Error consultando historial de compras."));
    }

    function renderizarHistorial(historial) {
        const container = document.getElementById('historialComprasContainer');
        const tbody = document.getElementById('tablaHistorialCompras').querySelector('tbody');
        tbody.innerHTML = '';
        if (!historial.length) {
            container.style.display = 'none';
            alert("No hay historial de compras para este cliente.");
            return;
        }
        historial.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.NumeroFactura}</td>
                <td>${item.FechaCompra ? new Date(item.FechaCompra).toLocaleDateString() : '-'}</td>
                <td>${item.CodigoVehiculo}</td>
                <td>${item.Cantidad}</td>
                <td>${item.ValorUnitario}</td>
                <td>${item.Total}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="FacturacionApp.verDetalleFactura(
                        '${item.NumeroFactura}',
                        '${item.CodigoVehiculo}',
                        '${item.Cantidad}',
                        '${item.ValorUnitario}',
                        '${item.Total}',
                        '${item.FechaCompra || ''}'
                    )">
                        <i class="fa-solid fa-eye"></i> Ver Detalle
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        container.style.display = 'block';
    }

    function verDetalleFactura(numero, codVehiculo, cantidad, valorUnitario, total, fechaCompra) {
        let html = `
            <strong>Número de Factura:</strong> ${numero}<br>
            <strong>Fecha:</strong> ${fechaCompra ? new Date(fechaCompra).toLocaleString() : '-'}<br>
            <strong>Código Vehículo:</strong> ${codVehiculo}<br>
            <strong>Cantidad:</strong> ${cantidad}<br>
            <strong>Valor Unitario:</strong> $${valorUnitario}<br>
            <strong>Total:</strong> $${total}<br>
        `;
        document.getElementById('detalleFacturaBody').innerHTML = html;
        var myModal = new bootstrap.Modal(document.getElementById('modalDetalleFactura'));
        myModal.show();
    }

    // Exponer funciones para HTML
    return {
        buscarPedidosAprobados,
        seleccionarPedido,
        generarFacturaSeleccionada,
        consultarHistorial,
        verDetalleFactura
    };
})();