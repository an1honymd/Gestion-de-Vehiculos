/* =========================================================
   FLEXICAR - SISTEMA DE CITAS
   ========================================================= */

'use strict';


/* =========================================================
   ELEMENTOS
   ========================================================= */

const formulario =
    document.getElementById('formularioCita');

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

const costoEstimado =
    document.getElementById('costoEstimado');

const tiempoEstimado =
    document.getElementById('tiempoEstimado');


/* =========================================================
   VARIABLES
   ========================================================= */

let citas = [];

let indiceEditando = -1;

let documentosActuales = [];

const STORAGE_CITAS =
    'flexicarCitas';


/* =========================================================
   SERVICIOS
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
   INICIO
   ========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    function () {

        cargarCitas();

        establecerFechaMinima();

        mostrarCitas();

        actualizarResumenServicio();

        mostrarDocumentosSeleccionados();

    }
);


/* =========================================================
   ACTUALIZAR COSTO Y TIEMPO
   ========================================================= */

const tipoServicio =
    document.getElementById(
        'tipoServicio'
    );


if (tipoServicio) {

    tipoServicio.addEventListener(
        'change',
        actualizarResumenServicio
    );

}


function actualizarResumenServicio() {

    const servicioSeleccionado =
        document.getElementById(
            'tipoServicio'
        ).value;


    if (
        !servicios[
            servicioSeleccionado
        ]
    ) {

        costoEstimado.textContent =
            'Q0.00';

        tiempoEstimado.textContent =
            '--';

        return;

    }


    costoEstimado.textContent =
        'Q' +
        servicios[
            servicioSeleccionado
        ].costo.toFixed(2);


    tiempoEstimado.textContent =
        servicios[
            servicioSeleccionado
        ].tiempo;

}


/* =========================================================
   CARGAR CITAS
   ========================================================= */

