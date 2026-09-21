/* =========================================================
   FLEXICAR - GESTIÓN DE VEHÍCULOS | TALLER UMG
========================================================= */

'use strict';


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const STORAGE_CITAS = 'flexicarCitas';


/*
    CAMBIA ESTE NÚMERO POR TU PROPIO WHATSAPP.

    Formato Guatemala:
    502 + número

    Ejemplo:
    50255555555

    SIN +, SIN espacios y SIN guiones.
*/

const numeroWhatsApp = "50212345678";


/* =========================================================
   VARIABLES
========================================================= */

let citas = [];

let indiceEditando = -1;

let documentosActuales = [];


/* =========================================================
   SERVICIOS
========================================================= */

const servicios = {

    "Mantenimiento preventivo": {
        costo: 350,
        tiempo: 2,
        categoria: "preventivo"
    },

    "Diagnóstico": {
        costo: 200,
        tiempo: 1,
        categoria: "correctivo"
    },

    "Reparación": {
        costo: 500,
        tiempo: 4,
        categoria: "correctivo"
    },

    "Cambio de aceite": {
        costo: 250,
        tiempo: 1,
        categoria: "preventivo"
    },

    "Cambio de componentes": {
        costo: 400,
        tiempo: 3,
        categoria: "correctivo"
    }

};


/* =========================================================
   ELEMENTOS
========================================================= */

const formulario = document.getElementById('formularioCita');

const tipoServicio =
    document.getElementById('tipoServicio');

const costoEstimado =
    document.getElementById('costoEstimado');

const tiempoEstimado =
    document.getElementById('tiempoEstimado');

const listaCitas =
    document.getElementById('listaCitas');

const contadorCitas =
    document.getElementById('contadorCitas');

const btnLimpiar =
    document.getElementById('btnLimpiar');

const inputDocumentos =
    document.getElementById('documentos');

const listaDocumentosSeleccionados =
    document.getElementById(
        'listaDocumentosSeleccionados'
    );

const totalCitasHoy =
    document.getElementById('totalCitasHoy');

const citasEnProceso =
    document.getElementById('citasEnProceso');

const citasFinalizadas =
    document.getElementById('citasFinalizadas');

const barraProgreso =
    document.getElementById('barraProgreso');

const textoProgreso =
    document.getElementById('textoProgreso');


/* =========================================================
   INICIO
========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    cargarCitas();

    establecerFechaMinima();

    actualizarResumenServicio();

    actualizarDashboard();

    actualizarProgreso();

    configurarValidaciones();

});


/* =========================================================
   CARGAR CITAS
========================================================= */

function cargarCitas() {

    const datos =
        localStorage.getItem(STORAGE_CITAS);

    if (!datos) {

        citas = [];

        renderizarCitas();

        return;
    }


    try {

        citas = JSON.parse(datos);

        if (!Array.isArray(citas)) {
            citas = [];
        }

    } catch (error) {

        console.error(
            "Error al cargar las citas:",
            error
        );

        citas = [];
    }


    renderizarCitas();
}


/* =========================================================
   GUARDAR CITAS
========================================================= */

function guardarCitas() {

    try {

        localStorage.setItem(
            STORAGE_CITAS,
            JSON.stringify(citas)
        );

        return true;

    } catch (error) {

        console.error(
            "Error al guardar:",
            error
        );

        alert(
            "No fue posible guardar los datos. " +
            "Es posible que el almacenamiento del navegador esté lleno."
        );

        return false;
    }
}


/* =========================================================
   FECHA MÍNIMA
========================================================= */

function establecerFechaMinima() {

    const fecha =
        document.getElementById('fecha');

    const hoy =
        new Date();

    const año =
        hoy.getFullYear();

    const mes =
        String(hoy.getMonth() + 1)
            .padStart(2, '0');

    const dia =
        String(hoy.getDate())
            .padStart(2, '0');


    fecha.min =
        `${año}-${mes}-${dia}`;
}


