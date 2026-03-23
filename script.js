
// SCROLL SUAVE (solo anchors internos)

document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", e => {
    if (link.hash && link.href.includes(window.location.pathname)) {
      e.preventDefault();
      const target = document.querySelector(link.hash);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth"
        });
      }
    }
  });
});


// CERTS DESPLEGABLES

document.querySelectorAll(".cert-btn").forEach(button => {
  button.addEventListener("click", () => {

    document.querySelectorAll(".cert-content").forEach(c => {
      if (c !== button.nextElementSibling) {
        c.style.maxHeight = null;
      }
    });

    const content = button.nextElementSibling;

    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});

// NAV DROPDOWNS (múltiples)
const navMains = document.querySelectorAll(".nav-main");

navMains.forEach(btn => {
  btn.addEventListener("click", function () {
    const sub = this.nextElementSibling;

    // cerrar otros dropdowns
    document.querySelectorAll(".nav-sub").forEach(menu => {
      if (menu !== sub) {
        menu.style.display = "none";
      }
    });

    // toggle actual
    sub.style.display = sub.style.display === "flex" ? "none" : "flex";
  });
});

// =========================
// MARKDOWN RENDER (WRITEUPS)
// =========================

marked.setOptions({
  breaks: true,
  gfm: true
});

const content = document.getElementById("content");
const file = new URLSearchParams(window.location.search).get("file");

if (content && file) {

  fetch(`Writeups/${file}`)
    .then(res => {
      if (!res.ok) throw new Error("No se encontró el archivo");
      return res.text();
    })
    .then(md => {

      const base = window.location.origin + "/Writeups/";

      // 🔥 arreglar rutas de imágenes
      md = md.replaceAll("](Imágenes/", `](${base}Imágenes/`);
      md = md.replaceAll("](imagenes/", `](${base}imagenes/`);

      // 🔥 render markdown
      content.innerHTML = marked.parse(md);
    })
    .catch(err => {
      content.innerHTML = "<p style='color:red;'>Error cargando writeup</p>";
      console.error(err);
    });

}
