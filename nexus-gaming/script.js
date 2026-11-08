const WHATSAPP = "59178826105";

const CLAVE_RESERVAS = "nexusReservas";
const CLAVE_TEMA = "nexusTema";
const CLAVE_PROMO = "nexusPromoFin";

const salas = [{
        id: 1,
        nombre: "PS5 Gaming",
        categoria: "consola",
        precio: 25,
        descripcion: "Disfruta de tus videojuegos favoritos en PlayStation 5.",
        imagen: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800"
    },
    {
        id: 2,
        nombre: "PC Gamer",
        categoria: "pc",
        precio: 30,
        descripcion: "Computadoras gamer para jugar con buen rendimiento.",
        imagen: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800"
    },
    {
        id: 3,
        nombre: "Arcade Retro",
        categoria: "experiencia",
        precio: 15,
        descripcion: "Vuelve a disfrutar los juegos clásicos de arcade.",
        imagen: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800"
    },
    {
        id: 4,
        nombre: "Realidad Virtual",
        categoria: "experiencia",
        precio: 35,
        descripcion: "Explora nuevas experiencias con realidad virtual.",
        imagen: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800"
    },
    {
        id: 5,
        nombre: "Streaming",
        categoria: "pc",
        precio: 40,
        descripcion: "Un espacio preparado para jugar y transmitir en vivo.",
        imagen: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800"
    }
];

let reservas = JSON.parse(localStorage.getItem(CLAVE_RESERVAS)) || [];
let reservaPendiente = null;
let temporizadorConfirmacion = null;

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, function(caracter) {
        const equivalencias = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };
        return equivalencias[caracter];
    });
}

function guardarReservas() {
    localStorage.setItem(CLAVE_RESERVAS, JSON.stringify(reservas));
}

function mostrarToast(mensaje) {
    $("#toast").stop(true, true).text(mensaje).fadeIn(200).delay(2200).fadeOut(400);
}

function cambiarPagina(nombrePagina) {
    $(".page").stop(true, true).hide();
    $("#" + nombrePagina).fadeIn(250);

    $(".nav-btn").removeClass("active");
    $('.nav-btn[data-page="' + nombrePagina + '"]').addClass("active");

    if (nombrePagina === "misreservas") {
        mostrarReservas();
    }
}

$(".nav-btn").on("click", function() {
    cambiarPagina($(this).data("page"));
});

$("[data-go]").on("click", function() {
    cambiarPagina($(this).data("go"));
});

function cargarSalas() {
    const busqueda = $("#searchRoom").val().toLowerCase().trim();
    const categoria = $("#categoryFilter").val();

    const filtradas = salas.filter(function(sala) {
        const coincideNombre = sala.nombre.toLowerCase().includes(busqueda);
        const coincideCategoria = categoria === "todos" || sala.categoria === categoria;
        return coincideNombre && coincideCategoria;
    });

    $("#roomsGrid").hide();

    if (filtradas.length === 0) {
        $("#roomsGrid").html('<p class="empty-message">No se encontraron salas.</p>').fadeIn(250);
        return;
    }

    let contenido = "";

    filtradas.forEach(function(sala) {
        contenido += `
            <article class="room-card">
                <img src="${sala.imagen}" alt="${escaparHTML(sala.nombre)}">
                <div class="room-content">
                    <h3>${escaparHTML(sala.nombre)}</h3>
                    <p>${escaparHTML(sala.descripcion)}</p>
                    <div class="room-price">${sala.precio} Bs / hora</div>
                    <button class="primary-btn" onclick="seleccionarSala(${sala.id})">Reservar esta sala</button>
                </div>
            </article>
        `;
    });

    $("#roomsGrid").html(contenido).fadeIn(300);
}

function cargarOpcionesSalas() {
    let opciones = '<option value="">Seleccionar sala</option>';

    salas.forEach(function(sala) {
        opciones += `<option value="${sala.id}">${escaparHTML(sala.nombre)} - ${sala.precio} Bs/h</option>`;
    });

    $("#roomSelect").html(opciones);
}

function seleccionarSala(id) {
    $("#roomSelect").val(String(id));
    actualizarResumen();
    cambiarPagina("reservar");
}

function obtenerSalaSeleccionada() {
    const id = Number($("#roomSelect").val());
    return salas.find(function(sala) {
        return sala.id === id;
    });
}

function actualizarResumen() {
    const sala = obtenerSalaSeleccionada();
    const horas = Number($("#duracion").val()) || 1;

    if (!sala) {
        $("#resumenSala").text("No seleccionada");
        $("#precioHora").text("0 Bs");
        $("#resumenHoras").text(horas + (horas === 1 ? " hora" : " horas"));
        $("#descuento").text("0 Bs");
        $("#totalPrecio").text("0 Bs");
        return;
    }

    const subtotal = sala.precio * horas;
    const descuento = horas >= 3 ? subtotal * 0.10 : 0;
    const total = subtotal - descuento;

    $("#resumenSala").text(sala.nombre);
    $("#precioHora").text(sala.precio + " Bs");
    $("#resumenHoras").text(horas + (horas === 1 ? " hora" : " horas"));
    $("#descuento").text(descuento.toFixed(2) + " Bs");
    $("#totalPrecio").text(total.toFixed(2) + " Bs");
}