/* =========================================================
   RESUMEN DEL SERVICIO
========================================================= */

tipoServicio.addEventListener(
    'change',
    function () {

        actualizarResumenServicio();

        actualizarProgreso();

    }
);


function actualizarResumenServicio() {

    const servicio =
        servicios[tipoServicio.value];


    if (!servicio) {

        costoEstimado.textContent =
            'Q0.00';

        tiempoEstimado.textContent =
            '0 horas';

        return;
    }


    costoEstimado.textContent =
        `Q${servicio.costo.toFixed(2)}`;


    tiempoEstimado.textContent =
        `${servicio.tiempo} ${
            servicio.tiempo === 1
                ? 'hora'
                : 'horas'
        }`;
}


/* =========================================================
   DOCUMENTOS
========================================================= */

inputDocumentos.addEventListener(
    'change',
    manejarDocumentos
);


function manejarDocumentos(evento) {

    const archivos =
        Array.from(evento.target.files);


    if (archivos.length === 0) {
        return;
    }


    archivos.forEach(
        archivo => {

            const extension =
                archivo.name
                    .split('.')
                    .pop()
                    .toLowerCase();


            const extensionesPermitidas =
                [
                    'pdf',
                    'jpg',
                    'jpeg',
                    'png'
                ];


            if (
                !extensionesPermitidas
                    .includes(extension)
            ) {

                alert(
                    `El archivo "${archivo.name}" ` +
                    `no tiene un formato permitido.`
                );

                return;
            }


            const tamañoMaximo =
                5 * 1024 * 1024;


            if (
                archivo.size >
                tamañoMaximo
            ) {

                alert(
                    `El archivo "${archivo.name}" ` +
                    `supera el límite de 5 MB.`
                );

                return;
            }


            const lector =
                new FileReader();


            lector.onload =
                function (e) {

                    documentosActuales.push({

                        nombre:
                            archivo.name,

                        tipo:
                            archivo.type,

                        tamaño:
                            archivo.size,

                        contenido:
                            e.target.result

                    });


                    renderizarDocumentosSeleccionados();

                };


            lector.readAsDataURL(
                archivo
            );

        }
    );


    inputDocumentos.value = '';

}


/* =========================================================
   MOSTRAR DOCUMENTOS SELECCIONADOS
========================================================= */

function renderizarDocumentosSeleccionados() {

    if (
        documentosActuales.length === 0
    ) {

        listaDocumentosSeleccionados.innerHTML =
            '<p>No hay documentos seleccionados.</p>';

        return;
    }


    listaDocumentosSeleccionados.innerHTML =
        documentosActuales
            .map(
                (documento, indice) => `

                <div class="documento-item">

                    <div class="documento-info">

                        <i class="fa-solid ${
                            obtenerIconoDocumento(
                                documento.tipo
                            )
                        }"></i>

                        <div>

                            <strong>
                                ${escaparHTML(
                                    documento.nombre
                                )}
                            </strong>

                            <span>
                                ${formatearTamaño(
                                    documento.tamaño
                                )}
                            </span>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="btn-eliminar-documento"
                        onclick="eliminarDocumento(${indice})"
                        title="Eliminar documento"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>
            `
            )
            .join('');
}


/* =========================================================
   ELIMINAR DOCUMENTO
========================================================= */

function eliminarDocumento(indice) {

    documentosActuales.splice(
        indice,
        1
    );

    renderizarDocumentosSeleccionados();
}


/* =========================================================
   ICONO DOCUMENTO
========================================================= */

function obtenerIconoDocumento(tipo) {

    if (
        tipo === 'application/pdf'
    ) {
        return 'fa-file-pdf';
    }


    return 'fa-file-image';
}


/* =========================================================
   TAMAÑO
========================================================= */

function formatearTamaño(bytes) {

    if (bytes < 1024) {

        return `${bytes} B`;

    }


    if (bytes < 1024 * 1024) {

        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;

    }


    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;
}


/* =========================================================
   SUBMIT
========================================================= */

