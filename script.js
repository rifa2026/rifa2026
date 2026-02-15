const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzkkN_o8fLs5xVQ0t2OVQNIPO47z5_ReeCkeV_rH-GAiUXmUQV1gm8Fy1JIvEftZJ9SNg/exec";

const grid = document.getElementById("numberGrid");

let vendidos = {};
let numeroActual = null;
let registrando = false;

// Crear números
function crearNumeros() {
    grid.innerHTML = "";

    for (let i = 100; i <= 300; i++) {
        let div = document.createElement("div");
        div.classList.add("number");
        div.innerText = i;
        div.dataset.numero = i;

        div.onclick = function () {
            if (vendidos[i]) return;

            numeroActual = i;
            document.getElementById("numeroSeleccionado").innerText = i;
            document.getElementById("modal").classList.remove("hidden");
        };

        grid.appendChild(div);
    }
}

// Cargar vendidos
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

// Sorteo
async function realizarSorteo() {
    let clave = prompt("Contraseña admin:");

    if (clave !== "20s@nto$26") {
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

        document.getElementById("numeroGrande").innerText = ganador.numero;
        document.getElementById("nombreGanador").innerText =
            ganador.nombre + " " + ganador.apellido;

        document.getElementById("pantallaGanador").style.display = "flex";

        document.querySelectorAll(".ganador-numero")
            .forEach(el => el.classList.remove("ganador-numero"));

        const div = document.querySelector(`[data-numero='${ganador.numero}']`);
        div.classList.add("ganador-numero");

    } catch (error) {
        alert("Error en el sorteo");
    }
}

function cerrarGanador() {
    document.getElementById("pantallaGanador").style.display = "none";
}

// Reiniciar
async function reiniciarRifa() {
    let clave = prompt("Contraseña de administrador:");
    if (!clave) return;

    if (!confirm("¿Seguro que deseas borrar TODOS los registros?")) return;

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

// Modal
function cerrarModal() {
    document.getElementById("modal").classList.add("hidden");
    document.getElementById("nombreInput").value = "";
    document.getElementById("apellidoInput").value = "";
}

// Confirmar registro
async function confirmarRegistro() {
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
    const div = document.querySelector(`[data-numero='${numero}']`);

    div.classList.add("sold");
    cerrarModal();

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({ numero, nombre, apellido })
        });

        const result = await response.json();

        if (!result.success) {
            div.classList.remove("sold");
            alert("Número ya tomado");
        } else {
            vendidos[numero] = { nombre, apellido };
        }

    } catch (error) {
        div.classList.remove("sold");
        alert("Error al registrar");
    }

    registrando = false;
}

// Inicializar
crearNumeros();
cargarVendidos();