$("#roomSelect, #duracion").on("change", actualizarResumen);

function fechaLocal() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return anio + "-" + mes + "-" + dia;
}

$("#fecha").attr("min", fechaLocal());

function mostrarError(id, mensaje) {
    const campo = $("#" + id);
    campo.toggleClass("invalid", mensaje !== "");

    let error = $("#error-" + id);
    if (error.length === 0) {
        campo.after('<small class="field-error" id="error-' + id + '"></small>');
        error = $("#error-" + id);
    }

    error.text(mensaje);
}

function validarCampo(id) {
    const valor = $("#" + id).val().trim();
    let mensaje = "";

    if (valor === "") {
        mensaje = "Este campo es obligatorio.";
    } else if (id === "nombre" && valor.length < 3) {
        mensaje = "Escribe al menos 3 caracteres.";
    } else if (id === "celular" && !/^[67]\d{7}$/.test(valor)) {
        mensaje = "Ingresa un celular válido de 8 dígitos.";
    } else if (id === "fecha" && valor < fechaLocal()) {
        mensaje = "Selecciona una fecha actual o futura.";
    }

    mostrarError(id, mensaje);
    return mensaje === "";
}

$("#nombre, #celular, #roomSelect, #fecha, #hora").on("input change blur", function() {
    validarCampo(this.id);
});

function validarHorario(fecha, hora, duracion) {
    const fechaSeleccionada = new Date(fecha + "T00:00:00");
    const dia = fechaSeleccionada.getDay();
    const partes = hora.split(":");
    const inicio = Number(partes[0]) * 60 + Number(partes[1]);
    const fin = inicio + duracion * 60;

    let apertura = 600;
    let cierre = 1320;

    if (dia === 6) {
        cierre = 1380;
    }

    if (dia === 0) {
        apertura = 720;
    }

    return inicio >= apertura && fin <= cierre;
}

function validarReserva() {
    const campos = ["nombre", "celular", "roomSelect", "fecha", "hora"];
    let correcto = true;

    campos.forEach(function(id) {
        if (!validarCampo(id)) {
            correcto = false;
        }
    });

    const fecha = $("#fecha").val();
    const hora = $("#hora").val();
    const duracion = Number($("#duracion").val());
    const sala = obtenerSalaSeleccionada();

    if (!sala) {
        mostrarToast("Selecciona una sala.");
        correcto = false;
    }

    if (fecha && hora) {
        const fechaHora = new Date(fecha + "T" + hora);
        if (fechaHora <= new Date()) {
            mostrarToast("La reserva debe ser en una hora futura.");
            correcto = false;
        } else if (!validarHorario(fecha, hora, duracion)) {
            mostrarToast("La hora seleccionada está fuera del horario de atención.");
            correcto = false;
        }
    }

    return correcto;
}

$("#reserveForm").on("submit", function(evento) {
    evento.preventDefault();

    if (!validarReserva()) {
        return;
    }

    const sala = obtenerSalaSeleccionada();
    const horas = Number($("#duracion").val());
    const subtotal = sala.precio * horas;
    const descuento = horas >= 3 ? subtotal * 0.10 : 0;

    reservaPendiente = {
        id: Date.now(),
        nombre: $("#nombre").val().trim(),
        celular: $("#celular").val().trim(),
        sala: sala.nombre,
        precioHora: sala.precio,
        fecha: $("#fecha").val(),
        hora: $("#hora").val(),
        duracion: horas,
        total: subtotal - descuento
    };

    abrirModal();
});

function abrirModal() {
    let segundos = 30;
    $("#confirmTimer").text(segundos);
    $("#confirmModal").css("display", "flex").hide().fadeIn(200);

    clearInterval(temporizadorConfirmacion);

    temporizadorConfirmacion = setInterval(function() {
        segundos--;
        $("#confirmTimer").text(segundos);

        if (segundos <= 0) {
            clearInterval(temporizadorConfirmacion);
            cerrarModal();
            reservaPendiente = null;
            mostrarToast("El tiempo para confirmar terminó.");
        }
    }, 1000);
}

function cerrarModal() {
    clearInterval(temporizadorConfirmacion);
    $("#confirmModal").fadeOut(200);
}

$("#cancelModal").on("click", function() {
    cerrarModal();
    reservaPendiente = null;
    mostrarToast("Reserva cancelada.");
});

