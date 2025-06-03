window.PedidosAprobarApp = (function () {
    const API_BASE = 'http://ventavehiculos.runasp.net/api';
    let pedidosCargados = [];

    function cargarPedidosPendientes() {
        console.log("Iniciando carga de pedidos...");
        fetch(`${API_BASE}/Pedido/ConsultarTodos`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(resp => resp.json())
            .then(pedidos => {
                console.log("Pedidos recibidos:", pedidos); // Depuración
                if (!Array.isArray(pedidos)) {
                    console.error("Respuesta inesperada, no es array:", pedidos);
                }
                pedidosCargados = pedidos;

                // Log extra para ver los estados
                pedidos.forEach(p => {
                    console.log(`Pedido ${p.Id}: Estado='${p.Estado}'`);
                });

                // Ajuste: filtro más tolerante a mayúsculas/minúsculas/espacios
                const pendientes = pedidos.filter(
                    p => typeof p.Estado === 'string' && p.Estado.trim().toLowerCase() === 'pendiente'
                );
                console.log("Pedidos pendientes filtrados:", pendientes);

                renderizarTabla(pendientes);
            })
            .catch((err) => {
                console.error("Error en el fetch:", err);
                const tbody = document.querySelector('#tablaPedidosPendientes tbody');
                if (tbody)
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error cargando pedidos.</td></tr>';
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
            tbody.innerHTML += `
                <tr>
                    <td>${pedido.Id}</td>
                    <td>${pedido.DocumentoCliente || '-'}</td>
                    <td>${pedido.FechaPedido ? new Date(pedido.FechaPedido).toLocaleDateString() : '-'}</td>
                    <td>${pedido.Observaciones || '-'}</td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="PedidosAprobarApp.aprobarPedido(${pedido.Id})">
                            <i class="fa-solid fa-check"></i> Aprobar
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    function aprobarPedido(id) {
        const pedido = pedidosCargados.find(p => p.Id === id);
        if (!pedido) return alert('Pedido no encontrado');
        pedido.Estado = "Aprobado";
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
        aprobarPedido
    };
})();

window.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('tablaPedidosPendientes')) {
        PedidosAprobarApp.cargarPedidosPendientes();
    }
});
