window.VehiculosApp = (function () {
    const API_BASE = 'http://ventavehiculos.runasp.net/api';
    let modoEdicion = false; // true = editar, false = registrar

    function cargarVehiculos() {
        fetch(`${API_BASE}/Vehiculo/ListarDisponibles`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(resp => resp.json())
            .then(data => {
                const tbody = document.querySelector('#tablaVehiculos tbody');
                if (!tbody) {
                    console.error("No se encontró el tbody de la tabla de vehículos.");
                    return;
                }
                tbody.innerHTML = '';
                if (Array.isArray(data) && data.length > 0) {
                    data.forEach(v => {
                        tbody.innerHTML += `
                        <tr>
<<<<<<< Updated upstream
                            <td>${v.Codigo}</td>
                            <td>${v.IdModelo}</td>
                            <td>-</td>
=======
                            <td>${v.Codigo}</td>    
                            <td>${v.MarcaNombre && v.ModeloNombre ? v.MarcaNombre + ' - ' + v.ModeloNombre : '-'}</td>
>>>>>>> Stashed changes
                            <td>${v.Año}</td>
                            <td>${v.Tipo}</td>
                            <td>${v.ValorUnitario}</td>
                            <td>${v.Estado}</td>
                            <td>${v.Origen}</td>
                            <td>${v.Condicion}</td>
                            <td>
                                <button class="btn btn-warning btn-sm" onclick="VehiculosApp.editarVehiculo(${v.Codigo})">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="10">No hay vehículos disponibles.</td></tr>';
                }
            })
            .catch(e => {
                const tbody = document.querySelector('#tablaVehiculos tbody');
                if (tbody)
                    tbody.innerHTML = '<tr><td colspan="10">Error cargando vehículos</td></tr>';
            });
    }

    function mostrarModalVehiculo(vehiculo = null) {
        modoEdicion = !!vehiculo;
        document.getElementById('vehiculoCodigo').value = vehiculo?.Codigo || '';
        document.getElementById('vehiculoModelo').value = vehiculo?.IdModelo || '';
        document.getElementById('vehiculoAnio').value = vehiculo?.Año || '';
        document.getElementById('vehiculoTipo').value = vehiculo?.Tipo || '';
        document.getElementById('vehiculoValor').value = vehiculo?.ValorUnitario || '';
        document.getElementById('vehiculoEstado').value = vehiculo?.Estado || 'Disponible';
        document.getElementById('vehiculoOrigen').value = vehiculo?.Origen || '';
        document.getElementById('vehiculoCondicion').value = vehiculo?.Condicion || 'Nuevo';

        document.getElementById('vehiculoModelo').readOnly = modoEdicion;
        document.getElementById('vehiculoAnio').readOnly = modoEdicion;
        document.getElementById('vehiculoTipo').readOnly = modoEdicion;
        document.getElementById('vehiculoOrigen').readOnly = modoEdicion;
        document.getElementById('vehiculoCondicion').disabled = modoEdicion;

        document.getElementById('modalVehiculoLabel').textContent = modoEdicion ? 'Editar Vehículo' : 'Agregar Vehículo';

        var modal = new bootstrap.Modal(document.getElementById('modalVehiculo'));
        modal.show();
    }

    function guardarVehiculo(event) {
        event.preventDefault();
        let vehiculo = {};
        if (!modoEdicion) {
            vehiculo = {
                IdModelo: document.getElementById('vehiculoModelo').value,
                Año: document.getElementById('vehiculoAnio').value,
                Tipo: document.getElementById('vehiculoTipo').value,
                ValorUnitario: document.getElementById('vehiculoValor').value,
                Estado: document.getElementById('vehiculoEstado').value,
                Origen: document.getElementById('vehiculoOrigen').value,
                Condicion: document.getElementById('vehiculoCondicion').value,
            };
            fetch(`${API_BASE}/Vehiculo/Registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehiculo)
            })
                .then(async resp => {
                    const text = await resp.text();
                    bootstrap.Modal.getInstance(document.getElementById('modalVehiculo')).hide();
                    alert(text); // Muestra el mensaje real del backend
                    cargarVehiculos();
                })
                .catch(e => {
                    alert("No se pudo registrar el vehículo:\n" + (e.message || e));
                });
        } else {
            vehiculo = {
                Codigo: document.getElementById('vehiculoCodigo').value,
                Estado: document.getElementById('vehiculoEstado').value,
                ValorUnitario: document.getElementById('vehiculoValor').value
            };
            fetch(`${API_BASE}/Vehiculo/Actualizar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehiculo)
            })
                .then(async resp => {
                    const text = await resp.text();
                    bootstrap.Modal.getInstance(document.getElementById('modalVehiculo')).hide();
                    alert(text);
                    cargarVehiculos();
                })
                .catch(e => {
                    alert("No se pudo actualizar el vehículo:\n" + (e.message || e));
                });
        }
    }

    function editarVehiculo(codigo) {
        fetch(`${API_BASE}/Vehiculo/ListarDisponibles`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(resp => resp.json())
            .then(data => {
                const vehiculo = data.find(v => v.Codigo == codigo);
                if (vehiculo) mostrarModalVehiculo(vehiculo);
            });
    }

    // Llama automáticamente al cargar la vista
    cargarVehiculos();

    // Solo expone las funciones que deben ser llamadas desde HTML dinámico
    return {
        cargarVehiculos,
        mostrarModalVehiculo,
        guardarVehiculo,
        editarVehiculo
    };
})();
