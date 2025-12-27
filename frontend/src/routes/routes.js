// src/routes/routes.js

import { Home } from "../pages/Home.js";
import { Profile } from "../pages/Profile.js";
import { Settings } from "../pages/Settings.js";

import { Friends } from "../pages/Friends/Friends.js";
import { Chat } from "../pages/chat/chat.js";

import { Games } from "../pages/games/Games.js";
import { Market } from "../pages/market/Market.js";
import { Servers } from "../pages/servers/Servers.js";
import { Admin } from "../pages/admin/Admin.js";

/* BOŞ SAYFA FABRİKASI */
function EmptyPage(title) {
  return function (root) {
    root.innerHTML = `
      <h1>${title}</h1>
      <p>Yakında</p>
    `;
  };
}

export const routes = {
  home: {
    page: Home,
    title: "Ana Sayfa"
  },
  profile: {
    page: Profile,
    title: "Profil"
  },
  friends: {
    page: Friends,
    title: "Arkadaşlar"
  },
  chat: {
    page: Chat,
    title: "Chat"
  },
  servers: {
    page: Servers ?? EmptyPage("Sunucular"),
    title: "Sunucular"
  },
  games: {
    page: Games ?? EmptyPage("Oyunlar"),
    title: "Oyunlar"
  },
  market: {
    page: Market ?? EmptyPage("Market"),
    title: "Market"
  },
  admin: {
    page: Admin ?? EmptyPage("Admin"),
    title: "Admin"
  },
  settings: {
    page: Settings,
    title: "Ayarlar"
  }
};
