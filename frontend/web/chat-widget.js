document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("chat-container");

  container.innerHTML = `
    <div id="chat-box"></div>
    <input id="chat-input" placeholder="Ask the Infernal Oracle...">
  `;

  const chatBox = document.getElementById("chat-box");
  const input = document.getElementById("chat-input");

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const msg = input.value;
      input.value = "";

      chatBox.innerHTML += `<div><b>You:</b> ${msg}</div>`;

      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });

      const data = await res.json();
      chatBox.innerHTML += `<div><b>LoX Oracle:</b> ${data.reply}</div>`;
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  });
});
