document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", e => {
    if (link.hash && link.href.includes(window.location.pathname)) {
      e.preventDefault();
      const target = document.querySelector(link.hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
});

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

document.querySelectorAll(".nav-main").forEach(btn => {
  btn.addEventListener("click", function () {
    const sub = this.nextElementSibling;

    document.querySelectorAll(".nav-sub").forEach(menu => {
      if (menu !== sub) {
        menu.style.display = "none";
      }
    });

    sub.style.display = sub.style.display === "flex" ? "none" : "flex";
  });
});

marked.setOptions({
  breaks: true,
  gfm: true
});

const params = new URLSearchParams(window.location.search);
const file = params.get("file");
const content = document.getElementById("content");

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
    loadWriteup(file);
  }
}

function loadWriteup(file) {
  fetch(`Writeups/${file}`)
    .then(res => {
      if (!res.ok) throw new Error("No se encontró el archivo");
      return res.text();
    })
    .then(md => {
      const base = window.location.origin + "/Writeups/";
      md = md.replaceAll("](Imágenes/", `](${base}Imágenes/`);
      md = md.replaceAll("](imagenes/", `](${base}imagenes/`);
      content.innerHTML = marked.parse(md);
    })
    .catch(err => {
      content.innerHTML = "<p style='color:red;'>Error cargando writeup</p>";
      console.error(err);
    });
}

function initFortress() {
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

document.querySelectorAll(".fortress-link").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    document.getElementById("fortress-popup").classList.remove("hidden");

    document.getElementById("terminal").innerText = "";
    document.getElementById("flagInput").value = "";
  });
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closePopup();
  }
});

function closePopup() {
  document.getElementById("fortress-popup").classList.add("hidden");
}