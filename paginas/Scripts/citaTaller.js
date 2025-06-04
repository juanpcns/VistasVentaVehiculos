window.CitaTallerApp = (function () {
    const API_BASE = 'http://ventavehiculos.runasp.net/api';

    function cargarCitas() {
        fetch(`${API_BASE}/CitaTaller/ConsultarTodos`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(resp => resp.json())
            .then(data => {
                const tbody = document.querySelector('#tablaCitas tbody'); // ✔️ Este ID sí existe
                if (!tbody) {
                    console.error("No se encontró el tbody de la tabla de citas.");
                    return;
                }
                tbody.innerHTML = '';
                if (Array.isArray(data) && data.length > 0) {
                    data.forEach(cita => {
                        tbody.innerHTML += `
                        <tr>
                            <td>${cita.Id}</td>
                            <td>${cita.DocumentoCliente || '-'}</td>
                            <td>${cita.CodigoVehiculo || '-'}</td>
                            <td>${cita.FechaCita ? new Date(cita.FechaCita).toLocaleDateString() : '-'}</td>
                            <td>${cita.Motivo || '-'}</td>
                            <td>${cita.Estado || '-'}</td>
                            <td>${cita.Observaciones || '-'}</td>
                        </tr>
                    `;
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay citas registradas.</td></tr>';
                }
            })
            .catch(e => {
                const tbody = document.querySelector('#tablaCitas tbody');
                if (tbody)
                    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error cargando citas</td></tr>';
                console.error("Error al cargar las citas:", e);
            });
    }


    function registrarNuevaCita(event) {
        event.preventDefault();
        const doc = document.getElementById('inputDocumento').value.trim();
        const fecha = document.getElementById('inputFecha').value;
        const motivo = document.getElementById('inputMotivo').value.trim();

        if (!doc || !fecha || !motivo) {
            mostrarMensaje("Todos los campos son obligatorios.", "warning");
            return;
        }

        const cita = {
            DocumentoCliente: doc,
            Fecha: fecha,
            Motivo: motivo
        };

        fetch(`${API_BASE}/CitaTaller/Insertar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cita)
        })
            .then(resp => resp.text())
            .then(msg => {
                mostrarMensaje(msg, "success");
                document.getElementById('formNuevaCita').reset();
                setTimeout(() => {
                    cargarCitas();
                }, 300); // espera breve para asegurar persistencia
            })

            .catch(() => mostrarMensaje("Error al registrar la cita.", "danger"));
    }

    function mostrarMensaje(texto, tipo) {
        const div = document.getElementById("mensaje");
        div.className = `alert alert-${tipo}`;
        div.textContent = texto;
    }

    return {
        cargarCitas,
        registrarNuevaCita
    };
})();

window.addEventListener('DOMContentLoaded', function () {
    CitaTallerApp.cargarCitas();
    document.getElementById("formNuevaCita").addEventListener("submit", CitaTallerApp.registrarNuevaCita);
});
