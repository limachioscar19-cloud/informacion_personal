$(function() {
    "use strict";

    const $window = $(window);
    const $body = $("body");

    const esPantallaPequena = function() {
        return window.matchMedia("(max-width: 767px)").matches;
    };

    const $themeToggle = $("#themeToggle");

    function aplicarTema(oscuro) {
        $body.toggleClass("dark-mode", oscuro);
        $themeToggle.text(oscuro ? "☀" : "☾");
        $('meta[name="theme-color"]').attr("content", oscuro ? "#0b1422" : "#101e36");
    }

    try {
        aplicarTema(localStorage.getItem("tema") === "oscuro");
    } catch (error) {
        aplicarTema(false);
    }

    $themeToggle.on("click", function() {
        const oscuro = !$body.hasClass("dark-mode");
        aplicarTema(oscuro);

        try {
            localStorage.setItem("tema", oscuro ? "oscuro" : "claro");
        } catch (error) {}
    });

    const $hamburgerBtn = $("#hamburgerBtn");
    const $navMenu = $("#navMenu");

    function marcarBoton(abierto) {
        $hamburgerBtn
            .toggleClass("open", abierto)
            .attr({
                "aria-expanded": String(abierto),
                "aria-label": abierto ? "Cerrar menú" : "Abrir menú"
            });
    }

    function cerrarMenu() {
        if ($navMenu.is(":visible")) {
            $navMenu.stop(true, true).slideUp(200);
        }

        marcarBoton(false);
    }

    $hamburgerBtn.on("click", function(e) {
        e.stopPropagation();

        const abrir = !$navMenu.is(":visible");

        $navMenu.stop(true, true).slideToggle(300);
        marcarBoton(abrir);
    });

    $(document).on("click", function(e) {
        if (
            $navMenu.is(":visible") &&
            !$(e.target).closest("#navMenu, #hamburgerBtn").length
        ) {
            cerrarMenu();
        }
    });

    $(document).on("keydown", function(e) {
        if (e.key === "Escape") {
            cerrarMenu();
        }
    });

    const $vistas = $(".view");
    const idsVistas = $vistas.map(function() {
        return this.id;
    }).get();

    function mostrarVista(id, guardarHistorial) {
        if (idsVistas.indexOf(id) === -1) {
            id = "inicio";
        }

        $vistas.removeClass("active");
        $("#" + id).addClass("active").scrollTop(0);

        $(".menu-link")
            .removeClass("active")
            .removeAttr("aria-current")
            .filter('[data-view="' + id + '"]')
            .addClass("active")
            .attr("aria-current", "page");

        cerrarMenu();

        if (guardarHistorial && location.hash !== "#" + id) {
            try {
                history.pushState({ vista: id }, "", "#" + id);
            } catch (error) {
                location.hash = id;
            }
        }
    }

    $(document).on("click", 'a[href^="#"]', function(e) {
        const id = (this.getAttribute("href") || "").slice(1);

        if (idsVistas.indexOf(id) !== -1) {
            e.preventDefault();
            mostrarVista(id, true);
        }
    });

    $window.on("popstate hashchange", function() {
        mostrarVista(location.hash.slice(1), false);
    });

    mostrarVista(location.hash.slice(1), false);

    const $carousel = $("#photoCarousel");
    const $track = $("#carouselTrack");
    const $dotsContainer = $("#carouselDots");
    const $slides = $(".carousel-slide");

    if ($carousel.length && $track.length && $dotsContainer.length && $slides.length > 0) {
        let slideActual = 0;
        let intervalo = null;
        let inicioX = 0;
        let arrastrando = false;

        $slides.each(function(index) {
            $("<button>", {
                    type: "button",
                    class: "carousel-dot" + (index === 0 ? " active" : ""),
                    "aria-label": "Ver imagen " + (index + 1)
                })
                .on("click", function() {
                    mostrarSlide(index);
                    reiniciarCarrusel();
                })
                .appendTo($dotsContainer);
        });

        const $dots = $dotsContainer.find(".carousel-dot");

        function mostrarSlide(index) {
            if (index < 0) {
                slideActual = $slides.length - 1;
            } else if (index >= $slides.length) {
                slideActual = 0;
            } else {
                slideActual = index;
            }

            $track.css(
                "transform",
                "translateX(-" + slideActual * 100 + "%)"
            );

            $dots.each(function(i) {
                $(this).toggleClass("active", i === slideActual);
            });
        }

        function iniciarCarrusel() {
            if ($slides.length > 1) {
                intervalo = setInterval(function() {
                    mostrarSlide(slideActual + 1);
                }, 4000);
            }
        }

        function reiniciarCarrusel() {
            clearInterval(intervalo);
            iniciarCarrusel();
        }

        $carousel.on("pointerdown", function(e) {
            if ($(e.target).closest("button").length) return;

            inicioX = e.originalEvent.clientX;
            arrastrando = true;
            $carousel.addClass("dragging");
        });

        $carousel.on("pointerup", function(e) {
            if (!arrastrando) return;

            const diferencia = e.originalEvent.clientX - inicioX;

            if (diferencia > 50) {
                mostrarSlide(slideActual - 1);
                reiniciarCarrusel();
            } else if (diferencia < -50) {
                mostrarSlide(slideActual + 1);
                reiniciarCarrusel();
            }

            arrastrando = false;
            $carousel.removeClass("dragging");
        });

        $carousel.on("pointercancel pointerleave", function() {
            arrastrando = false;
            $carousel.removeClass("dragging");
        });

        iniciarCarrusel();
    }

    $(".info-head").on("click", function() {
        if (!esPantallaPequena()) return;

        const $tarjeta = $(this).closest(".info-card");
        const abrir = !$tarjeta.hasClass("open");

        $(".info-card")
            .removeClass("open")
            .find(".info-head")
            .attr("aria-expanded", "false");

        if (abrir) {
            $tarjeta.addClass("open");
            $(this).attr("aria-expanded", "true");
        }
    });

    $(".sub-tab").on("click", function() {
        const tab = $(this).data("tab");

        $(".sub-tab")
            .removeClass("active")
            .attr("aria-selected", "false");

        $(this)
            .addClass("active")
            .attr("aria-selected", "true");

        $(".sub-panel").removeClass("active");
        $("#tab-" + tab).addClass("active");
    });

    const $songSearch = $("#songSearch");
    const $songFilter = $("#songFilter");
    const $songRows = $("#songTableBody tr");
    const $noSongsMessage = $("#noSongsMessage");

    function filtrarCanciones() {
        const texto = $.trim($songSearch.val()).toLowerCase();
        const generoElegido = $songFilter.val();
        let visibles = 0;

        $songRows.each(function() {
            const $fila = $(this);

            const coincideTexto =
                $fila.text().toLowerCase().indexOf(texto) !== -1;

            const coincideGenero =
                generoElegido === "todos" ||
                $fila.data("genre") === generoElegido;

            const mostrar = coincideTexto && coincideGenero;

            $fila.toggle(mostrar);

            if (mostrar) {
                visibles++;
            }
        });

        $noSongsMessage.prop("hidden", visibles !== 0);
    }

    $songSearch.on("input", filtrarCanciones);
    $songFilter.on("change", filtrarCanciones);

    const $filtrosJuegos = $(".filter-btn");
    const $juegos = $(".game-item");

    $filtrosJuegos.on("click", function() {
        const categoria = $(this).data("filter");

        $filtrosJuegos.removeClass("active");
        $(this).addClass("active");

        $juegos.each(function() {
            const mostrar =
                categoria === "todos" ||
                $(this).data("category") === categoria;

            $(this).toggle(mostrar);
        });

        $(".game-card").removeClass("open");
    });

    $(".game-card").on("click", function() {
        if (!esPantallaPequena()) return;

        const abrir = !$(this).hasClass("open");

        $(".game-card").removeClass("open");

        if (abrir) {
            $(this).addClass("open");
        }
    });

    const $form = $("#pwaForm");

    if ($form.length) {
        const $nombre = $("#nombre");
        const $correo = $("#correo");
        const $asunto = $("#asunto");
        const $mensaje = $("#mensaje");

        const $errorNombre = $("#errorNombre");
        const $errorCorreo = $("#errorCorreo");
        const $errorAsunto = $("#errorAsunto");
        const $errorMensaje = $("#errorMensaje");

        const $alerta = $("#alertaBox");
        const $exito = $("#successAlert");

        function mensajeCampo($error, texto) {
            if (texto) {
                $error.stop(true, true).text(texto).fadeIn(200);
            } else {
                $error.stop(true, true).fadeOut(150, function() {
                    $(this).text("");
                });
            }
        }

        function mostrarEstado($campo, valido) {
            $campo
                .removeClass("valid-field invalid-field")
                .addClass(valido ? "valid-field" : "invalid-field");
        }

        function validarNombre() {
            const valor = $.trim($nombre.val());
            const partes = valor.split(/\s+/);
            const nombreValido = /^[\p{L}\s'-]+$/u.test(valor);

            if (valor === "") {
                mensajeCampo($errorNombre, "El nombre es obligatorio.");
                mostrarEstado($nombre, false);
                return false;
            }

            if (!nombreValido) {
                mensajeCampo($errorNombre, "El nombre solo debe contener letras.");
                mostrarEstado($nombre, false);
                return false;
            }

            if (partes.length < 2) {
                mensajeCampo($errorNombre, "Falta escribir al menos un apellido.");
                mostrarEstado($nombre, false);
                return false;
            }

            if (partes.some(function(parte) {
                    return parte.length < 2;
                })) {
                mensajeCampo($errorNombre, "Escribe correctamente tu nombre y apellido.");
                mostrarEstado($nombre, false);
                return false;
            }

            mensajeCampo($errorNombre, "");
            mostrarEstado($nombre, true);
            return true;
        }

        function validarCorreo() {
            const valor = $.trim($correo.val());
            const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (valor === "") {
                mensajeCampo($errorCorreo, "El correo electrónico es obligatorio.");
                mostrarEstado($correo, false);
                return false;
            }

            if (!expresionCorreo.test(valor)) {
                mensajeCampo($errorCorreo, "Ingresa un correo electrónico válido.");
                mostrarEstado($correo, false);
                return false;
            }

            mensajeCampo($errorCorreo, "");
            mostrarEstado($correo, true);
            return true;
        }

        function validarAsunto() {
            const valor = $.trim($asunto.val());

            if (valor === "") {
                mensajeCampo($errorAsunto, "El asunto es obligatorio.");
                mostrarEstado($asunto, false);
                return false;
            }

            if (valor.length < 3) {
                mensajeCampo($errorAsunto, "El asunto debe tener al menos 3 caracteres.");
                mostrarEstado($asunto, false);
                return false;
            }

            mensajeCampo($errorAsunto, "");
            mostrarEstado($asunto, true);
            return true;
        }

        function validarMensaje() {
            const valor = $.trim($mensaje.val());

            if (valor === "") {
                mensajeCampo($errorMensaje, "El mensaje es obligatorio.");
                mostrarEstado($mensaje, false);
                return false;
            }

            if (valor.length < 10) {
                mensajeCampo($errorMensaje, "El mensaje debe tener al menos 10 caracteres.");
                mostrarEstado($mensaje, false);
                return false;
            }

            mensajeCampo($errorMensaje, "");
            mostrarEstado($mensaje, true);
            return true;
        }

        function mostrarAlerta(texto, tipo) {
            if (tipo === "success") {
                $alerta.text("").attr("class", "");

                $exito
                    .stop(true, true)
                    .text(texto)
                    .slideDown()
                    .delay(3000)
                    .slideUp();
            } else {
                $exito.stop(true, true).hide();
                $alerta
                    .text(texto)
                    .attr("class", "alert alert-" + tipo + " mt-3");
            }
        }

        function comprobarAnterior($campoActual) {
            let campoInvalido = null;

            if ($campoActual.is($correo) && !validarNombre()) {
                campoInvalido = $nombre;
            }

            if ($campoActual.is($asunto)) {
                if (!validarNombre()) {
                    campoInvalido = $nombre;
                } else if (!validarCorreo()) {
                    campoInvalido = $correo;
                }
            }

            if ($campoActual.is($mensaje)) {
                if (!validarNombre()) {
                    campoInvalido = $nombre;
                } else if (!validarCorreo()) {
                    campoInvalido = $correo;
                } else if (!validarAsunto()) {
                    campoInvalido = $asunto;
                }
            }

            if (campoInvalido) {
                mostrarAlerta(
                    "Debes completar correctamente los campos anteriores.",
                    "warning"
                );

                setTimeout(function() {
                    campoInvalido.trigger("focus");
                }, 0);

                return false;
            }

            $alerta.text("").attr("class", "");
            return true;
        }

        $correo.on("focus", function() {
            comprobarAnterior($correo);
        });

        $asunto.on("focus", function() {
            comprobarAnterior($asunto);
        });

        $mensaje.on("focus", function() {
            comprobarAnterior($mensaje);
        });

        $nombre.on("blur input", validarNombre);
        $correo.on("blur input", validarCorreo);
        $asunto.on("blur input", validarAsunto);
        $mensaje.on("blur input", validarMensaje);

        $form.on("submit", function(e) {
            e.preventDefault();

            const nombreValido = validarNombre();
            const correoValido = validarCorreo();
            const asuntoValido = validarAsunto();
            const mensajeValido = validarMensaje();

            if (
                nombreValido &&
                correoValido &&
                asuntoValido &&
                mensajeValido
            ) {
                mostrarAlerta(
                    "¡Formulario validado correctamente!",
                    "success"
                );

                $form[0].reset();

                $nombre
                    .add($correo)
                    .add($asunto)
                    .add($mensaje)
                    .removeClass("valid-field invalid-field");

                $errorNombre
                    .add($errorCorreo)
                    .add($errorAsunto)
                    .add($errorMensaje)
                    .stop(true, true)
                    .hide()
                    .text("");
            } else {
                mostrarAlerta(
                    "Completa correctamente todos los campos antes de continuar.",
                    "danger"
                );

                if (!nombreValido) {
                    $nombre.trigger("focus");
                } else if (!correoValido) {
                    $correo.trigger("focus");
                } else if (!asuntoValido) {
                    $asunto.trigger("focus");
                } else {
                    $mensaje.trigger("focus");
                }
            }
        });
    }
});