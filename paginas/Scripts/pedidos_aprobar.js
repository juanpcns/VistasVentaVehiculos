window.PedidosAprobarApp = (function () {
    const API_BASE = 'http://ventavehiculos.runasp.net/api';
    let pedidosCargados = [];

    function cargarPedidosPendientes() {
        fetch(`${API_BASE}/Pedido/ConsultarTodos`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(resp => resp.json())
            .then(pedidos => {
                pedidosCargados = pedidos;
                const pendientes = pedidos.filter(p => {
                    let estado = (p.Estado || p.estado || '').trim().toLowerCase();
                    return estado === "pendiente";
                });
                renderizarTabla(pendientes);
            })
            .catch(() => {
                document.querySelector('#tablaPedidosPendientes tbody').innerHTML =
                    '<tr><td colspan="5" class="text-center text-danger">Error cargando pedidos.</td></tr>';
            });
    }

    function renderizarTabla(pedidos) {
        const tbody = document.querySelector('#tablaPedidosPendientes tbody');
        tbody.innerHTML = '';
        if (!pedidos.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay pedidos pendientes.</td></tr>';
            return;
        }
        pedidos.forEach(pedido => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pedido.Id}</td>
                <td>${pedido.NombreCliente || '-'}</td>
                <td>${pedido.FechaPedido ? new Date(pedido.FechaPedido).toLocaleDateString() : '-'}</td>
                <td>${pedido.Observaciones || '-'}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="PedidosAprobarApp.verDetallePedido(${pedido.Id})">
                        <i class="fa-solid fa-eye"></i> Ver Detalle
                    </button>
                    <button class="btn btn-success btn-sm ms-1" onclick="PedidosAprobarApp.cambiarEstadoPedido(${pedido.Id},'Aprobado')">
                        <i class="fa-solid fa-check"></i> Aprobar
                    </button>
                    <button class="btn btn-danger btn-sm ms-1" onclick="PedidosAprobarApp.cambiarEstadoPedido(${pedido.Id},'Rechazado')">
                        <i class="fa-solid fa-xmark"></i> Rechazar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    function verDetallePedido(id) {
        const pedido = pedidosCargados.find(p => p.Id == id);
        if (!pedido) {
            document.getElementById('detallePedidoBody').innerHTML = "Pedido no encontrado.";
            return;
        }

        let html = `
            <strong>ID Factura:</strong> ${pedido.Id}<br>
            <strong>Cliente:</strong> ${pedido.NombreCliente || '-'}<br>
            <strong>Documento Cliente:</strong> ${pedido.DocumentoCliente || '-'}<br>
            <strong>Fecha de Pedido:</strong> ${pedido.FechaPedido ? new Date(pedido.FechaPedido).toLocaleString() : '-'}<br>
            <strong>Estado:</strong> ${pedido.Estado || '-'}<br>
            <strong>Observaciones:</strong> ${pedido.Observaciones || '-'}<br>
            <hr>
            <strong>Detalle de vehículos:</strong>
            <div class="table-responsive">
            <table class="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Vehículo</th>
                  <th>Cantidad</th>
                  <th>Valor Unitario</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${(pedido.Detalles && pedido.Detalles.length > 0) ?
                pedido.Detalles.map(detalle => `
                  <tr>
                    <td>${detalle.Vehiculo}</td>
                    <td>${detalle.Cantidad}</td>
                    <td>$${detalle.ValorUnitario}</td>
                    <td>$${detalle.Total}</td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="4" class="text-center text-muted">Sin detalles</td></tr>
                `}
              </tbody>
            </table>
            </div>
        `;

        document.getElementById('detallePedidoBody').innerHTML = html;
        var myModal = new bootstrap.Modal(document.getElementById('modalDetallePedido'));
        myModal.show();
    }

    function cambiarEstadoPedido(id, nuevoEstado) {
        const pedido = pedidosCargados.find(p => p.Id == id);
        if (!pedido) return alert('Pedido no encontrado');

        if (nuevoEstado === 'Rechazado' && !confirm("¿Seguro que deseas rechazar este pedido? Esta acción no se puede deshacer.")) {
            return;
        }

        pedido.Estado = nuevoEstado;

        fetch(`${API_BASE}/Pedido/Actualizar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        })
            .then(resp => resp.text())
            .then(msg => {
                alert(msg);
                cargarPedidosPendientes();
            });
    }

    return {
        cargarPedidosPendientes,
        verDetallePedido,
        cambiarEstadoPedido
    };
})();

window.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('tablaPedidosPendientes')) {
        PedidosAprobarApp.cargarPedidosPendientes();
    }
});
