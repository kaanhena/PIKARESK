// SADECE VERİ TUTAR

export function initStorage() {
  if (!localStorage.getItem("pikaresk_users")) {
    localStorage.setItem("pikaresk_users", JSON.stringify([
      { id: "u1", name: "Kaan", status: "online" },
      { id: "u2", name: "Ahmet", status: "offline" }
    ]));
  }

  if (!localStorage.getItem("pikaresk_current_user")) {
    localStorage.setItem("pikaresk_current_user", "u1");
  }

  if (!localStorage.getItem("pikaresk_chats")) {
    localStorage.setItem("pikaresk_chats", JSON.stringify({}));
  }
}