formulario.addEventListener(
    'submit',
    function (evento) {

        evento.preventDefault();


        if (!validarFormulario()) {

            alert(
                'Por favor, revise los campos marcados.'
            );

            return;
        }


        const nombre =
            document.getElementById(
                'nombre'
            ).value.trim();


        const telefono =
            document.getElementById(
                'telefono'
            ).value.trim();


        const correo =
            document.getElementById(
                'correo'
            ).value.trim();


        const marca =
            document.getElementById(
                'marca'
            ).value.trim();


        const modelo =
            document.getElementById(
                'modelo'
            ).value.trim();


        const anio =
            document.getElementById(
                'anio'
            ).value;


        const placa =
            document.getElementById(
                'placa'
            ).value.trim();


        const fecha =
            document.getElementById(
                'fecha'
            ).value;


        const hora =
            document.getElementById(
                'hora'
            ).value;


        const agente =
            document.getElementById(
                'agente'
            ).value;


        const servicio =
            tipoServicio.value;


        const datosServicio =
            servicios[servicio];


        /* =========================================
           VALIDAR DUPLICADO
        ========================================= */

        const duplicada =
            citas.some(
                (cita, indice) => {

                    if (
                        indiceEditando !== -1 &&
                        indice === indiceEditando
                    ) {
                        return false;
                    }


                    return (
                        cita.fecha === fecha &&
                        cita.hora === hora &&
                        cita.agente === agente
                    );

                }
            );


        if (duplicada) {

            alert(
                'Ya existe una cita para ese agente, fecha y hora.'
            );

            return;
        }


        /* =========================================
           CREAR CITA
        ========================================= */

        const cita = {

            id:
                indiceEditando === -1
                    ? Date.now()
                    : citas[indiceEditando].id,

            nombre,
            telefono,
            correo,

            marca,
            modelo,
            anio,
            placa,

            servicio,

            categoria:
                datosServicio.categoria,

            costo:
                datosServicio.costo,

            tiempo:
                datosServicio.tiempo,

            fecha,
            hora,
            agente,

            documentos:
                documentosActuales,

            estado:
                indiceEditando === -1
                    ? 'Programada'
                    : citas[indiceEditando].estado,

            fechaCreacion:
                indiceEditando === -1
                    ? new Date().toISOString()
                    : citas[indiceEditando]
                        .fechaCreacion

        };


        /* =========================================
           EDITAR
        ========================================= */

        if (indiceEditando !== -1) {

            citas[indiceEditando] =
                cita;

            alert(
                'La cita fue actualizada correctamente.'
            );

        } else {

            citas.push(cita);

            alert(
                'La cita fue programada correctamente.'
            );


            /*
                NOTIFICACIÓN AL AGENTE / USUARIO
                POR WHATSAPP
            */

            notificarAgenteWhatsApp(cita);
        }


        /* =========================================
           GUARDAR
        ========================================= */

        if (!guardarCitas()) {
            return;
        }


        renderizarCitas();

        actualizarDashboard();

        limpiarFormulario();

    }
);


/* =========================================================
   VALIDAR FORMULARIO
========================================================= */

