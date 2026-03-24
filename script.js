document.addEventListener("DOMContentLoaded", () => {

  const content = document.getElementById("content");

  // ========================
  // Smooth scroll
  // ========================
  document.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", e => {
      if (link.hash && link.href.includes(window.location.pathname)) {
        e.preventDefault();
        const target = document.querySelector(link.hash);
        if (target) target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // ========================
  // Certificados toggle
  // ========================
  document.querySelectorAll(".cert-btn").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".cert-content").forEach(c => {
        if (c !== button.nextElementSibling) {
          c.style.maxHeight = null;
        }
      });

      const box = button.nextElementSibling;

      if (box.style.maxHeight) {
        box.style.maxHeight = null;
      } else {
        box.style.maxHeight = box.scrollHeight + "px";
      }
    });
  });

  // ========================
  // Navbar dropdown
  // ========================
  document.querySelectorAll(".nav-main").forEach(btn => {
    btn.addEventListener("click", function () {
      const sub = this.nextElementSibling;

      document.querySelectorAll(".nav-sub").forEach(menu => {
        if (menu !== sub) menu.style.display = "none";
      });

      sub.style.display = sub.style.display === "flex" ? "none" : "flex";
    });
  });

  // ========================
  // MARKDOWN CONFIG
  // ========================
  marked.setOptions({
    breaks: true,
    gfm: true
  });

  // ========================
  // PARAMS
  // ========================
  const params = new URLSearchParams(window.location.search);
  const file = params.get("file");

  const fortress = [
    "aws.md",
    "faraday.md",
    "synacktiv.md",
    "context.md",
    "akerva.md",
    "jet.md"
  ];

  if (content && file) {
    if (fortress.includes(file)) {
      initFortress();
    } else {
      loadMarkdown(file);
    }
  }

  // ========================
  // Fortress popup
  // ========================
  document.querySelectorAll(".fortress-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();

      document.getElementById("fortress-popup")?.classList.remove("hidden");
      document.getElementById("terminal").innerText = "";
      document.getElementById("flagInput").value = "";
    });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closePopup();
  });

});


// ========================
// LOAD MARKDOWN
// ========================
function loadMarkdown(file) {
  const content = document.getElementById("content");
  if (!content) return;

  const page = window.location.pathname.split("/").pop();
  const folder = page === "apuntes.html" ? "Apuntes" : "Writeups";

  fetch(`${folder}/${file}`)
    .then(res => {
      if (!res.ok) throw new Error("No se encontró el archivo");
      return res.text();
    })
    .then(md => {
      md = md.replaceAll("](imagenes/", `](${folder}/imagenes/`);
      md = md.replaceAll("](Imágenes/", `](${folder}/Imágenes/`);

      content.innerHTML = marked.parse(md);
    })
    .catch(err => {
      content.innerHTML = "<p style='color:red;'>Error cargando archivo</p>";
      console.error(err);
    });
}


// ========================
// FORTRESS
// ========================
function initFortress() {
  const content = document.getElementById("content");
  if (content) content.style.display = "none";

  const authBox = document.getElementById("auth-box");
  if (authBox) authBox.classList.remove("hidden");
}

function checkAccess() {
  const term = document.getElementById("terminal");
  const input = document.getElementById("flagInput").value;

  term.innerText = "[*] Initializing secure access...\n";

  setTimeout(() => {
    term.innerText += "[*] Checking flag format...\n";
  }, 600);

  setTimeout(() => {
    if (input.startsWith("HTB{")) {
      term.innerText += "[*] Flag structure valid...\n";
    } else {
      term.innerText += "[!] Invalid flag format...\n";
    }
  }, 1200);

  setTimeout(() => {
    term.innerText += "[-] Access denied.\n";
  }, 1800);

  setTimeout(() => {
    term.innerText += "\n[🔒 Fortress Writeup – Restricted]\nAccess: Private";
  }, 2300);
}

function closePopup() {
  document.getElementById("fortress-popup")?.classList.add("hidden");
}