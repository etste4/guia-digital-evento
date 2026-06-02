const API_URL = "https://script.google.com/macros/s/AKfycbxVmr4mZX5__aC1J_xt48M4a-pFf7lTDYmmKcFZckwLGe3t9oOS8YdMZUxykoaxwN2gJQ/exec";

document.addEventListener("DOMContentLoaded", () => {
  cargarPrograma();
  setInterval(cargarPrograma, 30000);
});

function openModal(id) {
  document.getElementById(id).style.display = "block";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

async function cargarPrograma() {
  try {
    const res = await fetch(`${API_URL}?action=programa`);
    const json = await res.json();

    if (!json.ok) return;

    const programa = json.data;
    const contenedor = document.getElementById("programaLista");
    contenedor.innerHTML = "";

    const actual = programa.find(item => item.estado === "en_proceso");

    document.getElementById("actividadActual").textContent = actual
      ? actual.actividad
      : "El evento se encuentra en preparación o ha culminado.";

    programa.forEach(item => {
      const div = document.createElement("div");
      div.className = `programa-item ${item.estado}`;

      div.innerHTML = `
        <strong>${item.hora}</strong>
        <h3>${item.actividad}</h3>
        <p>${item.responsable}</p>
        <span class="estado">${formatearEstado(item.estado)}</span>
      `;

      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error("Error cargando programa:", error);
  }
}

function formatearEstado(estado) {
  if (estado === "en_proceso") return "En proceso";
  if (estado === "culminado") return "Culminado";
  return "Pendiente";
}

async function enviarAsistencia() {
  const data = {
    action: "asistencia",
    nombres_apellidos: document.getElementById("asistencia_nombre").value,
    correo: document.getElementById("asistencia_correo").value,
    dni: document.getElementById("asistencia_dni").value,
    cargo: document.getElementById("asistencia_cargo").value,
    dependencia: document.getElementById("asistencia_dependencia").value,
    celular: document.getElementById("asistencia_celular").value
  };

  await enviarDatos(data, "msgAsistencia", "Asistencia registrada correctamente.");
}

async function enviarReflexion() {
  const data = {
    action: "reflexion",
    nombre: document.getElementById("reflexion_nombre").value,
    reflexion: document.getElementById("reflexion_texto").value
  };

  await enviarDatos(data, "msgReflexion", "Gracias. Tu reflexión fue registrada.");
}

async function enviarMemoria() {
  const data = {
    action: "memoria",
    nombre: document.getElementById("memoria_nombre").value,
    medio_envio: document.getElementById("memoria_medio").value,
    correo: document.getElementById("memoria_correo").value,
    telefono: document.getElementById("memoria_telefono").value
  };

  await enviarDatos(data, "msgMemoria", "Solicitud registrada correctamente.");
}

async function enviarDatos(data, msgId, textoOk) {
  const msg = document.getElementById(msgId);
  msg.textContent = "Enviando...";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const json = await res.json();

    if (json.ok) {
      msg.textContent = textoOk;
    } else {
      msg.textContent = "Ocurrió un error. Intenta nuevamente.";
    }

  } catch (error) {
    console.error(error);
    msg.textContent = "No se pudo enviar. Revisa tu conexión.";
  }
}

function mostrarCampoMedio() {
  const medio = document.getElementById("memoria_medio").value;
  document.getElementById("memoria_correo").style.display = medio === "correo" ? "block" : "none";
  document.getElementById("memoria_telefono").style.display = medio === "whatsapp" ? "block" : "none";
}

function compartirLibro(titulo) {
  const texto = `Te comparto esta publicación presentada en el evento del Fondo Editorial UNH: ${titulo}`;
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: titulo,
      text: texto,
      url: url
    });
  } else {
    navigator.clipboard.writeText(`${texto} - ${url}`);
    alert("Enlace copiado al portapapeles.");
  }
}