function validarFormulario() {

    let correcto = true;


    const nombre =
        document.getElementById('nombre');


    const telefono =
        document.getElementById('telefono');


    const correo =
        document.getElementById('correo');


    const fecha =
        document.getElementById('fecha');


    /* NOMBRE */

    if (nombre.value.trim().length < 3) {

        marcarCampo(
            nombre,
            false,
            'Ingrese un nombre válido.'
        );

        correcto = false;

    } else {

        marcarCampo(
            nombre,
            true,
            '✓ Nombre válido'
        );

    }


    /* TELEFONO */

    const telefonoLimpio =
        telefono.value
            .replace(/\D/g, '');


    if (
        telefonoLimpio.length < 8
    ) {

        marcarCampo(
            telefono,
            false,
            'Ingrese un teléfono válido.'
        );

        correcto = false;

    } else {

        marcarCampo(
            telefono,
            true,
            '✓ Teléfono válido'
        );

    }


    /* CORREO */

    const correoValido =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(correo.value);


    if (!correoValido) {

        marcarCampo(
            correo,
            false,
            'Ingrese un correo válido.'
        );

        correcto = false;

    } else {

        marcarCampo(
            correo,
            true,
            '✓ Correo válido'
        );

    }


    /* FECHA */

    if (!fecha.value) {

        marcarCampo(
            fecha,
            false,
            'Seleccione una fecha.'
        );

        correcto = false;

    } else {

        const seleccionada =
            new Date(
                fecha.value +
                'T00:00:00'
            );

        const hoy =
            new Date();

        hoy.setHours(
            0,
            0,
            0,
            0
        );


        if (seleccionada < hoy) {

            marcarCampo(
                fecha,
                false,
                'La fecha no puede ser anterior a hoy.'
            );

            correcto = false;

        } else {

            marcarCampo(
                fecha,
                true,
                '✓ Fecha válida'
            );

        }

    }


    return correcto;
}


/* =========================================================
   MARCAR CAMPO
========================================================= */

function marcarCampo(
    campo,
    valido,
    mensaje
) {

    campo.classList.remove(
        'valido',
        'invalido'
    );


    campo.classList.add(
        valido
            ? 'valido'
            : 'invalido'
    );


    const elementoMensaje =
        document.getElementById(
            `validacion${
                campo.id.charAt(0).toUpperCase() +
                campo.id.slice(1)
            }`
        );


    if (elementoMensaje) {

        elementoMensaje.textContent =
            mensaje;

        elementoMensaje.className =
            `mensaje-validacion ${
                valido
                    ? 'valido'
                    : 'invalido'
            }`;

    }

}


/* =========================================================
   VALIDACIONES EN TIEMPO REAL
========================================================= */

function configurarValidaciones() {

    const campos = [

        document.getElementById('nombre'),

        document.getElementById('telefono'),

        document.getElementById('correo'),

        document.getElementById('marca'),

        document.getElementById('modelo'),

        document.getElementById('anio'),

        document.getElementById('placa'),

        document.getElementById('fecha'),

        document.getElementById('hora'),

        document.getElementById('agente'),

        document.getElementById('tipoServicio')

    ];


    campos.forEach(
        campo => {

            campo.addEventListener(
                'input',
                actualizarProgreso
            );


            campo.addEventListener(
                'change',
                actualizarProgreso
            );

        }
    );


    document
        .getElementById('nombre')
        .addEventListener(
            'blur',
            validarFormulario
        );


    document
        .getElementById('telefono')
        .addEventListener(
            'blur',
            validarFormulario
        );


    document
        .getElementById('correo')
        .addEventListener(
            'blur',
            validarFormulario
        );


    document
        .getElementById('fecha')
        .addEventListener(
            'blur',
            validarFormulario
        );

}


/* =========================================================
   PROGRESO
========================================================= */

function actualizarProgreso() {

    const campos = [

        document.getElementById('nombre'),

        document.getElementById('telefono'),

        document.getElementById('correo'),

        document.getElementById('marca'),

        document.getElementById('modelo'),

        document.getElementById('anio'),

        document.getElementById('placa'),

        document.getElementById('tipoServicio'),

        document.getElementById('fecha'),

        document.getElementById('hora'),

        document.getElementById('agente')

    ];


    let completos = 0;


    campos.forEach(
        campo => {

            if (
                campo &&
                campo.value.trim() !== ''
            ) {

                completos++;

            }

        }
    );


    const porcentaje =
        Math.max(
            20,
            Math.round(
                (completos /
                    campos.length) *
                100
            )
        );


    barraProgreso.style.width =
        `${porcentaje}%`;


    let paso = 1;


    if (completos >= 3) {
        paso = 2;
    }


    if (completos >= 7) {
        paso = 3;
    }


    if (completos >= 9) {
        paso = 4;
    }


    if (completos === campos.length) {
        paso = 5;
    }


    textoProgreso.textContent =
        `Paso ${paso} de 5`;
}


