window.MisPedidosApp = (function () {
    const API_BASE = 'http://ventavehiculos.runasp.net/api';
    let pedidosCargados = [];

    function consultarPedidos(event) {
        if (event) event.preventDefault();
        const documento = document.getElementById('inputDocumento').value.trim();
        if (!documento) return;

        fetch(`${API_BASE}/Pedido/ConsultarPedidosCliente/${documento}`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(resp => resp.json())
            .then(pedidos => {
                pedidosCargados = pedidos;
                renderizarTabla(pedidos);
            })
            .catch(() => {
                mostrarToast('Error consultando pedidos.', true);
                document.querySelector('#tablaMisPedidos tbody').innerHTML =
                    '<tr><td colspan="5" class="text-center text-danger">Error consultando pedidos.</td></tr>';
            });
    }

    function renderizarTabla(pedidos) {
        const tbody = document.querySelector('#tablaMisPedidos tbody');
        tbody.innerHTML = '';
        if (!pedidos.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No se encontraron pedidos.</td></tr>';
            return;
        }
        pedidos.forEach(pedido => {
            tbody.innerHTML += `
                <tr>
                    <td>${pedido.Id || pedido.id}</td>
                    <td>${pedido.FechaPedido ? new Date(pedido.FechaPedido).toLocaleDateString() : '-'}</td>
                    <td>${pedido.Estado || '-'}</td>
                    <td>${pedido.Observaciones || '-'}</td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="MisPedidosApp.verDetallePedido(
                            '${pedido.Id || pedido.id}', 
                            '${pedido.FechaPedido || ''}', 
                            '${pedido.Estado || ''}', 
                            \`${pedido.Observaciones || ''}\`
                        )">
                            <i class="fa-solid fa-eye"></i> Ver Detalle
                        </button>
                        ${(pedido.Estado === "Pendiente") ? `
                        <button class="btn btn-danger btn-sm ms-1" onclick="MisPedidosApp.cancelarPedido(${pedido.Id || pedido.id})">
                            <i class="fa-solid fa-xmark"></i> Cancelar
                        </button>
                        ` : ""}
                    </td>
                </tr>
            `;
        });
    }

    function verDetallePedido(id, fecha, estado, observaciones) {
        let html = `
            <strong>ID Pedido:</strong> ${id}<br>
            <strong>Fecha de Pedido:</strong> ${fecha ? new Date(fecha).toLocaleString() : '-'}<br>
            <strong>Estado:</strong> ${estado}<br>
            <strong>Observaciones:</strong> ${observaciones}<br>
        `;
        document.getElementById('detallePedidoBody').innerHTML = html;
        var myModal = new bootstrap.Modal(document.getElementById('modalDetallePedido'));
        myModal.show();
    }

    function cancelarPedido(id) {
        if (!confirm("¿Seguro que deseas cancelar este pedido? Esta acción no se puede deshacer.")) return;
        const pedido = pedidosCargados.find(p => (p.Id || p.id) == id);
        if (!pedido) return mostrarToast('Pedido no encontrado.', true);

        pedido.Estado = "Cancelado";

        fetch(`${API_BASE}/Pedido/Actualizar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        })
            .then(resp => resp.text())
            .then(msg => {
                if (msg.toLowerCase().includes("exitosamente") || msg.toLowerCase().includes("actualizado")) {
                    mostrarToast('¡Pedido cancelado exitosamente!', false);
                } else {
                    mostrarToast('No se pudo cancelar el pedido: ' + msg, true);
                }
                consultarPedidos({ preventDefault: () => { } });
            })
            .catch(() => mostrarToast('Error al cancelar el pedido.', true));
    }

    function mostrarToast(mensaje, esError) {
        const toast = document.getElementById("toastMisPedidos");
        const toastBody = document.getElementById("toastMisPedidosBody");
        toastBody.textContent = mensaje;
        toast.classList.remove("bg-success", "bg-danger");
        toast.classList.add(esError ? "bg-danger" : "bg-success");
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    return {
        consultarPedidos,
        verDetallePedido,
        cancelarPedido
    };
})();

window.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("formBuscarMisPedidos");
    if (form) {
        form.onsubmit = MisPedidosApp.consultarPedidos;
    }
});