$("#confirmBtn").on("click", function() {
    if (!reservaPendiente) {
        return;
    }

    reservas.push(reservaPendiente);
    guardarReservas();
    const reserva = reservaPendiente;
    reservaPendiente = null;
    cerrarModal();
    mostrarReservas();
    mostrarToast("¡Reserva guardada correctamente!");

    const mensaje = "Hola, deseo confirmar mi reserva en NEXUS GAMING LOUNGE.%0A" +
        "Nombre: " + encodeURIComponent(reserva.nombre) + "%0A" +
        "Celular: " + encodeURIComponent(reserva.celular) + "%0A" +
        "Sala: " + encodeURIComponent(reserva.sala) + "%0A" +
        "Fecha: " + encodeURIComponent(reserva.fecha) + "%0A" +
        "Hora: " + encodeURIComponent(reserva.hora) + "%0A" +
        "Duración: " + reserva.duracion + " hora(s)%0A" +
        "Total: " + reserva.total.toFixed(2) + " Bs";

    window.open("https://wa.me/" + WHATSAPP + "?text=" + mensaje, "_blank");
    cambiarPagina("misreservas");
});

function mostrarReservas() {
    if (reservas.length === 0) {
        $("#reservasLista").html('<div class="panel"><p>Todavía no tienes reservas registradas.</p></div>');
        return;
    }

    let contenido = "";

    reservas.forEach(function(reserva) {
        contenido += `
            <div class="reserva-card">
                <h3>${escaparHTML(reserva.sala)}</h3>
                <p><strong>Nombre:</strong> ${escaparHTML(reserva.nombre)}</p>
                <p><strong>Fecha:</strong> ${escaparHTML(reserva.fecha)}</p>
                <p><strong>Hora:</strong> ${escaparHTML(reserva.hora)}</p>
                <p><strong>Duración:</strong> ${reserva.duracion} hora(s)</p>
                <p><strong>Total:</strong> ${Number(reserva.total).toFixed(2)} Bs</p>
                <button onclick="cancelarReserva(${reserva.id})">Cancelar reserva</button>
            </div>
        `;
    });

    $("#reservasLista").html(contenido);
}

function cancelarReserva(id) {
    reservas = reservas.filter(function(reserva) {
        return reserva.id !== id;
    });

    guardarReservas();
    mostrarReservas();
    mostrarToast("Reserva eliminada.");
}

function iniciarTemporizadorPromo() {
    let fin = Number(localStorage.getItem(CLAVE_PROMO));

    if (!fin) {
        fin = Date.now() + 30 * 60 * 1000;
        localStorage.setItem(CLAVE_PROMO, fin);
    }

    let intervaloPromo;

    function actualizar() {
        const restante = Math.max(0, fin - Date.now());
        const horas = Math.floor(restante / 3600000);
        const minutos = Math.floor((restante % 3600000) / 60000);
        const segundos = Math.floor((restante % 60000) / 1000);

        $("#promoTimer").text(
            String(horas).padStart(2, "0") + ":" +
            String(minutos).padStart(2, "0") + ":" +
            String(segundos).padStart(2, "0")
        );

        if (restante <= 0) {
            $("#promoTimer").text("00:00:00");
            $(".promo-info p").text("La promoción ha finalizado.");
            clearInterval(intervaloPromo);
        }
    }

    actualizar();
    intervaloPromo = setInterval(actualizar, 1000);
}

function actualizarEstado() {
    const ahora = new Date();
    const dia = ahora.getDay();
    const minutos = ahora.getHours() * 60 + ahora.getMinutes();

    let apertura = 600;
    let cierre = 1320;

    if (dia === 6) {
        cierre = 1380;
    }

    if (dia === 0) {
        apertura = 720;
    }

    if (minutos >= apertura && minutos < cierre) {
        $("#businessStatus").text("● Estamos abiertos").css("color", "#58d68d");
    } else {
        $("#businessStatus").text("● Estamos cerrados").css("color", "#ff7777");
    }
}

$("#themeBtn").on("click", function() {
    $("body").toggleClass("light-mode");

    const claro = $("body").hasClass("light-mode");
    localStorage.setItem(CLAVE_TEMA, claro ? "claro" : "oscuro");

    $(this).html(claro ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>');
});

$("#searchRoom, #categoryFilter").on("input change", cargarSalas);

$("#socialToggle").on("click", function() {
    $("#socialLinks").stop(true, true).slideToggle(250);
});

$(document).ready(function() {
    cargarSalas();
    cargarOpcionesSalas();
    actualizarResumen();
    mostrarReservas();
    iniciarTemporizadorPromo();
    actualizarEstado();

    if (localStorage.getItem(CLAVE_TEMA) === "claro") {
        $("body").addClass("light-mode");
        $("#themeBtn").html('<i class="fas fa-moon"></i>');
    }

    setInterval(actualizarEstado, 60000);
});