/* =========================================================
   RENDERIZAR CITAS
========================================================= */

function renderizarCitas() {

    contadorCitas.textContent =
        citas.length;


    if (citas.length === 0) {

        listaCitas.innerHTML = `

            <div class="sin-citas">

                <i class="fa-regular fa-calendar-xmark"></i>

                <h3>No hay citas programadas</h3>

                <p>
                    Las citas que registre aparecerán aquí.
                </p>

            </div>

        `;

        return;
    }


    listaCitas.innerHTML =
        citas
            .map(
                (cita, indice) =>
                    crearCardCita(
                        cita,
                        indice
                    )
            )
            .join('');
}


/* =========================================================
   CREAR CARD DE CITA
========================================================= */

function crearCardCita(
    cita,
    indice
) {

    const esCorrectivo =
        cita.categoria === 'correctivo';


    const claseCategoria =
        esCorrectivo
            ? 'correctivo'
            : 'preventivo';


    const claseEstado =
        cita.estado === 'Finalizada'
            ? 'estado-finalizada'
            : 'estado-programada';


    const iconoEstado =
        cita.estado === 'Finalizada'
            ? 'fa-circle-check'
            : 'fa-clock';


    let documentosHTML = '';


    if (
        cita.documentos &&
        cita.documentos.length > 0
    ) {

        documentosHTML = `

            <div class="documentos-cita">

                <div class="documentos-cita-titulo">

                    <i class="fa-solid fa-paperclip"></i>

                    Documentación
                    (${cita.documentos.length})

                </div>


                <div class="documentos-cita-lista">

                    ${
                        cita.documentos
                            .map(
                                (
                                    documento,
                                    indiceDocumento
                                ) => `

                                <div class="documento-cita">

                                    <i class="fa-solid ${
                                        obtenerIconoDocumento(
                                            documento.tipo
                                        )
                                    }"></i>

                                    <span>
                                        ${escaparHTML(
                                            documento.nombre
                                        )}
                                    </span>

                                    <button
                                        onclick="abrirDocumento(
                                            ${indice},
                                            ${indiceDocumento}
                                        )"
                                        title="Ver documento"
                                    >
                                        <i class="fa-solid fa-eye"></i>
                                    </button>

                                </div>
                            `
                            )
                            .join('')
                    }

                </div>

            </div>

        `;

    }


    return `

        <article class="cita-card ${claseCategoria}">

            <div class="cita-linea"></div>


            <div class="cita-contenido">

                <div class="cita-superior">

                    <div class="cita-cliente">

                        <h3>
                            <i class="fa-solid fa-user"></i>
                            ${escaparHTML(
                                cita.nombre
                            )}
                        </h3>

                        <p>
                            ${escaparHTML(
                                cita.marca
                            )}
                            ${escaparHTML(
                                cita.modelo
                            )}
                            • Placa:
                            ${escaparHTML(
                                cita.placa
                            )}
                        </p>

                    </div>


                    <span class="estado ${claseEstado}">

                        <i class="fa-solid ${iconoEstado}"></i>

                        ${cita.estado}

                    </span>

                </div>


                <div class="cita-datos">

                    <div class="dato-cita">

                        <span>Servicio</span>

                        <strong>
                            <i class="fa-solid fa-wrench"></i>
                            ${escaparHTML(
                                cita.servicio
                            )}
                        </strong>

                    </div>


                    <div class="dato-cita">

                        <span>Fecha</span>

                        <strong>
                            <i class="fa-solid fa-calendar"></i>
                            ${formatearFecha(
                                cita.fecha
                            )}
                        </strong>

                    </div>


                    <div class="dato-cita">

                        <span>Hora</span>

                        <strong>
                            <i class="fa-solid fa-clock"></i>
                            ${escaparHTML(
                                cita.hora
                            )}
                        </strong>

                    </div>


                    <div class="dato-cita">

                        <span>Agente</span>

                        <strong>
                            <i class="fa-solid fa-user-tie"></i>
                            ${escaparHTML(
                                cita.agente
                            )}
                        </strong>

                    </div>

                </div>


                ${documentosHTML}


                <div class="cita-acciones">

                    <button
                        class="btn-cita btn-whatsapp"
                        onclick="notificarClienteWhatsApp(
                            ${indice}
                        )"
                        title="Enviar WhatsApp al cliente"
                    >
                        <i class="fa-brands fa-whatsapp"></i>
                        Cliente
                    </button>


                    ${
                        cita.estado !== 'Finalizada'
                            ? `

                            <button
                                class="btn-cita btn-finalizar"
                                onclick="finalizarCita(
                                    ${indice}
                                )"
                                title="Finalizar mantenimiento"
                            >
                                <i class="fa-solid fa-circle-check"></i>
                                Finalizar
                            </button>

                            `
                            : ''
                    }


                    <button
                        class="btn-cita btn-editar"
                        onclick="editarCita(
                            ${indice}
                        )"
                        title="Editar cita"
                    >
                        <i class="fa-solid fa-pen"></i>
                        Editar
                    </button>


                    <button
                        class="btn-cita btn-eliminar"
                        onclick="eliminarCita(
                            ${indice}
                        )"
                        title="Eliminar cita"
                    >
                        <i class="fa-solid fa-trash"></i>
                        Eliminar
                    </button>

                </div>

            </div>

        </article>

    `;
}


