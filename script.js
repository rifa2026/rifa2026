const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzkkN_o8fLs5xVQ0t2OVQNIPO47z5_ReeCkeV_rH-GAiUXmUQV1gm8Fy1JIvEftZJ9SNg/exec";

const grid = document.getElementById("numberGrid");

let vendidos = {};
let numeroActual = null;
let registrando = false;
let adminAutorizado = false;
let adminPassword = "";

/* =========================
   CREAR NUMEROS
========================= */
function crearNumeros() {
    grid.innerHTML = "";

    for (let i = 100; i <= 300; i++) {
        let div = document.createElement("div");
        div.classList.add("number");
        div.innerText = i;
        div.dataset.numero = i;

        div.onclick = function () {

            if (!adminAutorizado) {
                alert("Solo el administrador puede registrar números");
                return;
            }

            if (vendidos[i]) return;

            numeroActual = i;
            document.getElementById("numeroSeleccionado").innerText = i;
            document.getElementById("modal").classList.remove("hidden");
        };

        grid.appendChild(div);
    }
}

/* =========================
   ACTIVAR ADMIN
========================= */
function activarAdmin() {
    document.getElementById("modalPassword").classList.remove("hidden");
}

function cerrarPassword() {
    document.getElementById("modalPassword").classList.add("hidden");
    document.getElementById("passwordInput").value = "";
}

async function confirmarPassword() {

    const password = document.getElementById("passwordInput").value.trim();
    if (!password) return;

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "validar_admin",
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            adminAutorizado = true;
            adminPassword = password; // 🔥 guardar password
            alert("Modo administrador activado");
            cerrarPassword();
        } else {
            alert("Contraseña incorrecta");
        }

    } catch (error) {
        alert("Error al validar");
    }
}

/* =========================
   CARGAR VENDIDOS
========================= */
async function cargarVendidos() {
    try {
        const response = await fetch(WEB_APP_URL);
        const data = await response.json();

        vendidos = {};

        data.forEach(item => {
            vendidos[item.numero] = item;
        });

        document.querySelectorAll(".number").forEach(div => {
            let num = Number(div.dataset.numero);

            if (vendidos[num]) {
                div.classList.add("sold");
                div.title = vendidos[num].nombre + " " + vendidos[num].apellido;
            }
        });

    } catch (error) {
        console.log("Error cargando vendidos");
    }
}

/* =========================
   SORTEO
========================= */
async function realizarSorteo() {

    if (!adminAutorizado) {
        alert("Solo el administrador puede realizar el sorteo");
        return;
    }

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "sorteo",
                password: adminPassword
            })
        });

        const result = await response.json();

        if (!result.success) {
            alert(result.message);
            return;
        }

        alert("Ganador: " + result.nombre + " " + result.apellido +
              " con el número " + result.numero);

    } catch (error) {
        alert("Error en el sorteo");
    }
}

/* =========================
   RESET
========================= */
async function reiniciarRifa() {

    if (!adminAutorizado) {
        alert("Solo el administrador puede reiniciar la rifa");
        return;
    }

    if (!confirm("¿Seguro que deseas borrar TODOS los registros?")) return;

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "reset",
                password: adminPassword
            })
        });

        const result = await response.json();

        if (result.success) {
            alert("Rifa reiniciada correctamente");
            location.reload();
        } else {
            alert(result.message);
        }

    } catch (error) {
        alert("Error al reiniciar");
    }
}

/* =========================
   REGISTRAR
========================= */
async function confirmarRegistro() {

    if (!adminAutorizado) {
        alert("Solo admin puede registrar");
        return;
    }

    if (registrando) return;
    registrando = true;

    const nombre = document.getElementById("nombreInput").value.trim();
    const apellido = document.getElementById("apellidoInput").value.trim();

    if (!nombre || !apellido) {
        alert("Completa ambos campos");
        registrando = false;
        return;
    }

    const numero = numeroActual;

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({
                numero,
                nombre,
                apellido
            })
        });

        const result = await response.json();

        if (!result.success) {
            alert(result.message);
        } else {
            vendidos[numero] = { nombre, apellido };
            location.reload();
        }

    } catch (error) {
        alert("Error al registrar");
    }

    registrando = false;
}

/* =========================
   INICIALIZAR
========================= */
crearNumeros();
cargarVendidos();
