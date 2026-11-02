const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀" : "☾";
    });
}

const carousel = document.getElementById("photoCarousel");
const track = document.getElementById("carouselTrack");
const dotsContainer = document.getElementById("carouselDots");
const slides = document.querySelectorAll(".carousel-slide");

let currentSlide = 0;
let carouselInterval;
let startX = 0;
let isDragging = false;

if (carousel && track && dotsContainer && slides.length > 0) {
    slides.forEach((slide, index) => {
        const dot = document.createElement("button");

        dot.classList.add("carousel-dot");

        if (index === 0) {
            dot.classList.add("active");
        }

        dot.setAttribute("aria-label", `Ver imagen ${index + 1}`);
        dot.setAttribute("type", "button");

        dot.addEventListener("click", () => {
            showSlide(index);
            restartCarousel();
        });

        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll(".carousel-dot");

    function showSlide(index) {
        if (index < 0) {
            currentSlide = slides.length - 1;
        } else if (index >= slides.length) {
            currentSlide = 0;
        } else {
            currentSlide = index;
        }

        track.style.transform = `translateX(-${currentSlide * 100}%)`;

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentSlide);
        });
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function startCarousel() {
        if (slides.length > 1) {
            carouselInterval = setInterval(nextSlide, 4000);
        }
    }

    function restartCarousel() {
        clearInterval(carouselInterval);
        startCarousel();
    }

    carousel.addEventListener("pointerdown", (event) => {
        if (event.target.closest("button")) return;

        startX = event.clientX;
        isDragging = true;
        carousel.classList.add("dragging");
    });

    carousel.addEventListener("pointerup", (event) => {
        if (!isDragging) return;

        const difference = event.clientX - startX;

        if (difference > 50) {
            showSlide(currentSlide - 1);
            restartCarousel();
        } else if (difference < -50) {
            showSlide(currentSlide + 1);
            restartCarousel();
        }

        isDragging = false;
        carousel.classList.remove("dragging");
    });

    carousel.addEventListener("pointercancel", () => {
        isDragging = false;
        carousel.classList.remove("dragging");
    });

    carousel.addEventListener("pointerleave", () => {
        if (isDragging) {
            isDragging = false;
            carousel.classList.remove("dragging");
        }
    });

    startCarousel();
}

const songSearch = document.getElementById("songSearch");
const songFilter = document.getElementById("songFilter");
const songRows = document.querySelectorAll("#songTableBody tr");
const noSongsMessage = document.getElementById("noSongsMessage");

function filterSongs() {
    if (!songSearch || !songFilter) return;

    const searchText = songSearch.value.toLowerCase().trim();
    const selectedGenre = songFilter.value;

    let visibleSongs = 0;

    songRows.forEach((row) => {
        const songText = row.textContent.toLowerCase();
        const genre = row.dataset.genre;

        const matchesSearch = songText.includes(searchText);
        const matchesGenre = selectedGenre === "todos" || genre === selectedGenre;

        if (matchesSearch && matchesGenre) {
            row.style.display = "";
            visibleSongs++;
        } else {
            row.style.display = "none";
        }
    });

    if (noSongsMessage) {
        noSongsMessage.hidden = visibleSongs !== 0;
    }
}

if (songSearch && songFilter) {
    songSearch.addEventListener("input", filterSongs);
    songFilter.addEventListener("change", filterSongs);
}

const gameFilters = document.querySelectorAll(".filter-btn");
const gameItems = document.querySelectorAll(".game-item");

