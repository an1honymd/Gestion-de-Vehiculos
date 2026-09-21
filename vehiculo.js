/* =========================================================
   FLEXICAR - SISTEMA DE CITAS
   ========================================================= */

'use strict';

/* =========================================================
   ELEMENTOS DEL HTML
   ========================================================= */

const formulario = document.getElementById('formularioCita');
const btnLimpiar = document.getElementById('btnLimpiar');
const listaCitas = document.getElementById('listaCitas');
const contadorCitas = document.getElementById('contadorCitas');


/* =========================================================
   CAMPOS DEL FORMULARIO
   ========================================================= */

const nombre = document.getElementById('nombre');
const telefono = document.getElementById('telefono');
const correo = document.getElementById('correo');

const marca = document.getElementById('marca');
const modelo = document.getElementById('modelo');
const anio = document.getElementById('anio');
const placa = document.getElementById('placa');
const tipoServicio = document.getElementById('tipoServicio');

const fecha = document.getElementById('fecha');
const hora = document.getElementById('hora');
const agente = document.getElementById('agente');


/* =========================================================
   VARIABLES
   ========================================================= */

let citas = [];
let indiceEditando = null;

const STORAGE_CITAS = 'flexicarCitas';


/* =========================================================
   CARGAR CITAS AL INICIAR
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    cargarCitas();
    establecerFechaMinima();
    mostrarCitas();

});


/* =========================================================
   FECHA MÍNIMA
   ========================================================= */

function establecerFechaMinima() {

    const hoy = new Date();

    const anioHoy = hoy.getFullYear();
    const mesHoy = String(hoy.getMonth() + 1).padStart(2, '0');
    const diaHoy = String(hoy.getDate()).padStart(2, '0');

    const fechaHoy = `${anioHoy}-${mesHoy}-${diaHoy}`;

    fecha.min = fechaHoy;
}


/* =========================================================
   CARGAR CITAS DESDE LOCALSTORAGE
   ========================================================= */

function cargarCitas() {

    const datosGuardados = localStorage.getItem(STORAGE_CITAS);

    if (datosGuardados) {

        try {

            citas = JSON.parse(datosGuardados);

            if (!Array.isArray(citas)) {
                citas = [];
            }

        } catch (error) {

            console.error('Error al cargar las citas:', error);

            citas = [];
        }

    } else {

        citas = [];

    }
}


/* =========================================================
   GUARDAR CITAS EN LOCALSTORAGE
   ========================================================= */

function guardarCitas() {

    localStorage.setItem(
        STORAGE_CITAS,
        JSON.stringify(citas)
    );
}


/* =========================================================
   FORMULARIO - GUARDAR CITA
   ========================================================= */

formulario.addEventListener('submit', function (event) {

    event.preventDefault();

    const datosCita = {

        nombre: nombre.value.trim(),
        telefono: telefono.value.trim(),
        correo: correo.value.trim(),

        marca: marca.value.trim(),
        modelo: modelo.value.trim(),
        anio: anio.value,
        placa: placa.value.trim().toUpperCase(),
        tipoServicio: tipoServicio.value,

        fecha: fecha.value,
        hora: hora.value,
        agente: agente.value,

        estado: 'Programada'

    };


    /* =====================================================
       VALIDAR FECHA
       ===================================================== */

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaSeleccionada = new Date(
        datosCita.fecha + 'T00:00:00'
    );

    if (fechaSeleccionada < hoy) {

        alert('No puedes seleccionar una fecha anterior a hoy.');

        return;
    }


    /* =====================================================
       EVITAR CITAS DUPLICADAS
       ===================================================== */

    const citaDuplicada = citas.some(function (cita, index) {

        if (indiceEditando !== null && index === indiceEditando) {
            return false;
        }

        return (
            cita.fecha === datosCita.fecha &&
            cita.hora === datosCita.hora &&
            cita.agente === datosCita.agente
        );

    });


    if (citaDuplicada) {

        alert(
            'Ya existe una cita programada para ese agente, fecha y hora.'
        );

        return;
    }


    /* =====================================================
       EDITAR CITA
       ===================================================== */

    if (indiceEditando !== null) {

        citas[indiceEditando] = datosCita;

        indiceEditando = null;

        alert('La cita fue actualizada correctamente.');

    }

    /* =====================================================
       NUEVA CITA
       ===================================================== */

    else {

        citas.push(datosCita);

        alert('La cita fue programada correctamente.');

    }


    guardarCitas();

    mostrarCitas();

    limpiarFormulario();

});


/* =========================================================
   MOSTRAR CITAS
   ========================================================= */

