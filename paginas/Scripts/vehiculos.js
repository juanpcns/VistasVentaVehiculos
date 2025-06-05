window.VehiculosApp = (function () {
    const API_BASE = 'http://ventavehiculos.runasp.net/api';
    let modoEdicion = false;
    let listaMarcas = [];
    let listaModelos = [];

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
                            <td>${v.Codigo}</td>    
                            <td>${v.MarcaNombre && v.ModeloNombre ? v.MarcaNombre + ' - ' + v.ModeloNombre : '-'}</td>
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
                    tbody.innerHTML = '<tr><td colspan="9">No hay vehículos disponibles.</td></tr>';
                }
            })
            .catch(e => {
                const tbody = document.querySelector('#tablaVehiculos tbody');
                if (tbody)
                    tbody.innerHTML = '<tr><td colspan="9">Error cargando vehículos</td></tr>';
            });
    }

    function cargarMarcasYModelos(callback) {
        let marcasOk = false, modelosOk = false;

        fetch(`${API_BASE}/Marca/ConsultarTodos`, { headers: { 'Accept': 'application/json' } })
            .then(resp => resp.json())
            .then(marcas => {
                listaMarcas = Array.isArray(marcas) ? marcas.filter(m => m.Activo) : [];
                llenarSelectMarcas();
                marcasOk = true;
                if (callback && modelosOk) callback();
            });

        fetch(`${API_BASE}/Modelo/ConsultarTodos`, { headers: { 'Accept': 'application/json' } })
            .then(resp => resp.json())
            .then(modelos => {
                listaModelos = Array.isArray(modelos) ? modelos.filter(m => m.Activo) : [];
                modelosOk = true;
                if (callback && marcasOk) callback();
            });
    }

    function llenarSelectMarcas(seleccionada) {
        const selectMarca = document.getElementById('vehiculoMarca');
        if (!selectMarca) return;
        selectMarca.innerHTML = `<option value="">Todas las marcas</option>`;
        listaMarcas.forEach(m => {
            selectMarca.innerHTML += `<option value="${m.Id}" ${seleccionada == m.Id ? 'selected' : ''}>${m.Nombre}</option>`;
        });
    }

    function llenarSelectModelos(idMarca, seleccionada) {
        const selectModelo = document.getElementById('vehiculoModelo');
        if (!selectModelo) return;
        selectModelo.innerHTML = `<option value="">Seleccione un modelo</option>`;
        let modelosAMostrar = [];

        if (listaMarcas.length === 0 || !idMarca) {
            modelosAMostrar = listaModelos;
        } else {
            modelosAMostrar = listaModelos.filter(m => m.IdMarca == idMarca);
        }

        modelosAMostrar.forEach(m => {
            selectModelo.innerHTML += `<option value="${m.Id}" ${seleccionada == m.Id ? 'selected' : ''}>${m.Nombre}</option>`;
        });
        selectModelo.disabled = false; // Siempre habilitado
    }

    function mostrarModalVehiculo(vehiculo = null) {
        modoEdicion = !!vehiculo;

        cargarMarcasYModelos(function () {
            // Si hay una edición, selecciona la marca/modelo correspondiente
            if (vehiculo) {
                // Buscar el modelo y la marca correspondiente
                const modelo = listaModelos.find(m => m.Id == vehiculo.IdModelo);
                const marca = modelo ? modelo.IdMarca : '';
                document.getElementById('vehiculoMarca').value = marca || '';
                llenarSelectModelos(marca, vehiculo.IdModelo);
                document.getElementById('vehiculoModelo').value = vehiculo.IdModelo;
            } else {
                document.getElementById('vehiculoMarca').value = '';
                llenarSelectModelos('', '');
            }
        });

        document.getElementById('vehiculoCodigo').value = vehiculo?.Codigo || '';
        document.getElementById('vehiculoAnio').value = vehiculo?.Año || '';
        document.getElementById('vehiculoTipo').value = vehiculo?.Tipo || '';
        document.getElementById('vehiculoValor').value = vehiculo?.ValorUnitario || '';
        document.getElementById('vehiculoEstado').value = vehiculo?.Estado || 'Disponible';
        document.getElementById('vehiculoOrigen').value = vehiculo?.Origen || '';
        document.getElementById('vehiculoCondicion').value = vehiculo?.Condicion || 'Nuevo';

        // Campos sólo editables al crear
        document.getElementById('vehiculoMarca').disabled = false;
        document.getElementById('vehiculoModelo').disabled = modoEdicion;
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
                    alert(text);
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

    document.addEventListener('DOMContentLoaded', function () {
        cargarMarcasYModelos();

        document.getElementById('vehiculoMarca').addEventListener('change', function () {
            llenarSelectModelos(this.value);
            document.getElementById('vehiculoModelo').value = '';
        });
    });

    cargarVehiculos();

    return {
        cargarVehiculos,
        mostrarModalVehiculo,
        guardarVehiculo,
        editarVehiculo
    };
})();