function cargarCitas() {

    const datos =
        localStorage.getItem(
            STORAGE_CITAS
        );


    if (datos) {

        try {

            citas =
                JSON.parse(datos);

        } catch (error) {

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
   SELECCIONAR DOCUMENTOS
   ========================================================= */

if (inputDocumentos) {

    inputDocumentos.addEventListener(
        'change',
        function () {

            documentosActuales = [];


            const archivos =
                Array.from(
                    inputDocumentos.files
                );


            if (
                archivos.length === 0
            ) {

                mostrarDocumentosSeleccionados();

                return;

            }


            const extensionesPermitidas = [

                'pdf',

                'jpg',

                'jpeg',

                'png'

            ];


            let archivosProcesados = 0;


            archivos.forEach(
                function (archivo) {

                    const extension =
                        obtenerExtension(
                            archivo.name
                        );


                    if (
                        !extensionesPermitidas
                            .includes(
                                extension
                            )
                    ) {

                        alert(

                            'El archivo ' +
                            archivo.name +
                            ' no tiene un formato permitido.'

                        );

                        archivosProcesados++;

                        return;

                    }


                    if (
                        archivo.size >
                        5 * 1024 * 1024
                    ) {

                        alert(

                            'El archivo ' +
                            archivo.name +
                            ' supera el tamaño máximo de 5 MB.'

                        );

                        archivosProcesados++;

                        return;

                    }


                    const lector =
                        new FileReader();


                    lector.onload =
                        function (evento) {

                            documentosActuales.push({

                                nombre:
                                    archivo.name,

                                tipo:
                                    archivo.type,

                                tamaño:
                                    archivo.size,

                                contenido:
                                    evento.target.result

                            });


                            archivosProcesados++;


                            mostrarDocumentosSeleccionados();

                        };


                    lector.readAsDataURL(
                        archivo
                    );

                }
            );

        }
    );

}


/* =========================================================
   MOSTRAR DOCUMENTOS SELECCIONADOS
   ========================================================= */

function mostrarDocumentosSeleccionados() {

    if (
        !listaDocumentosSeleccionados
    ) {

        return;

    }


    if (
        documentosActuales.length === 0
    ) {

        listaDocumentosSeleccionados.innerHTML = `

            <p>
                No hay documentos seleccionados.
            </p>

        `;

        return;

    }


    listaDocumentosSeleccionados.innerHTML = `

        <h4>
            📎 Documentos adjuntos
        </h4>

    `;


    documentosActuales.forEach(
        function (
            documento,
            indice
        ) {

            const elemento =
                document.createElement(
                    'div'
                );


            elemento.className =
                'documento-seleccionado';


            elemento.innerHTML = `

                <span>

                    📄
                    ${escapeHTML(
                        documento.nombre
                    )}

                </span>


                <button
                    type="button"
                    onclick="eliminarDocumentoSeleccionado(${indice})"
                >

                    ❌

                </button>

            `;


            listaDocumentosSeleccionados
                .appendChild(
                    elemento
                );

        }
    );

}


/* =========================================================
   ELIMINAR DOCUMENTO SELECCIONADO
   ========================================================= */

function eliminarDocumentoSeleccionado(
    indice
) {

    documentosActuales.splice(
        indice,
        1
    );


    mostrarDocumentosSeleccionados();

}


/* =========================================================
   PROGRAMAR CITA
   ========================================================= */

formulario.addEventListener(
    'submit',
    function (evento) {

        evento.preventDefault();


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


        const tipoServicioSeleccionado =
            document.getElementById(
                'tipoServicio'
            ).value;


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


        /* ================================================
           VALIDAR SERVICIO
           ================================================ */

        if (
            !servicios[
                tipoServicioSeleccionado
            ]
        ) {

            alert(
                'Seleccione un tipo de servicio válido.'
            );

            return;

        }


        const costo =
            servicios[
                tipoServicioSeleccionado
            ].costo;


        const tiempo =
            servicios[
                tipoServicioSeleccionado
            ].tiempo;


        /* ================================================
           VALIDAR FECHA
           ================================================ */

        const hoy =
            new Date();


        hoy.setHours(
            0,
            0,
            0,
            0
        );


        const fechaSeleccionada =
            new Date(
                fecha +
                'T00:00:00'
            );


        if (
            fechaSeleccionada < hoy
        ) {

            alert(
                'No puede seleccionar una fecha anterior a hoy.'
            );

            return;

        }


        /* ================================================
           CITA DUPLICADA
           ================================================ */

        const citaDuplicada =
            citas.some(
                function (
                    cita,
                    indice
                ) {

                    if (
                        indice ===
                        indiceEditando
                    ) {

                        return false;

                    }


                    return (

                        cita.fecha ===
                        fecha &&

                        cita.hora ===
                        hora &&

                        cita.agente ===
                        agente

                    );

                }
            );


        if (citaDuplicada) {

            alert(

                'El agente seleccionado ya tiene una cita programada para esa fecha y hora.'

            );

            return;

        }


        /* ================================================
           CREAR CITA
           ================================================ */

        const nuevaCita = {

            id:
                Date.now(),

            nombre:
                nombre,

            telefono:
                telefono,

            correo:
                correo,

            marca:
                marca,

            modelo:
                modelo,

            anio:
                anio,

            placa:
                placa,

            tipoServicio:
                tipoServicioSeleccionado,

            costo:
                costo,

            tiempo:
                tiempo,

            fecha:
                fecha,

            hora:
                hora,

            agente:
                agente,

            estado:
                'Programada',

            notificacionAgente:
                false,

            notificacionCliente:
                false,

            documentos:
                documentosActuales

        };


        /* ================================================
           NUEVA CITA
           ================================================ */

        if (
            indiceEditando === -1
        ) {

            citas.push(
                nuevaCita
            );


            guardarCitas();

            mostrarCitas();


            formulario.reset();


            documentosActuales = [];


            mostrarDocumentosSeleccionados();


            actualizarResumenServicio();


            establecerFechaMinima();


            alert(

                '✅ Cita programada correctamente.\n\n' +

                'Cliente: ' +
                nombre +

                '\nAgente: ' +
                agente +

                '\nServicio: ' +
                tipoServicioSeleccionado +

                '\nCosto estimado: Q' +
                costo.toFixed(2) +

                '\nTiempo estimado: ' +
                tiempo +

                '\nDocumentos adjuntos: ' +
                nuevaCita.documentos.length

            );


            /*
               Abre WhatsApp con el mensaje preparado.
            */

            notificarAgenteWhatsApp(
                nuevaCita
            );


        } else {

            /* ==========================================
               ACTUALIZAR
               ========================================== */

            nuevaCita.id =
                citas[
                    indiceEditando
                ].id;


            nuevaCita.estado =
                citas[
                    indiceEditando
                ].estado;


            nuevaCita.notificacionAgente =
                citas[
                    indiceEditando
                ].notificacionAgente;


            nuevaCita.notificacionCliente =
                citas[
                    indiceEditando
                ].notificacionCliente;


            citas[
                indiceEditando
            ] =
                nuevaCita;


            guardarCitas();

            mostrarCitas();


            formulario.reset();


            documentosActuales = [];


            mostrarDocumentosSeleccionados();


            actualizarResumenServicio();


            establecerFechaMinima();


            indiceEditando = -1;


            document.getElementById(
                'btnGuardar'
            ).innerHTML =
                '📅 Programar cita';


            alert(
                '✅ Cita actualizada correctamente.'
            );

        }

    }
);


/* =========================================================
   MOSTRAR CITAS
   ========================================================= */

function mostrarCitas() {

    if (!listaCitas) {

        return;

    }


    contadorCitas.textContent =

        citas.length +

        (
            citas.length === 1
                ? ' cita'
                : ' citas'
        );


    if (
        citas.length === 0
    ) {

        listaCitas.innerHTML = `

            <div class="sin-citas">

                <p>
                    📅 No hay citas programadas.
                </p>

            </div>

        `;

        return;

    }


    listaCitas.innerHTML = '';


    citas.forEach(
        function (
            cita,
            indice
        ) {

            const tarjeta =
                document.createElement(
                    'div'
                );


            tarjeta.className =
                'cita';


            let estadoClase =
                '';


            if (
                cita.estado ===
                'Finalizada'
            ) {

                estadoClase =
                    'finalizada';

            }


            /* =========================================
               DOCUMENTOS
               ========================================= */

            let htmlDocumentos =
                '';


            if (
                cita.documentos &&
                cita.documentos.length > 0
            ) {

                htmlDocumentos = `

                    <div class="documentos-cita">

                        <h4>
                            📎 Documentación
                        </h4>


                        <div class="lista-documentos-cita">

                            ${cita.documentos
                                .map(
                                    function (
                                        documento,
                                        documentoIndex
                                    ) {

                                        return `

                                            <div
                                                class="documento-cita">

                                                <span>

                                                    📄
                                                    ${escapeHTML(
                                                        documento.nombre
                                                    )}

                                                </span>


                                                <button
                                                    type="button"
                                                    onclick="abrirDocumento(
                                                        ${indice},
                                                        ${documentoIndex}
                                                    )"
                                                >

                                                    👁️ Ver

                                                </button>

                                            </div>

                                        `;

                                    }
                                )
                                .join('')}

                        </div>

                    </div>

                `;

            } else {

                htmlDocumentos = `

                    <div class="documentos-cita">

                        <p>
                            📎 No hay documentos adjuntos.
                        </p>

                    </div>

                `;

            }


            /* =========================================
               TARJETA
               ========================================= */

            tarjeta.innerHTML = `

                <div
                    class="estado ${estadoClase}"
                >

                    ${escapeHTML(
                        cita.estado
                    )}

                </div>


                <h3>

                    🚗
                    ${escapeHTML(
                        cita.marca
                    )}

                    ${escapeHTML(
                        cita.modelo
                    )}

                </h3>


                <div class="informacion-cita">


                    <p>

                        👤
                        <strong>
                            Cliente:
                        </strong>

                        ${escapeHTML(
                            cita.nombre
                        )}

                    </p>


                    <p>

                        📞
                        <strong>
                            Teléfono:
                        </strong>

                        ${escapeHTML(
                            cita.telefono
                        )}

                    </p>


                    <p>

                        📧
                        <strong>
                            Correo:
                        </strong>

                        ${escapeHTML(
                            cita.correo
                        )}

                    </p>


                    <p>

                        🚘
                        <strong>
                            Placa:
                        </strong>

                        ${escapeHTML(
                            cita.placa
                        )}

                    </p>


                    <p>

                        🔧
                        <strong>
                            Servicio:
                        </strong>

                        ${escapeHTML(
                            cita.tipoServicio
                        )}

                    </p>


                    <p>

                        💰
                        <strong>
                            Costo estimado:
                        </strong>

                        Q${Number(
                            cita.costo
                        ).toFixed(2)}

                    </p>


                    <p>

                        ⏱️
                        <strong>
                            Tiempo estimado:
                        </strong>

                        ${escapeHTML(
                            cita.tiempo
                        )}

                    </p>


                    <p>

                        📅
                        <strong>
                            Fecha:
                        </strong>

                        ${formatearFecha(
                            cita.fecha
                        )}

                    </p>


                    <p>

                        🕐
                        <strong>
                            Hora:
                        </strong>

                        ${formatearHora(
                            cita.hora
                        )}

                    </p>


                    <p>

                        👨‍🔧
                        <strong>
                            Agente:
                        </strong>

                        ${escapeHTML(
                            cita.agente
                        )}

                    </p>


                </div>


                ${htmlDocumentos}


                <div class="acciones">


                    ${
                        cita.estado !==
                        'Finalizada'

                        ?

                        `

                            <button
                                class="btn-editar"
                                onclick="editarCita(${indice})"
                            >

                                ✏️ Editar

                            </button>


                            <button
                                class="btn-eliminar"
                                onclick="eliminarCita(${indice})"
                            >

                                🗑️ Eliminar

                            </button>


                            <button
                                class="btn-finalizar"
                                onclick="finalizarCita(${indice})"
                            >

                                ✅ Finalizar mantenimiento

                            </button>


                            <button
                                class="btn-whatsapp"
                                onclick="notificarAgenteWhatsApp(citas[${indice}])"
                            >

                                📱 Notificar agente

                            </button>

                        `

                        :

                        `

                            <button
                                class="btn-eliminar"
                                onclick="eliminarCita(${indice})"
                            >

                                🗑️ Eliminar

                            </button>


                            <button
                                class="btn-whatsapp"
                                onclick="notificarClienteWhatsApp(citas[${indice}])"
                            >

                                📱 Notificar cliente

                            </button>

                        `

                    }


                </div>

            `;


            listaCitas.appendChild(
                tarjeta
            );

        }
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
        window.open(
            '',
            '_blank'
        );


    if (!ventana) {

        alert(
            'El navegador bloqueó la ventana. Permita ventanas emergentes.'
        );

        return;

    }


    if (
        documento.tipo ===
        'application/pdf'
    ) {

        ventana.document.write(`

            <html>

                <head>

                    <title>
                        ${escapeHTML(
                            documento.nombre
                        )}
                    </title>

                </head>


                <body
                    style="
                        margin:0;
                        height:100vh;
                    "
                >

                    <embed
                        src="${documento.contenido}"
                        type="application/pdf"
                        width="100%"
                        height="100%"
                    >

                </body>

            </html>

        `);

    } else {

        ventana.document.write(`

            <html>

                <head>

                    <title>
                        ${escapeHTML(
                            documento.nombre
                        )}
                    </title>

                </head>


                <body
                    style="
                        margin:0;
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        background:#f2f5f9;
                    "
                >

                    <img
                        src="${documento.contenido}"
                        style="
                            max-width:95%;
                            max-height:95vh;
                            object-fit:contain;
                        "
                    >

                </body>

            </html>

        `);

    }


    ventana.document.close();

}


/* =========================================================
   WHATSAPP DEL AGENTE
   ========================================================= */

function notificarAgenteWhatsApp(
    cita
) {

    if (!cita) {

        return;

    }


    /*
       =====================================================
       COLOCA AQUÍ TU NÚMERO DE WHATSAPP
       =====================================================

       Guatemala utiliza el código 502.

       Ejemplo:

       50255555555

       Reemplaza ese número por TU número.
       =====================================================
    */

    const numeroWhatsApp =
        "50212345678";


    const cantidadDocumentos =
        cita.documentos
            ? cita.documentos.length
            : 0;


    const mensaje =

        '🚗 *FLEXICAR - NUEVA CITA*%0A%0A' +

        'Se ha programado una nueva cita.%0A%0A' +

        '👤 Cliente: ' +
        cita.nombre +
        '%0A' +

        '📞 Teléfono: ' +
        cita.telefono +
        '%0A' +

        '🚗 Vehículo: ' +
        cita.marca +
        ' ' +
        cita.modelo +
        '%0A' +

        '🔢 Placa: ' +
        cita.placa +
        '%0A' +

        '🔧 Servicio: ' +
        cita.tipoServicio +
        '%0A' +

        '💰 Costo estimado: Q' +
        Number(
            cita.costo
        ).toFixed(2) +
        '%0A' +

        '⏱️ Tiempo estimado: ' +
        cita.tiempo +
        '%0A' +

        '📅 Fecha: ' +
        formatearFecha(
            cita.fecha
        ) +
        '%0A' +

        '🕐 Hora: ' +
        formatearHora(
            cita.hora
        ) +
        '%0A' +

        '📎 Documentos adjuntos: ' +
        cantidadDocumentos;


    const url =

        'https://wa.me/' +

        numeroWhatsApp +

        '?text=' +

        mensaje;


    window.open(
        url,
        '_blank'
    );


    cita.notificacionAgente =
        true;


    guardarCitas();

}


/* =========================================================
   WHATSAPP DEL CLIENTE
   ========================================================= */

function notificarClienteWhatsApp(
    cita
) {

    if (!cita) {

        return;

    }


    let telefono =
        cita.telefono;


    telefono =
        telefono.replace(
            /[^0-9]/g,
            ''
        );


    /*
       Si el número tiene 8 dígitos,
       se agrega 502 automáticamente.
    */

    if (
        telefono.length === 8
    ) {

        telefono =
            '502' +
            telefono;

    }


    if (
        telefono.length < 10
    ) {

        alert(

            'El número de teléfono del cliente no es válido para WhatsApp.'

        );

        return;

    }


    const mensaje =

        '🚗 *FLEXICAR*%0A%0A' +

        'Hola ' +
        cita.nombre +
        ', le informamos que el mantenimiento de su vehículo ha finalizado.%0A%0A' +

        '🚗 Vehículo: ' +
        cita.marca +
        ' ' +
        cita.modelo +
        '%0A' +

        '🔢 Placa: ' +
        cita.placa +
        '%0A' +

        '🔧 Servicio realizado: ' +
        cita.tipoServicio +
        '%0A' +

        '💰 Costo estimado: Q' +
        Number(
            cita.costo
        ).toFixed(2) +
        '%0A%0A' +

        '✅ Su vehículo está listo para ser recogido.%0A%0A' +

        'Gracias por confiar en *FlexiCar*.';


    const url =

        'https://wa.me/' +

        telefono +

        '?text=' +

        mensaje;


    window.open(
        url,
        '_blank'
    );


    cita.notificacionCliente =
        true;


    guardarCitas();

}


/* =========================================================
   EDITAR CITA
   ========================================================= */

function editarCita(
    indice
) {

    const cita =
        citas[indice];


    if (!cita) {

        return;

    }


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
        cita.tipoServicio;


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
        cita.documentos
            ? [...cita.documentos]
            : [];


    mostrarDocumentosSeleccionados();


    actualizarResumenServicio();


    indiceEditando =
        indice;


    document.getElementById(
        'btnGuardar'
    ).innerHTML =
        '💾 Actualizar cita';


    window.scrollTo({

        top: 0,

        behavior: 'smooth'

    });

}


/* =========================================================
   ELIMINAR CITA
   ========================================================= */

function eliminarCita(
    indice
) {

    const cita =
        citas[indice];


    if (!cita) {

        return;

    }


    const confirmar =
        confirm(

            '¿Está seguro de eliminar la cita de ' +
            cita.nombre +
            '?'

        );


    if (!confirmar) {

        return;

    }


    citas.splice(
        indice,
        1
    );


    guardarCitas();

    mostrarCitas();


    alert(
        '🗑️ Cita eliminada correctamente.'
    );

}


/* =========================================================
   FINALIZAR MANTENIMIENTO
   ========================================================= */

function finalizarCita(
    indice
) {

    const cita =
        citas[indice];


    if (!cita) {

        return;

    }


    const confirmar =
        confirm(

            '¿Desea marcar como FINALIZADO el mantenimiento de ' +
            cita.nombre +
            '?'

        );


    if (!confirmar) {

        return;

    }


    cita.estado =
        'Finalizada';


    cita.notificacionCliente =
        false;


    guardarCitas();

    mostrarCitas();


    alert(

        '✅ Mantenimiento finalizado.\n\n' +

        'Ahora presione el botón:\n' +

        '📱 Notificar cliente\n\n' +

        'para enviar el aviso por WhatsApp.'

    );

}


/* =========================================================
   BOTÓN LIMPIAR
   ========================================================= */

if (btnLimpiar) {

    btnLimpiar.addEventListener(
        'click',
        function () {

            formulario.reset();


            indiceEditando =
                -1;


            documentosActuales =
                [];


            mostrarDocumentosSeleccionados();


            actualizarResumenServicio();


            document.getElementById(
                'btnGuardar'
            ).innerHTML =
                '📅 Programar cita';


            establecerFechaMinima();

        }
    );

}


/* =========================================================
   FECHA MÍNIMA
   ========================================================= */

function establecerFechaMinima() {

    const campoFecha =
        document.getElementById(
            'fecha'
        );


    if (!campoFecha) {

        return;

    }


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


    campoFecha.min =
        `${año}-${mes}-${dia}`;

}


/* =========================================================
   FORMATEAR FECHA
   ========================================================= */

function formatearFecha(
    fecha
) {

    if (!fecha) {

        return '';

    }


    const partes =
        fecha.split('-');


    if (
        partes.length !== 3
    ) {

        return fecha;

    }


    return (

        partes[2] +
        '/' +
        partes[1] +
        '/' +
        partes[0]

    );

}


/* =========================================================
   FORMATEAR HORA
   ========================================================= */

function formatearHora(
    hora
) {

    if (!hora) {

        return '';

    }


    const partes =
        hora.split(':');


    let horas =
        parseInt(
            partes[0]
        );


    const minutos =
        partes[1];


    const periodo =
        horas >= 12
            ? 'PM'
            : 'AM';


    if (
        horas === 0
    ) {

        horas = 12;

    } else if (
        horas > 12
    ) {

        horas -= 12;

    }


    return (

        horas +
        ':' +
        minutos +
        ' ' +
        periodo

    );

}


/* =========================================================
   OBTENER EXTENSIÓN
   ========================================================= */

function obtenerExtension(
    nombreArchivo
) {

    return nombreArchivo
        .split('.')
        .pop()
        .toLowerCase();

}


/* =========================================================
   SEGURIDAD HTML
   ========================================================= */

function escapeHTML(
    texto
) {

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