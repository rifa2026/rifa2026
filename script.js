const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzkkN_o8fLs5xVQ0t2OVQNIPO47z5_ReeCkeV_rH-GAiUXmUQV1gm8Fy1JIvEftZJ9SNg/exec";

const grid = document.getElementById("numberGrid");
let vendidos = {};
let numeroActual = null;
let registrando = false;


// Primero dibujamos TODOS los números
function crearNumeros() {
    grid.innerHTML = "";

    for (let i = 100; i <= 300; i++) {
        let div = document.createElement("div");
        div.classList.add("number");
        div.innerText = i;
        div.dataset.numero = i;

        div.onclick = function () {
            if (vendidos[Number(div.dataset.numero)]) return;

            numeroActual = i;
            document.getElementById("numeroSeleccionado").innerText = i;
            document.getElementById("modal").classList.remove("hidden");
        };

        grid.appendChild(div);
    }
}

// Luego cargamos vendidos y los pintamos
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
                div.title = "Vendido a: " + vendidos[num].nombre + " " + vendidos[num].apellido;
            }
        });

    } catch (error) {
        console.log("No se pudieron cargar los vendidos");
    }
}

async function realizarSorteo() {
    let clave = prompt("Contraseña admin:");

    if (clave !== "admin123") {
        alert("Contraseña incorrecta");
        return;
    }

    try {
        const response = await fetch(WEB_APP_URL);
        const data = await response.json();

        if (data.length === 0) {
            alert("No hay números vendidos");
            return;
        }

        let ganador = data[Math.floor(Math.random() * data.length)];

        // Mostrar pantalla especial
        document.getElementById("numeroGrande").innerText = ganador.numero;
        document.getElementById("nombreGanador").innerText =
            ganador.nombre + " " + ganador.apellido;

        document.getElementById("pantallaGanador").classList.remove("hidden");

        // Resaltar número en la grilla
        const div = document.querySelector(`[data-numero='${ganador.numero}']`);
        div.classList.add("ganador-numero");

    } catch (error) {
        alert("Error en el sorteo");
    }
}

function cerrarGanador() {
    document.getElementById("pantallaGanador").classList.add("hidden");
}


async function reiniciarRifa() {
    let clave = prompt("Contraseña de administrador:");

    if (!clave) return;

    if (!confirm("¿Seguro que deseas borrar TODOS los registros?")) {
        return;
    }

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "reset",
                password: clave
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

function cerrarModal() {
    document.getElementById("modal").classList.add("hidden");
    document.getElementById("nombreInput").value = "";
    document.getElementById("apellidoInput").value = "";
}

async function confirmarRegistro() {
    if (registrando) return; // 🔐 evita doble envío
    registrando = true;

    const nombre = document.getElementById("nombreInput").value.trim();
    const apellido = document.getElementById("apellidoInput").value.trim();

    if (!nombre || !apellido) {
        alert("Completa ambos campos");
        registrando = false;
        return;
    }

    const numero = numeroActual;

    const div = document.querySelector(`[data-numero='${numero}']`);
    div.classList.add("sold");
    div.classList.add("loading");

    cerrarModal();

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

        if (result.success) {
            div.classList.remove("loading");
            vendidos[numero] = { nombre, apellido };
            setTimeout(() => {
                cargarVendidos();
            }, 300);

            div.title = `Vendido a: ${nombre} ${apellido}`;
        } else {
            div.classList.remove("sold");
            div.classList.remove("loading");
            alert("Número ya tomado");
        }

    } catch (error) {
        div.classList.remove("sold");
        div.classList.remove("loading");
        alert("Error al registrar");
    }

    registrando = false;
}


// Ejecutar en orden correcto
crearNumeros();
cargarVendidos();
