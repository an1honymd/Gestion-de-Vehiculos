'use strict';

const formulario = document.getElementById('formularioCita');
const btnLimpiar = document.getElementById('btnLimpiar');
const listaCitas = document.getElementById('listaCitas');
const contadorCitas = document.getElementById('contadorCitas');

let citas = [];
let indiceEditando = -1;

const STORAGE_CITAS = 'flexicarCitas';


/* =========================================================
   INICIAR SISTEMA
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    cargarCitas();
    establecerFechaMinima();
    mostrarCitas();

});


/* =========================================================
   CARGAR CITAS
   ========================================================= */

function cargarCitas() {

    const datos = localStorage.getItem(STORAGE_CITAS);

    if (datos) {
        citas = JSON.parse(datos);
    } else {
        citas = [];
    }

}


/* =========================================================
   GUARDAR CITAS
   ========================================================= */

function guardarCitas() {

    localStorage.setItem(
        STORAGE_CITAS,
        JSON.stringify(citas)
    );

}


/* =========================================================
   PROGRAMAR CITA
   ========================================================= */

formulario.addEventListener('submit', function (event) {

    event.preventDefault();

    const cita = {

        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        correo: document.getElementById('correo').value,

        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        anio: document.getElementById('anio').value,
        placa: document.getElementById('placa').value,
        tipoServicio: document.getElementById('tipoServicio').value,

        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        agente: document.getElementById('agente').value,

        estado: 'Programada'

    };


    /* =====================================================
       GUARDAR O EDITAR
       ===================================================== */

    if (indiceEditando === -1) {

        citas.push(cita);

        alert('¡Cita programada correctamente!');

    } else {

        citas[indiceEditando] = cita;

        indiceEditando = -1;

        document.getElementById('btnGuardar').innerHTML =
            '📅 Programar cita';

        alert('¡Cita actualizada correctamente!');

    }


    /* =====================================================
       GUARDAR EN EL NAVEGADOR
       ===================================================== */

    guardarCitas();

    /* Mostrar citas */
    mostrarCitas();

    /* Limpiar formulario */
    formulario.reset();

    establecerFechaMinima();

});


/* =========================================================
   MOSTRAR CITAS
   ========================================================= */

function mostrarCitas() {

    listaCitas.innerHTML = '';

    contadorCitas.textContent =
        citas.length === 1
            ? '1 cita'
            : `${citas.length} citas`;


    if (citas.length === 0) {

        listaCitas.innerHTML = `
            <div class="sin-citas">
                <h3>No hay citas programadas</h3>
                <p>Las citas que registres aparecerán aquí.</p>
            </div>
        `;

        return;
    }


    citas.forEach(function (cita, index) {

        const elemento = document.createElement('div');

        elemento.className = 'cita';

        elemento.innerHTML = `

            <div class="cita-cabecera">

                <h3>
                    🚗 ${cita.marca} ${cita.modelo}
                </h3>

                <span class="estado">
                    ${cita.estado}
                </span>

            </div>


            <div class="informacion-cita">

                <p>
                    <strong>👤 Conductor:</strong>
                    ${cita.nombre}
                </p>

                <p>
                    <strong>📞 Teléfono:</strong>
                    ${cita.telefono}
                </p>

                <p>
                    <strong>📧 Correo:</strong>
                    ${cita.correo}
                </p>

                <p>
                    <strong>🚘 Vehículo:</strong>
                    ${cita.marca} ${cita.modelo}
                </p>

                <p>
                    <strong>📅 Año:</strong>
                    ${cita.anio}
                </p>

                <p>
                    <strong>🔖 Placa:</strong>
                    ${cita.placa}
                </p>

                <p>
                    <strong>🔧 Servicio:</strong>
                    ${cita.tipoServicio}
                </p>

                <p>
                    <strong>📆 Fecha:</strong>
                    ${formatearFecha(cita.fecha)}
                </p>

                <p>
                    <strong>⏰ Hora:</strong>
                    ${formatearHora(cita.hora)}
                </p>

                <p>
                    <strong>👨‍🔧 Agente:</strong>
                    ${cita.agente}
                </p>

            </div>


            <div class="acciones">

                <button
                    type="button"
                    class="btn-editar"
                    onclick="editarCita(${index})">
                    ✏️ Editar
                </button>

                <button
                    type="button"
                    class="btn-eliminar"
                    onclick="eliminarCita(${index})">
                    🗑️ Eliminar
                </button>

            </div>

        `;

        listaCitas.appendChild(elemento);

    });

}


/* =========================================================
   EDITAR
   ========================================================= */

function editarCita(index) {

    const cita = citas[index];

    document.getElementById('nombre').value = cita.nombre;
    document.getElementById('telefono').value = cita.telefono;
    document.getElementById('correo').value = cita.correo;

    document.getElementById('marca').value = cita.marca;
    document.getElementById('modelo').value = cita.modelo;
    document.getElementById('anio').value = cita.anio;
    document.getElementById('placa').value = cita.placa;
    document.getElementById('tipoServicio').value = cita.tipoServicio;

    document.getElementById('fecha').value = cita.fecha;
    document.getElementById('hora').value = cita.hora;
    document.getElementById('agente').value = cita.agente;

    indiceEditando = index;

    document.getElementById('btnGuardar').innerHTML =
        '💾 Actualizar cita';

    formulario.scrollIntoView({
        behavior: 'smooth'
    });

}


/* =========================================================
   ELIMINAR
   ========================================================= */

function eliminarCita(index) {

    if (!confirm('¿Deseas eliminar esta cita?')) {
        return;
    }

    citas.splice(index, 1);

    guardarCitas();

    mostrarCitas();

}


/* =========================================================
   LIMPIAR
   ========================================================= */

btnLimpiar.addEventListener('click', function () {

    formulario.reset();

    indiceEditando = -1;

    document.getElementById('btnGuardar').innerHTML =
        '📅 Programar cita';

    establecerFechaMinima();

});


/* =========================================================
   FECHA MÍNIMA
   ========================================================= */

function establecerFechaMinima() {

    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    document.getElementById('fecha').min =
        `${anio}-${mes}-${dia}`;

}


/* =========================================================
   FORMATO FECHA
   ========================================================= */

function formatearFecha(fecha) {

    if (!fecha) return '';

    const partes = fecha.split('-');

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/* =========================================================
   FORMATO HORA
   ========================================================= */

function formatearHora(hora) {

    if (!hora) return '';

    const partes = hora.split(':');

    let horas = parseInt(partes[0]);
    const minutos = partes[1];

    let periodo = 'AM';

    if (horas >= 12) {
        periodo = 'PM';

        if (horas > 12) {
            horas -= 12;
        }
    }

    if (horas === 0) {
        horas = 12;
    }

    return `${horas}:${minutos} ${periodo}`;

}