function mostrarCitas() {

    listaCitas.innerHTML = '';


    /* =====================================================
       SIN CITAS
       ===================================================== */

    if (citas.length === 0) {

        listaCitas.innerHTML = `
            <div class="sin-citas">
                <h3>No hay citas programadas</h3>
                <p>Las citas que registres aparecerán aquí.</p>
            </div>
        `;

        contadorCitas.textContent = '0 citas';

        return;
    }


    /* =====================================================
       CONTADOR
       ===================================================== */

    if (citas.length === 1) {

        contadorCitas.textContent = '1 cita';

    } else {

        contadorCitas.textContent = `${citas.length} citas`;

    }


    /* =====================================================
       CREAR CITAS
       ===================================================== */

    citas.forEach(function (cita, index) {

        const citaHTML = document.createElement('div');

        citaHTML.className = 'cita';

        citaHTML.innerHTML = `

            <div class="cita-cabecera">

                <h3>
                    🚗 ${escapeHTML(cita.marca)}
                    ${escapeHTML(cita.modelo)}
                </h3>

                <span class="estado">
                    ${escapeHTML(cita.estado)}
                </span>

            </div>


            <div class="informacion-cita">

                <p>
                    <strong>👤 Conductor:</strong>
                    ${escapeHTML(cita.nombre)}
                </p>

                <p>
                    <strong>📞 Teléfono:</strong>
                    ${escapeHTML(cita.telefono)}
                </p>

                <p>
                    <strong>📧 Correo:</strong>
                    ${escapeHTML(cita.correo)}
                </p>

                <p>
                    <strong>🚘 Vehículo:</strong>
                    ${escapeHTML(cita.marca)}
                    ${escapeHTML(cita.modelo)}
                </p>

                <p>
                    <strong>📅 Año:</strong>
                    ${escapeHTML(cita.anio)}
                </p>

                <p>
                    <strong>🔖 Placa:</strong>
                    ${escapeHTML(cita.placa)}
                </p>

                <p>
                    <strong>🔧 Servicio:</strong>
                    ${escapeHTML(cita.tipoServicio)}
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
                    ${escapeHTML(cita.agente)}
                </p>

            </div>


            <div class="acciones">

                <button
                    type="button"
                    class="btn-editar"
                    onclick="editarCita(${index})"
                >
                    ✏️ Editar
                </button>

                <button
                    type="button"
                    class="btn-eliminar"
                    onclick="eliminarCita(${index})"
                >
                    🗑️ Eliminar
                </button>

            </div>

        `;

        listaCitas.appendChild(citaHTML);

    });

}


/* =========================================================
   EDITAR CITA
   ========================================================= */

function editarCita(index) {

    const cita = citas[index];

    if (!cita) {
        return;
    }


    nombre.value = cita.nombre;
    telefono.value = cita.telefono;
    correo.value = cita.correo;

    marca.value = cita.marca;
    modelo.value = cita.modelo;
    anio.value = cita.anio;
    placa.value = cita.placa;
    tipoServicio.value = cita.tipoServicio;

    fecha.value = cita.fecha;
    hora.value = cita.hora;
    agente.value = cita.agente;


    indiceEditando = index;


    /* =====================================================
       CAMBIAR TEXTO DEL BOTÓN
       ===================================================== */

    const btnGuardar = document.getElementById('btnGuardar');

    btnGuardar.innerHTML = '💾 Actualizar cita';


    /* =====================================================
       SUBIR AL FORMULARIO
       ===================================================== */

    formulario.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

}


/* =========================================================
   ELIMINAR CITA
   ========================================================= */

function eliminarCita(index) {

    const cita = citas[index];

    if (!cita) {
        return;
    }


    const confirmar = confirm(
        `¿Deseas eliminar la cita de ${cita.nombre}?`
    );


    if (!confirmar) {
        return;
    }


    citas.splice(index, 1);

    guardarCitas();

    mostrarCitas();


    /* =====================================================
       SI ESTABA EDITANDO ESA CITA
       ===================================================== */

    if (indiceEditando === index) {

        indiceEditando = null;

        limpiarFormulario();

    }


    /* =====================================================
       AJUSTAR ÍNDICE SI SE ELIMINA ANTES
       ===================================================== */

    else if (
        indiceEditando !== null &&
        index < indiceEditando
    ) {

        indiceEditando--;

    }

}


/* =========================================================
   BOTÓN LIMPIAR
   ========================================================= */

btnLimpiar.addEventListener('click', function () {

    limpiarFormulario();

});


/* =========================================================
   LIMPIAR FORMULARIO
   ========================================================= */

function limpiarFormulario() {

    formulario.reset();

    indiceEditando = null;


    const btnGuardar = document.getElementById('btnGuardar');

    btnGuardar.innerHTML = '📅 Programar cita';


    establecerFechaMinima();

}


/* =========================================================
   FORMATEAR FECHA
   ========================================================= */

function formatearFecha(fechaTexto) {

    if (!fechaTexto) {
        return '';
    }

    const partes = fechaTexto.split('-');

    if (partes.length !== 3) {
        return fechaTexto;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/* =========================================================
   FORMATEAR HORA
   ========================================================= */

function formatearHora(horaTexto) {

    if (!horaTexto) {
        return '';
    }

    const partes = horaTexto.split(':');

    if (partes.length < 2) {
        return horaTexto;
    }

    let horas = parseInt(partes[0], 10);
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


/* =========================================================
   SEGURIDAD HTML
   ========================================================= */

function escapeHTML(texto) {

    if (texto === null || texto === undefined) {
        return '';
    }

    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}