const API_URL = "https://script.google.com/macros/s/AKfycbwNthcDH5XbULL6YaEQjbivAeX6sLQ-x7gTTqwFrN2t-iC5IsYXgpMAKkZo39rbDIjqVQ/exec";

const LIBROS = {
  libro1: {
    titulo: "La Recta Real",
    autores: ["Dr. Cesar Castañeda Campos"],
    descripcion: "Libro presentado por el Fondo Editorial UNH en el marco de la presentación de libros.",
    imagen: "filles/libro3.png"
  },
  libro2: {
    titulo: "Herramientas de Planificación",
    autores: [
      "Joel Lenner Castañeda Dueñas",
      "Elsa Castro Chauca",
      "Jorge Garma Malpartida",
      "Juan José Oré Rojas",
      "Edith Yesica Olarte Huamán",
      "Miguel Ángel Suárez Vargas",
      "Hugo Saavedra Caballero",
      "Fredy César Mendoza Cruz"
    ],
    descripcion: "Libro práctico y esencial para docentes y estudiantes que buscan fortalecer el pensamiento crítico mediante la planificación.",
    imagen: "filles/libro2.png"
  },
  libro3: {
    titulo: "Prueba de Hipótesis Estadística",
    autores: [
      "Félix Amadeo Canales Conce",
      "Franklin Poma Castellanos"
    ],
    descripcion: "Publicación aplicada a educación con soporte de Minitab.",
    imagen: "filles/libro1.png"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  cargarPrograma();
  setInterval(cargarPrograma, 30000);
  window.addEventListener("scroll", toggleFloatingNavigation, { passive: true });
  toggleFloatingNavigation();
});

function openModal(id) {
  document.getElementById(id).style.display = "block";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function toggleFloatingNavigation() {
  const bottomNav = document.querySelector(".bottom-nav");
  const scrollTopButton = document.getElementById("scrollTopButton");
  const scrollY = window.scrollY || window.pageYOffset;
  const showBottomNav = scrollY > 180;
  const showScrollTop = scrollY > 320;

  if (bottomNav) {
    bottomNav.classList.toggle("is-visible", showBottomNav);
  }

  if (scrollTopButton) {
    scrollTopButton.classList.toggle("is-visible", showScrollTop);
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function cargarPrograma() {
  try {
    const res = await fetch(`${API_URL}?action=programa`);
    const json = await res.json();

    if (!json.ok) return;

    const programa = json.data;
    const contenedor = document.getElementById("programaLista");
    contenedor.innerHTML = "";

    programa.forEach(item => {
      const div = document.createElement("div");
      div.className = `programa-item ${item.estado}`;

      div.innerHTML = `
        <div class="programa-item-head">
          <strong>${item.hora}</strong>
          <span class="estado">${formatearEstado(item.estado)}</span>
        </div>
        <h3>${item.actividad}</h3>
        <p>${item.responsable || ""}</p>
        <span class="estado">${formatearEstado(item.estado)}</span>
      `;

      div.querySelector(".estado:last-child").remove();

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
  const camposObligatorios = ["reflexion_texto"];

  if (!validarCampos(camposObligatorios, "msgReflexion")) {
    return;
  }

  const nombre = document.getElementById("reflexion_nombre").value.trim() || "Anónimo";

  const data = {
    action: "reflexion",
    nombre: nombre,
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

function openBookDetail(libroId) {
  const libro = LIBROS[libroId];

  if (!libro) {
    return;
  }

  const imagen = document.getElementById("detalleLibroImagen");
  const titulo = document.getElementById("detalleLibroTitulo");
  const autores = document.getElementById("detalleLibroAutores");
  const descripcion = document.getElementById("detalleLibroDescripcion");
  const compartir = document.getElementById("detalleLibroCompartir");

  imagen.src = libro.imagen;
  imagen.alt = `Portada del libro ${libro.titulo}`;
  titulo.textContent = libro.titulo;
  autores.textContent = libro.autores.join(" • ");
  descripcion.textContent = libro.descripcion;
  compartir.onclick = () => compartirLibro(libro.titulo);

  openModal("modalLibroDetalle");
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