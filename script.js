const API_URL = "https://script.google.com/macros/s/AKfycbwNthcDH5XbULL6YaEQjbivAeX6sLQ-x7gTTqwFrN2t-iC5IsYXgpMAKkZo39rbDIjqVQ/exec";

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
  const camposObligatorios = [
    "asistencia_nombre",
    "asistencia_correo",
    "asistencia_dni",
    "asistencia_cargo",
    "asistencia_dependencia",
    "asistencia_celular"
  ];

  if (!validarCampos(camposObligatorios, "msgAsistencia")) {
    return;
  }

  const data = {
    action: "asistencia",
    nombres_apellidos: document.getElementById("asistencia_nombre").value.trim(),
    correo: document.getElementById("asistencia_correo").value.trim(),
    dni: document.getElementById("asistencia_dni").value.trim(),
    cargo: document.getElementById("asistencia_cargo").value.trim(),
    dependencia: document.getElementById("asistencia_dependencia").value.trim(),
    celular: document.getElementById("asistencia_celular").value.trim()
  };

  await enviarDatos(data, "msgAsistencia", "Asistencia registrada correctamente.", "modalAsistencia");
}

async function enviarReflexion() {
  const camposObligatorios = ["reflexion_nombre", "reflexion_texto"];

  if (!validarCampos(camposObligatorios, "msgReflexion")) {
    return;
  }

  const data = {
    action: "reflexion",
    nombre: document.getElementById("reflexion_nombre").value.trim(),
    reflexion: document.getElementById("reflexion_texto").value.trim()
  };

  await enviarDatos(data, "msgReflexion", "Gracias. Tu reflexión fue registrada.", "modalReflexion");
}

async function enviarMemoria() {
  const camposObligatorios = ["memoria_nombre", "memoria_medio"];
  const medio = document.getElementById("memoria_medio").value;

  if (medio === "correo") {
    camposObligatorios.push("memoria_correo");
  }

  if (medio === "whatsapp") {
    camposObligatorios.push("memoria_telefono");
  }

  if (!validarCampos(camposObligatorios, "msgMemoria")) {
    return;
  }

  const data = {
    action: "memoria",
    nombre: document.getElementById("memoria_nombre").value.trim(),
    medio_envio: medio,
    correo: document.getElementById("memoria_correo").value.trim(),
    telefono: document.getElementById("memoria_telefono").value.trim()
  };

  await enviarDatos(data, "msgMemoria", "Solicitud registrada correctamente.", "modalMemoria");
}

async function enviarDatos(data, msgId, textoOk, modalId) {
  const msg = document.getElementById(msgId);
  msg.textContent = "Enviando...";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const json = await res.json();

    if (json.ok) {
      limpiarFormulario(modalId);
      msg.textContent = "";
      mostrarExito(modalId, textoOk);
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
  const correo = document.getElementById("memoria_correo");
  const telefono = document.getElementById("memoria_telefono");

  correo.style.display = medio === "correo" ? "block" : "none";
  telefono.style.display = medio === "whatsapp" ? "block" : "none";

  correo.required = medio === "correo";
  telefono.required = medio === "whatsapp";

  if (medio !== "correo") {
    correo.value = "";
    correo.classList.remove("input-error");
  }

  if (medio !== "whatsapp") {
    telefono.value = "";
    telefono.classList.remove("input-error");
  }
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

function validarCampos(ids, msgId) {
  let valido = true;
  const msg = document.getElementById(msgId);

  ids.forEach(id => {
    const campo = document.getElementById(id);
    campo.classList.remove("input-error");

    if (!campo.value.trim()) {
      campo.classList.add("input-error");
      valido = false;
    }
  });

  if (!valido) {
    msg.textContent = "Completa todos los campos obligatorios.";
    msg.style.color = "#dc2626";
    return false;
  }

  msg.textContent = "";
  msg.style.color = "#16a34a";
  return true;
}

function limpiarFormulario(modalId) {
  const modal = document.getElementById(modalId);
  const campos = modal.querySelectorAll("input, select, textarea");
  const mensajes = modal.querySelectorAll(".msg");

  campos.forEach(campo => {
    campo.value = "";
    campo.classList.remove("input-error");
  });

  mensajes.forEach(mensaje => {
    mensaje.textContent = "";
  });

  const correo = document.getElementById("memoria_correo");
  const telefono = document.getElementById("memoria_telefono");

  if (correo) correo.style.display = "none";
  if (telefono) telefono.style.display = "none";
}

function mostrarExito(modalId, texto) {
  const modal = document.getElementById(modalId);
  const content = modal.querySelector(".modal-content");
  const existente = content.querySelector(".success-box");

  if (existente) {
    existente.remove();
  }

  const success = document.createElement("div");
  success.className = "success-box";
  success.innerHTML = `
    <div class="success-icon">✓</div>
    <h3>Registro exitoso</h3>
    <p>${texto}</p>
  `;

  content.appendChild(success);

  setTimeout(() => {
    success.remove();
    closeModal(modalId);
  }, 2200);
}

function obtenerTextoBoton(modalId) {
  if (modalId === "modalAsistencia") return "Guardar asistencia";
  if (modalId === "modalReflexion") return "Enviar reflexión";
  if (modalId === "modalMemoria") return "Solicitar memoria";
  return "Enviar";
}