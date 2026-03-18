const terminal = document.getElementById("terminal");

const lines = [
  "patxasec@redteam:~$ whoami",
  "Offensive Security Engineer",
  "",
  "patxasec@redteam:~$ skills --top",
  "Active Directory | Red Team Ops | Post-Exploitation",
  "",
  "patxasec@redteam:~$ status",
  "Currently breaking corporate networks (legally)."
];

let i = 0;

function typeLine() {
  if (i < lines.length) {
    const p = document.createElement("p");
    terminal.appendChild(p);

    let j = 0;
    const text = lines[i];

    const interval = setInterval(() => {
      p.textContent += text[j];
      j++;
      if (j >= text.length) {
        clearInterval(interval);
        i++;
        setTimeout(typeLine, 300);
      }
    }, 30);
  }
}

typeLine();