/* =========================================================
   FORMATEAR FECHA
========================================================= */

function formatearFecha(fecha) {

    if (!fecha) {
        return '';
    }


    const partes =
        fecha.split('-');


    if (partes.length !== 3) {
        return fecha;
    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


/* =========================================================
   EDITAR CITA
========================================================= */

function editarCita(indice) {

    const cita =
        citas[indice];


    if (!cita) {
        return;
    }


    indiceEditando =
        indice;


    document.getElementById(
        'nombre'
    ).value =
        cita.nombre;


    document.getElementById(
        'telefono'
    ).value =
        cita.telefono;


    document.getElementById(
        'correo'
    ).value =
        cita.correo;


    document.getElementById(
        'marca'
    ).value =
        cita.marca;


    document.getElementById(
        'modelo'
    ).value =
        cita.modelo;


    document.getElementById(
        'anio'
    ).value =
        cita.anio;


    document.getElementById(
        'placa'
    ).value =
        cita.placa;


    document.getElementById(
        'tipoServicio'
    ).value =
        cita.servicio;


    document.getElementById(
        'fecha'
    ).value =
        cita.fecha;


    document.getElementById(
        'hora'
    ).value =
        cita.hora;


    document.getElementById(
        'agente'
    ).value =
        cita.agente;


    documentosActuales =
        Array.isArray(cita.documentos)
            ? [...cita.documentos]
            : [];


    renderizarDocumentosSeleccionados();

    actualizarResumenServicio();

    actualizarProgreso();


    document.getElementById(
        'btnGuardar'
    ).innerHTML = `

        <i class="fa-solid fa-floppy-disk"></i>

        Actualizar Cita

    `;


    document.querySelector(
        '#formulario h2'
    ).innerHTML = `

        <i class="fa-solid fa-pen"></i>

        Editar cita

    `;


    document.getElementById(
        'formulario'
    ).scrollIntoView({
        behavior: 'smooth'
    });

}


/* =========================================================
   ELIMINAR CITA
========================================================= */

function eliminarCita(indice) {

    const cita =
        citas[indice];


    if (!cita) {
        return;
    }


    const confirmar =
        confirm(
            `¿Desea eliminar la cita de ${cita.nombre}?`
        );


    if (!confirmar) {
        return;
    }


    citas.splice(
        indice,
        1
    );


    if (!guardarCitas()) {
        return;
    }


    renderizarCitas();

    actualizarDashboard();


    alert(
        'La cita fue eliminada correctamente.'
    );
}


/* =========================================================
   FINALIZAR CITA
========================================================= */

function finalizarCita(indice) {

    const cita =
        citas[indice];


    if (!cita) {
        return;
    }


    const confirmar =
        confirm(
            `¿Desea marcar como finalizado el mantenimiento de ${cita.nombre}?`
        );


    if (!confirmar) {
        return;
    }


    cita.estado =
        'Finalizada';


    cita.fechaFinalizacion =
        new Date().toISOString();


    if (!guardarCitas()) {
        return;
    }


    renderizarCitas();

    actualizarDashboard();


    alert(
        'Mantenimiento finalizado correctamente.\n\n' +
        'Ahora puede utilizar el botón de WhatsApp ' +
        'para notificar al cliente que su vehículo está listo.'
    );
}


/* =========================================================
   WHATSAPP AGENTE / USUARIO
========================================================= */

function notificarAgenteWhatsApp(cita) {

    const mensaje = `

🚗 *NUEVA CITA - TALLER UMG*

👤 Cliente:
${cita.nombre}

📱 Teléfono:
${cita.telefono}

📧 Correo:
${cita.correo}

🚘 Vehículo:
${cita.marca} ${cita.modelo} (${cita.anio})

🔖 Placa:
${cita.placa}

🔧 Servicio:
${cita.servicio}

💰 Costo estimado:
Q${cita.costo.toFixed(2)}

⏱️ Tiempo estimado:
${cita.tiempo} horas

📅 Fecha:
${formatearFecha(cita.fecha)}

🕐 Hora:
${cita.hora}

👨‍🔧 Agente:
${cita.agente}

📎 Documentos:
${
    cita.documentos
        ? cita.documentos.length
        : 0
} archivo(s)

Por favor, prepararse para atender al cliente.
`;


    abrirWhatsApp(
        numeroWhatsApp,
        mensaje
    );
}


/* =========================================================
   WHATSAPP CLIENTE
========================================================= */

function notificarClienteWhatsApp(indice) {

    const cita =
        citas[indice];


    if (!cita) {
        return;
    }


    let mensaje;


    if (
        cita.estado === 'Finalizada'
    ) {

        mensaje = `

🚗 *TALLER UMG - FLEXICAR*

Hola ${cita.nombre}.

Le informamos que el mantenimiento de su vehículo ha finalizado.

🚘 Vehículo:
${cita.marca} ${cita.modelo}

🔖 Placa:
${cita.placa}

🔧 Servicio realizado:
${cita.servicio}

📅 Cita:
${formatearFecha(cita.fecha)}

🕐 Hora:
${cita.hora}

✅ *Su vehículo está listo.*

Gracias por confiar en Taller UMG.
`;

    } else {

        mensaje = `

🚗 *TALLER UMG - FLEXICAR*

Hola ${cita.nombre}.

Le recordamos que tiene una cita programada para su vehículo.

🚘 Vehículo:
${cita.marca} ${cita.modelo}

🔖 Placa:
${cita.placa}

🔧 Servicio:
${cita.servicio}

📅 Fecha:
${formatearFecha(cita.fecha)}

🕐 Hora:
${cita.hora}

👨‍🔧 Agente:
${cita.agente}

Gracias por confiar en Taller UMG.
`;

    }


    abrirWhatsApp(
        cita.telefono,
        mensaje
    );
}


/* =========================================================
   ABRIR WHATSAPP
========================================================= */

function abrirWhatsApp(
    numero,
    mensaje
) {

    const numeroLimpio =
        numero
            .replace(/\D/g, '');


    if (!numeroLimpio) {

        alert(
            'No hay un número de WhatsApp válido.'
        );

        return;
    }


    const url =
        `https://wa.me/${numeroLimpio}` +
        `?text=${encodeURIComponent(
            mensaje.trim()
        )}`;


    window.open(
        url,
        '_blank'
    );
}


/* =========================================================
   ABRIR DOCUMENTO
========================================================= */

function abrirDocumento(
    indiceCita,
    indiceDocumento
) {

    const cita =
        citas[indiceCita];


    if (!cita) {
        return;
    }


    const documento =
        cita.documentos[
            indiceDocumento
        ];


    if (!documento) {
        return;
    }


    const ventana =
        window.open();


    if (!ventana) {

        alert(
            'El navegador bloqueó la ventana emergente.'
        );

        return;
    }


    ventana.document.write(`

        <!DOCTYPE html>

        <html lang="es">

        <head>

            <meta charset="UTF-8">

            <title>
                ${escaparHTML(
                    documento.nombre
                )}
            </title>

            <style>

                body {
                    margin: 0;
                    padding: 20px;
                    background: #0f172a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                }

                img {
                    max-width: 95vw;
                    max-height: 95vh;
                }

                iframe {
                    width: 95vw;
                    height: 95vh;
                    border: none;
                    background: white;
                }

            </style>

        </head>

        <body>

            ${
                documento.tipo ===
                'application/pdf'

                ?

                `<iframe
                    src="${documento.contenido}"
                ></iframe>`

                :

                `<img
                    src="${documento.contenido}"
                    alt="${escaparHTML(
                        documento.nombre
                    )}"
                >`
            }

        </body>

        </html>

    `);

}


