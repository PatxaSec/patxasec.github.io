// scroll suave
document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", e => {
    if (link.hash) {
      e.preventDefault();
      document.querySelector(link.hash).scrollIntoView({
        behavior: "smooth"
      });
    }
  });
});

// certs desplegables (solo uno abierto)
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