gameFilters.forEach((button) => {
    button.addEventListener("click", () => {
        const selectedCategory = button.dataset.filter;

        gameFilters.forEach((btn) => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        gameItems.forEach((game) => {
            const category = game.dataset.category;

            game.style.display =
                selectedCategory === "todos" || category === selectedCategory ?
                "" :
                "none";
        });
    });
});

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    const nombre = document.getElementById("nombre");
    const correo = document.getElementById("correo");
    const asunto = document.getElementById("asunto");
    const mensaje = document.getElementById("mensaje");

    const errorNombre = document.getElementById("errorNombre");
    const errorCorreo = document.getElementById("errorCorreo");
    const errorAsunto = document.getElementById("errorAsunto");
    const errorMensaje = document.getElementById("errorMensaje");

    const alertaBox = document.getElementById("alertaBox");

    if (nombre && correo && asunto && mensaje && errorNombre && errorCorreo && errorAsunto && errorMensaje && alertaBox) {
        function mostrarEstado(campo, valido) {
            campo.classList.remove("valid-field", "invalid-field");
            campo.classList.add(valido ? "valid-field" : "invalid-field");
        }

        function validarNombre() {
            const valor = nombre.value.trim();
            const partes = valor.split(/\s+/);
            const nombreValido = /^[\p{L}\s'-]+$/u.test(valor);

            if (valor === "") {
                errorNombre.textContent = "El nombre es obligatorio.";
                mostrarEstado(nombre, false);
                return false;
            }

            if (!nombreValido) {
                errorNombre.textContent = "El nombre solo debe contener letras.";
                mostrarEstado(nombre, false);
                return false;
            }

            if (partes.length < 2) {
                errorNombre.textContent = "Falta escribir al menos un apellido.";
                mostrarEstado(nombre, false);
                return false;
            }

            if (partes.some(parte => parte.length < 2)) {
                errorNombre.textContent = "Escribe correctamente tu nombre y apellido.";
                mostrarEstado(nombre, false);
                return false;
            }

            errorNombre.textContent = "";
            mostrarEstado(nombre, true);
            return true;
        }

        function validarCorreo() {
            const valor = correo.value.trim();
            const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (valor === "") {
                errorCorreo.textContent = "El correo electrónico es obligatorio.";
                mostrarEstado(correo, false);
                return false;
            }

            if (!expresionCorreo.test(valor)) {
                errorCorreo.textContent = "Ingresa un correo electrónico válido.";
                mostrarEstado(correo, false);
                return false;
            }

            errorCorreo.textContent = "";
            mostrarEstado(correo, true);
            return true;
        }

        function validarAsunto() {
            const valor = asunto.value.trim();

            if (valor === "") {
                errorAsunto.textContent = "El asunto es obligatorio.";
                mostrarEstado(asunto, false);
                return false;
            }

            if (valor.length < 3) {
                errorAsunto.textContent = "El asunto debe tener al menos 3 caracteres.";
                mostrarEstado(asunto, false);
                return false;
            }

            errorAsunto.textContent = "";
            mostrarEstado(asunto, true);
            return true;
        }

        function validarMensaje() {
            const valor = mensaje.value.trim();

            if (valor === "") {
                errorMensaje.textContent = "El mensaje es obligatorio.";
                mostrarEstado(mensaje, false);
                return false;
            }

            if (valor.length < 10) {
                errorMensaje.textContent = "El mensaje debe tener al menos 10 caracteres.";
                mostrarEstado(mensaje, false);
                return false;
            }

            errorMensaje.textContent = "";
            mostrarEstado(mensaje, true);
            return true;
        }

        function mostrarAlerta(texto, tipo) {
            alertaBox.textContent = texto;
            alertaBox.className = `alert alert-${tipo} mt-3`;
        }

        function comprobarAnterior(campoActual) {
            let campoInvalido = null;

            if (campoActual === correo && !validarNombre()) {
                campoInvalido = nombre;
            }

            if (campoActual === asunto) {
                if (!validarNombre()) {
                    campoInvalido = nombre;
                } else if (!validarCorreo()) {
                    campoInvalido = correo;
                }
            }

            if (campoActual === mensaje) {
                if (!validarNombre()) {
                    campoInvalido = nombre;
                } else if (!validarCorreo()) {
                    campoInvalido = correo;
                } else if (!validarAsunto()) {
                    campoInvalido = asunto;
                }
            }

            if (campoInvalido) {
                mostrarAlerta("Debes completar correctamente los campos anteriores.", "warning");

                setTimeout(() => {
                    campoInvalido.focus();
                }, 0);

                return false;
            }

            alertaBox.textContent = "";
            alertaBox.className = "";

            return true;
        }

        correo.addEventListener("focus", () => comprobarAnterior(correo));
        asunto.addEventListener("focus", () => comprobarAnterior(asunto));
        mensaje.addEventListener("focus", () => comprobarAnterior(mensaje));

        nombre.addEventListener("blur", validarNombre);
        correo.addEventListener("blur", validarCorreo);
        asunto.addEventListener("blur", validarAsunto);
        mensaje.addEventListener("blur", validarMensaje);

        nombre.addEventListener("input", validarNombre);
        correo.addEventListener("input", validarCorreo);
        asunto.addEventListener("input", validarAsunto);
        mensaje.addEventListener("input", validarMensaje);

        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const nombreValido = validarNombre();
            const correoValido = validarCorreo();
            const asuntoValido = validarAsunto();
            const mensajeValido = validarMensaje();

            if (nombreValido && correoValido && asuntoValido && mensajeValido) {
                mostrarAlerta("¡Formulario validado correctamente!", "success");

                contactForm.reset();

                [nombre, correo, asunto, mensaje].forEach(campo => {
                    campo.classList.remove("valid-field", "invalid-field");
                });

                [errorNombre, errorCorreo, errorAsunto, errorMensaje].forEach(error => {
                    error.textContent = "";
                });
            } else {
                mostrarAlerta(
                    "Completa correctamente todos los campos antes de continuar.",
                    "danger"
                );

                if (!nombreValido) {
                    nombre.focus();
                } else if (!correoValido) {
                    correo.focus();
                } else if (!asuntoValido) {
                    asunto.focus();
                } else {
                    mensaje.focus();
                }
            }
        });
    }
}

const menuLinks = document.querySelectorAll(".navbar-nav .nav-link");
const menuPrincipal = document.getElementById("menuPrincipal");

menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
        if (window.innerWidth < 992 && menuPrincipal && typeof bootstrap !== "undefined") {
            const bootstrapCollapse = bootstrap.Collapse.getInstance(menuPrincipal);

            if (bootstrapCollapse) {
                bootstrapCollapse.hide();
            }
        }
    });
});