/* =========================================================
   LIMPIAR FORMULARIO
========================================================= */

btnLimpiar.addEventListener(
    'click',
    function () {

        limpiarFormulario();

    }
);


function limpiarFormulario() {

    formulario.reset();


    indiceEditando = -1;


    documentosActuales = [];


    renderizarDocumentosSeleccionados();


    actualizarResumenServicio();


    actualizarProgreso();


    document
        .querySelectorAll(
            'input'
        )
        .forEach(
            input => {

                input.classList.remove(
                    'valido',
                    'invalido'
                );

            }
        );


    document
        .querySelectorAll(
            '.mensaje-validacion'
        )
        .forEach(
            mensaje => {

                mensaje.textContent =
                    '';

                mensaje.className =
                    'mensaje-validacion';

            }
        );


    document.getElementById(
        'btnGuardar'
    ).innerHTML = `

        <i class="fa-solid fa-calendar-plus"></i>

        Programar Cita

    `;


    document.querySelector(
        '#formulario h2'
    ).innerHTML = `

        <i class="fa-solid fa-calendar-plus"></i>

        Programar una cita

    `;

}


/* =========================================================
   DASHBOARD
========================================================= */

function actualizarDashboard() {

    const hoy =
        obtenerFechaHoy();


    const citasHoy =
        citas.filter(
            cita =>
                cita.fecha === hoy
        );


    const finalizadas =
        citas.filter(
            cita =>
                cita.estado ===
                'Finalizada'
        );


    const enProceso =
        citas.filter(
            cita =>
                cita.estado !==
                'Finalizada'
        );


    totalCitasHoy.textContent =
        citasHoy.length;


    citasEnProceso.textContent =
        enProceso.length;


    citasFinalizadas.textContent =
        finalizadas.length;
}


/* =========================================================
   FECHA ACTUAL
========================================================= */

function obtenerFechaHoy() {

    const hoy =
        new Date();


    const año =
        hoy.getFullYear();


    const mes =
        String(
            hoy.getMonth() + 1
        ).padStart(
            2,
            '0'
        );


    const dia =
        String(
            hoy.getDate()
        ).padStart(
            2,
            '0'
        );


    return `${año}-${mes}-${dia}`;
}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {

        return '';

    }


    return String(texto)
        .replace(
            /&/g,
            '&amp;'
        )
        .replace(
            /</g,
            '&lt;'
        )
        .replace(
            />/g,
            '&gt;'
        )
        .replace(
            /"/g,
            '&quot;'
        )
        .replace(
            /'/g,
            '&#039;'
        );
}


/* =========================================================
   FIN
========================================================= */