'use strict';

/* =========================================================
   FLEXICAR - SISTEMA DE CITAS
   ========================================================= */

const formulario = document.getElementById('formularioCita');
const btnLimpiar = document.getElementById('btnLimpiar');
const listaCitas = document.getElementById('listaCitas');
const contadorCitas = document.getElementById('contadorCitas');

let citas = [];
let indiceEditando = -1;

const STORAGE_CITAS = 'flexicarCitas';


/* =========================================================
   PRECIOS Y TIEMPOS DE LOS SERVICIOS
   ========================================================= */

const servicios = {

    "Mantenimiento preventivo": {
        costo: 350,
        tiempo: "2 horas"
    },

    "Diagnóstico": {
        costo: 200,
        tiempo: "1 hora"
    },

    "Reparación": {
        costo: 500,
        tiempo: "4 horas"
    },

    "Cambio de aceite": {
        costo: 250,
        tiempo: "1 hora"
    },

    "Cambio de componentes": {
        costo: 400,
        tiempo: "3 horas"
    }

};


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

        try {

            citas = JSON.parse(datos);

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


    /* =====================================================
       OBTENER SERVICIO
       ===================================================== */

    const servicioSeleccionado =
        document.getElementById('tipoServicio').value;

    const informacionServicio =
        servicios[servicioSeleccionado];


    if (!informacionServicio) {

        alert('Seleccione un tipo de servicio.');

        return;
    }


    /* =====================================================
       CREAR CITA
       ===================================================== */

    const cita = {

        nombre: document.getElementById('nombre').value.trim(),

        telefono: document.getElementById('telefono').value.trim(),

        correo: document.getElementById('correo').value.trim(),

        marca: document.getElementById('marca').value.trim(),

        modelo: document.getElementById('modelo').value.trim(),

        anio: document.getElementById('anio').value,

        placa: document.getElementById('placa').value
            .trim()
            .toUpperCase(),

        tipoServicio: servicioSeleccionado,

        costo: informacionServicio.costo,

        tiempo: informacionServicio.tiempo,

        fecha: document.getElementById('fecha').value,

        hora: document.getElementById('hora').value,

        agente: document.getElementById('agente').value,

        estado: 'Programada'

    };


    /* =====================================================
       VALIDAR FECHA
       ===================================================== */

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    const fechaSeleccionada =
        new Date(cita.fecha + 'T00:00:00');


    if (fechaSeleccionada < hoy) {

        alert(
            'No puedes seleccionar una fecha anterior a hoy.'
        );

        return;
    }


    /* =====================================================
       VERIFICAR CITA DUPLICADA
       ===================================================== */

    const duplicada = citas.some(function (item, index) {

        if (
            indiceEditando !== -1 &&
            index === indiceEditando
        ) {
            return false;
        }

        return (
            item.fecha === cita.fecha &&
            item.hora === cita.hora &&
            item.agente === cita.agente
        );

    });


    if (duplicada) {

        alert(
            'Ya existe una cita para ese agente, fecha y hora.'
        );

        return;
    }


    /* =====================================================
       NUEVA CITA
       ===================================================== */

    if (indiceEditando === -1) {

        citas.push(cita);

        alert(
            '¡Cita programada correctamente!'
        );

    }


    /* =====================================================
       ACTUALIZAR CITA
       ===================================================== */

    else {

        citas[indiceEditando] = cita;

        indiceEditando = -1;

        document.getElementById('btnGuardar').innerHTML =
            '📅 Programar cita';

        alert(
            '¡Cita actualizada correctamente!'
        );

    }


    /* =====================================================
       GUARDAR Y MOSTRAR
       ===================================================== */

    guardarCitas();

    mostrarCitas();

    formulario.reset();

    establecerFechaMinima();

});


/* =========================================================
   MOSTRAR CITAS
   ========================================================= */

function mostrarCitas() {

    listaCitas.innerHTML = '';


    /* =====================================================
       CONTADOR
       ===================================================== */

    if (citas.length === 1) {

        contadorCitas.textContent = '1 cita';

    } else {

        contadorCitas.textContent =
            `${citas.length} citas`;

    }


    /* =====================================================
       SIN CITAS
       ===================================================== */

    if (citas.length === 0) {

        listaCitas.innerHTML = `

            <div class="sin-citas">

                <h3>No hay citas programadas</h3>

                <p>
                    Las citas que registres aparecerán aquí.
                </p>

            </div>

        `;

        return;
    }


    /* =====================================================
       MOSTRAR CADA CITA
       ===================================================== */

    citas.forEach(function (cita, index) {

        const elemento =
            document.createElement('div');

        elemento.className = 'cita';


        elemento.innerHTML = `

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
                    <strong>🔧 Tipo de servicio:</strong>
                    ${escapeHTML(cita.tipoServicio)}
                </p>

                <p>
                    <strong>💰 Costo estimado:</strong>
                    Q${Number(cita.costo).toFixed(2)}
                </p>

                <p>
                    <strong>⏱️ Tiempo estimado:</strong>
                    ${escapeHTML(cita.tiempo)}
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
   EDITAR CITA
   ========================================================= */

function editarCita(index) {

    const cita = citas[index];

    if (!cita) {
        return;
    }


    document.getElementById('nombre').value =
        cita.nombre;

    document.getElementById('telefono').value =
        cita.telefono;

    document.getElementById('correo').value =
        cita.correo;

    document.getElementById('marca').value =
        cita.marca;

    document.getElementById('modelo').value =
        cita.modelo;

    document.getElementById('anio').value =
        cita.anio;

    document.getElementById('placa').value =
        cita.placa;

    document.getElementById('tipoServicio').value =
        cita.tipoServicio;

    document.getElementById('fecha').value =
        cita.fecha;

    document.getElementById('hora').value =
        cita.hora;

    document.getElementById('agente').value =
        cita.agente;


    indiceEditando = index;


    document.getElementById('btnGuardar').innerHTML =
        '💾 Actualizar cita';


    formulario.scrollIntoView({
        behavior: 'smooth'
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


    if (indiceEditando === index) {

        indiceEditando = -1;

        formulario.reset();

        document.getElementById('btnGuardar').innerHTML =
            '📅 Programar cita';

        establecerFechaMinima();

    }


}


/* =========================================================
   BOTÓN LIMPIAR
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

    const mes =
        String(hoy.getMonth() + 1).padStart(2, '0');

    const dia =
        String(hoy.getDate()).padStart(2, '0');


    document.getElementById('fecha').min =
        `${anio}-${mes}-${dia}`;

}


/* =========================================================
   FORMATEAR FECHA
   ========================================================= */

function formatearFecha(fecha) {

    if (!fecha) {
        return '';
    }

    const partes = fecha.split('-');

    if (partes.length !== 3) {
        return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/* =========================================================
   FORMATEAR HORA
   ========================================================= */

function formatearHora(hora) {

    if (!hora) {
        return '';
    }

    const partes = hora.split(':');

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
   SEGURIDAD
   ========================================================= */

function escapeHTML(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {
        return '';
    }


    return String(texto)

        .replace(/&/g, '&amp;')

        .replace(/</g, '&lt;')

        .replace(/>/g, '&gt;')

        .replace(/"/g, '&quot;')

        .replace(/'/g, '&#039;');

}