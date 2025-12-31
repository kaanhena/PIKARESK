import "./Servers.css";
import { Room, RoomEvent, createLocalAudioTrack } from "livekit-client";
import { watchAuth } from "../../services/authService.js";
import { http } from "../../services/http.js";
import {
  createInvite,
  createServerForUser,
  joinServerByInvite,
  listenServerMembers,
  listenServerMessages,
  listenUserServers,
  loadVoiceSettings,
  saveVoiceSettings,
  sendServerMessage,
} from "../../services/serverService.js";

export function Servers(root) {
  root.innerHTML = `
    <div class="servers-module">
      <header class="servers-header">
        <div class="server-tabs" id="serverTabs"></div>
        <div class="server-actions">
          <button class="server-action-btn" id="addServerBtn" type="button">Sunucu Ekle</button>
        </div>
      </header>

      <div class="servers-content">
        <aside class="voice-panel">
          <div class="panel-header">
            <h2 class="panel-title" id="serverTitle">Sunucu sec</h2>
            <p class="panel-subtitle" id="serverSubtitle">0 kisi cevrimici</p>
          </div>
          <div class="voice-list" id="voiceList">
            <div class="voice-empty">Sesli odada kimse yok.</div>
          </div>
          <div class="voice-audio" id="voiceAudio"></div>
          <div class="voice-controls">
            <button class="control-btn mic-btn" id="micBtn" type="button">
              <span class="icon">MIC</span>
              <span>Mikrofon</span>
            </button>
            <button class="control-btn join-btn" id="joinBtn" type="button">
              <span class="icon">CALL</span>
              <span>Sesli Odaya Katil</span>
            </button>
            <button class="control-btn" id="settingsBtn" type="button">
              <span class="icon">SET</span>
              <span>Ses Ayarlari</span>
            </button>
            <div class="voice-settings" id="voiceSettings">
              <div class="setting-item">
                <div class="setting-label">
                  <span>Ses Seviyesi</span>
                  <span class="setting-value" id="volumeValue">70%</span>
                </div>
                <input type="range" min="0" max="100" value="70" class="slider" id="volumeSlider">
              </div>
              <div class="setting-item">
                <div class="setting-label">
                  <span>Mikrofon Hassasiyeti</span>
                  <span class="setting-value" id="sensitivityValue">50%</span>
                </div>
                <input type="range" min="0" max="100" value="50" class="slider" id="sensitivitySlider">
              </div>
              <div class="setting-item">
                <div class="setting-label">
                  <span>Gurultu Engelleme</span>
                  <button class="toggle-switch" id="noiseToggle" type="button"></button>
                </div>
              </div>
              <div class="setting-item">
                <div class="setting-label">
                  <span>Yanki Onleme</span>
                  <button class="toggle-switch" id="echoToggle" type="button"></button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main class="chat-panel">
          <div class="chat-header">
            <h3 class="chat-title" id="chatTitle">Genel Sohbet</h3>
            <div class="chat-actions">
              <button class="chat-action-btn" id="inviteBtn" type="button">Davet Et</button>
            </div>
          </div>
          <div class="chat-messages" id="messages">
            <div class="chat-empty" id="chatEmpty">Henuz mesaj yok.</div>
          </div>
          <div class="chat-input-area">
            <div class="input-wrapper">
              <input type="text" class="chat-input" placeholder="Mesaj yaz..." id="input">
              <button class="send-btn" id="sendBtn" type="button">&#8594;</button>
            </div>
          </div>
        </main>
      </div>
    </div>

    <div class="servers-modal" id="addServerModal" aria-hidden="true">
      <div class="servers-modal-backdrop" data-close="add"></div>
      <div class="servers-modal-card">
        <h3>Sunucu Ekle</h3>
        <p>Yeni bir sunucu adi belirle.</p>
        <div class="servers-modal-section">
          <input class="servers-input" id="serverNameInput" placeholder="Ornek: My Server" type="text">
          <button class="primary-btn" id="createServerBtn" type="button">Olustur</button>
          <div class="servers-hint" id="serverLimitHint"></div>
        </div>
        <div class="servers-divider"></div>
        <div class="servers-modal-section">
          <p>Davet kodu ile bir sunucuya katil.</p>
          <input class="servers-input" id="inviteCodeInput" placeholder="Davet kodu" type="text">
          <button class="primary-btn" id="joinServerBtn" type="button">Katil</button>
        </div>
        <div class="servers-modal-actions">
          <button class="ghost-btn" data-close="add" type="button">Kapat</button>
        </div>
      </div>
    </div>

    <div class="servers-modal" id="inviteModal" aria-hidden="true">
      <div class="servers-modal-backdrop" data-close="invite"></div>
      <div class="servers-modal-card">
        <h3>Davet Et</h3>
        <p id="inviteDesc">Davet linkini paylas.</p>
        <input class="servers-input" id="inviteEmailInput" placeholder="E-posta (opsiyonel)" type="email">
        <div class="invite-code">
          <span id="inviteCode">---</span>
          <button class="ghost-btn" id="copyInviteBtn" type="button">Kopyala</button>
        </div>
        <div class="servers-modal-actions">
          <button class="ghost-btn" data-close="invite" type="button">Kapat</button>
          <button class="primary-btn" id="sendInviteBtn" type="button">Davet Gonder</button>
        </div>
      </div>
    </div>
  `;

  const serverTabs = root.querySelector("#serverTabs");
  const addServerBtn = root.querySelector("#addServerBtn");
  const inviteBtn = root.querySelector("#inviteBtn");
  const serverTitle = root.querySelector("#serverTitle");
  const serverSubtitle = root.querySelector("#serverSubtitle");
  const chatTitle = root.querySelector("#chatTitle");
  const chatEmpty = root.querySelector("#chatEmpty");
  const messages = root.querySelector("#messages");
  const voiceList = root.querySelector("#voiceList");
  const voiceAudio = root.querySelector("#voiceAudio");

  const addServerModal = root.querySelector("#addServerModal");
  const inviteModal = root.querySelector("#inviteModal");
  const serverNameInput = root.querySelector("#serverNameInput");
  const createServerBtn = root.querySelector("#createServerBtn");
  const inviteCodeInput = root.querySelector("#inviteCodeInput");
  const joinServerBtn = root.querySelector("#joinServerBtn");
  const serverLimitHint = root.querySelector("#serverLimitHint");
  const inviteEmailInput = root.querySelector("#inviteEmailInput");
  const inviteCode = root.querySelector("#inviteCode");
  const inviteDesc = root.querySelector("#inviteDesc");
  const copyInviteBtn = root.querySelector("#copyInviteBtn");
  const sendInviteBtn = root.querySelector("#sendInviteBtn");

  const micBtn = root.querySelector("#micBtn");
  const joinBtn = root.querySelector("#joinBtn");
  const settingsBtn = root.querySelector("#settingsBtn");
  const voiceSettings = root.querySelector("#voiceSettings");
  const volumeSlider = root.querySelector("#volumeSlider");
  const volumeValue = root.querySelector("#volumeValue");
  const sensitivitySlider = root.querySelector("#sensitivitySlider");
  const sensitivityValue = root.querySelector("#sensitivityValue");
  const noiseToggle = root.querySelector("#noiseToggle");
  const echoToggle = root.querySelector("#echoToggle");

  const input = root.querySelector("#input");
  const sendBtn = root.querySelector("#sendBtn");

  let currentUser = null;
  let servers = [];
  let activeServerId = "";
  let stopServers = null;
  let stopMembers = null;
  let stopMessages = null;
  let voiceConfig = { volume: 70, sensitivity: 50, noise: false, echo: false };
  let livekitRoom = null;
  let localAudioTrack = null;
  let isConnecting = false;
  let micEnabled = true;

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification show";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove("show"), 1600);
    setTimeout(() => toast.remove(), 2000);
  }

  function openModal(modal) {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(modal) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function applyVoiceSettings(settings) {
    volumeSlider.value = String(settings.volume);
    volumeValue.textContent = `${settings.volume}%`;
    sensitivitySlider.value = String(settings.sensitivity);
    sensitivityValue.textContent = `${settings.sensitivity}%`;
    noiseToggle.classList.toggle("active", settings.noise);
    echoToggle.classList.toggle("active", settings.echo);
  }

  function renderTabs() {
    serverTabs.innerHTML = "";
    if (!servers.length) {
      serverTabs.innerHTML = `<div class="server-tabs-empty">Sunucu yok</div>`;
      serverTitle.textContent = "Sunucu sec";
      serverSubtitle.textContent = "0 kisi cevrimici";
      chatTitle.textContent = "Genel Sohbet";
      inviteBtn.disabled = true;
      joinBtn.disabled = true;
      input.disabled = true;
      sendBtn.disabled = true;
      return;
    }
    inviteBtn.disabled = false;
    joinBtn.disabled = false;
    input.disabled = false;
    sendBtn.disabled = false;
    servers.forEach((server) => {
      const btn = document.createElement("button");
      btn.className = `server-tab${server.id === activeServerId ? " active" : ""}`;
      btn.type = "button";
      btn.textContent = server.name;
      btn.addEventListener("click", () => {
        setActiveServer(server.id);
      });
      serverTabs.appendChild(btn);
    });
    updateServerMeta();
  }

  function updateServerMeta() {
    const server = servers.find((item) => item.id === activeServerId);
    if (!server) return;
    serverTitle.textContent = server.name;
    chatTitle.textContent = `${server.name} Sohbet`;
    inviteDesc.textContent = `${server.name} sunucusuna davet linki olustur.`;
  }

  function renderVoiceMembers(members) {
    if (livekitRoom) return;
    if (!members.length) {
      voiceList.innerHTML = `<div class="voice-empty">Sesli odada kimse yok.</div>`;
      serverSubtitle.textContent = "0 kisi cevrimici";
      return;
    }
    serverSubtitle.textContent = `${members.length} kisi cevrimici`;
    voiceList.innerHTML = members
      .map((member) => {
        const name = member.userName || "Kullanici";
        const initial = name[0]?.toUpperCase() || "K";
        return `
          <div class="voice-user">
            <div class="voice-avatar">${initial}</div>
            <div>
              <div class="voice-name">${name}</div>
              <div class="voice-status">Dinliyor</div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderVoiceParticipants(participants) {
    if (!participants.length) {
      renderVoiceMembers([]);
      return;
    }
    serverSubtitle.textContent = `${participants.length} kisi cevrimici`;
    voiceList.innerHTML = participants
      .map((participant) => {
        const name = participant.name || participant.identity || "Kullanici";
        const initial = name[0]?.toUpperCase() || "K";
        return `
          <div class="voice-user">
            <div class="voice-avatar">${initial}</div>
            <div>
              <div class="voice-name">${name}</div>
              <div class="voice-status">Dinliyor</div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderMessages(items) {
    if (!items.length) {
      messages.innerHTML = `<div class="chat-empty" id="chatEmpty">Henuz mesaj yok.</div>`;
      return;
    }
    messages.innerHTML = items
      .map((message) => {
        const name = message.userName || "Kullanici";
        const initial = name[0]?.toUpperCase() || "K";
        const time =
          message.createdAt?.toDate?.().toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }) || "";
        return `
          <div class="message">
            <div class="msg-avatar">${initial}</div>
            <div class="msg-content">
              <div class="msg-header">
                <span class="msg-author">${name}</span>
                <span class="msg-time">${time}</span>
              </div>
              <div class="msg-text">${message.text || ""}</div>
            </div>
          </div>
        `;
      })
      .join("");
    messages.scrollTop = messages.scrollHeight;
  }

  function clearChat() {
    messages.innerHTML = `<div class="chat-empty" id="chatEmpty">Henuz mesaj yok.</div>`;
  }

  function stopActiveListeners() {
    if (stopMembers) stopMembers();
    if (stopMessages) stopMessages();
    stopMembers = null;
    stopMessages = null;
  }

  function updateJoinButton(connected) {
    joinBtn.classList.toggle("active", connected);
    const icon = joinBtn.querySelector(".icon");
    const text = joinBtn.querySelector("span:last-child");
    icon.textContent = connected ? "CALL" : "EXIT";
    text.textContent = connected ? "Sesli Odadan Ayril" : "Sesli Odaya Katil";
  }

  function updateMicButton(enabled) {
    micBtn.classList.toggle("active", enabled);
    const icon = micBtn.querySelector(".icon");
    const text = micBtn.querySelector("span:last-child");
    icon.textContent = enabled ? "ON" : "MIC";
    text.textContent = enabled ? "Mikrofon Acik" : "Mikrofon";
  }

  function attachTrack(track) {
    const element = track.attach();
    element.dataset.trackSid = track.sid;
    voiceAudio.appendChild(element);
  }

  function detachTrack(track) {
    track.detach().forEach((el) => el.remove());
  }

  function collectParticipants(room) {
    const participants = [];
    if (room?.localParticipant) {
      participants.push(room.localParticipant);
    }
    room?.participants?.forEach((participant) => participants.push(participant));
    return participants;
  }

  function refreshVoiceParticipants() {
    if (!livekitRoom) return;
    renderVoiceParticipants(collectParticipants(livekitRoom));
  }

  function cleanupLivekit() {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack = null;
    }
    if (livekitRoom) {
      livekitRoom.disconnect();
      livekitRoom = null;
    }
    voiceAudio.innerHTML = "";
    renderVoiceMembers([]);
    updateJoinButton(false);
  }

  async function connectLivekit() {
    if (!currentUser || !activeServerId || livekitRoom || isConnecting) return;
    isConnecting = true;
    try {
      const tokenUrl =
        import.meta.env.VITE_LIVEKIT_TOKEN_URL ||
        "https://us-central1-pikaresk-7f80b.cloudfunctions.net/livekitToken";
      const response = await http(tokenUrl, {
        method: "POST",
        body: {
          room: activeServerId,
          identity: currentUser.uid,
          name: currentUser.displayName || currentUser.email || "Kullanici",
        },
      });
      const room = new Room({ adaptiveStream: true, dynacast: true });
      livekitRoom = room;

      room.on(RoomEvent.ParticipantConnected, refreshVoiceParticipants);
      room.on(RoomEvent.ParticipantDisconnected, refreshVoiceParticipants);
      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        console.log("LiveKit state:", state);
      });
      room.on(RoomEvent.Disconnected, (reason) => {
        console.warn("LiveKit disconnected:", reason);
        if (reason === "duplicate_identity") {
          showToast("Bu hesap baska bir cihazda baglandi.");
        } else {
          showToast("Sesli baglanti koptu.");
        }
        cleanupLivekit();
      });
      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === "audio") {
          attachTrack(track);
        }
      });
      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === "audio") {
          detachTrack(track);
        }
      });

      await room.connect(response.url, response.token);
      localAudioTrack = await createLocalAudioTrack();
      await room.localParticipant.publishTrack(localAudioTrack);
      localAudioTrack.setEnabled(micEnabled);
      updateJoinButton(true);
      updateMicButton(micEnabled);
      refreshVoiceParticipants();
    } catch (error) {
      console.warn("LiveKit connect error:", error);
      showToast(error?.message || "Sesli sohbet baslatilamadi.");
      cleanupLivekit();
    } finally {
      isConnecting = false;
    }
  }

  function setActiveServer(serverId) {
    if (activeServerId === serverId) return;
    activeServerId = serverId;
    if (livekitRoom) {
      cleanupLivekit();
    }
    updateServerMeta();
    renderTabs();
    clearChat();
    stopActiveListeners();
    if (!activeServerId) return;
    stopMembers = listenServerMembers(
      activeServerId,
      (items) => {
        renderVoiceMembers(items);
      },
      () => {
        renderVoiceMembers([]);
      }
    );
    stopMessages = listenServerMessages(
      activeServerId,
      (items) => {
        renderMessages(items);
      },
      () => {
        clearChat();
      }
    );
  }

  function updateServerLimitHint() {
    if (!currentUser) {
      serverLimitHint.textContent = "Sunucu olusturmak icin giris yap.";
      return;
    }
    const ownsServer = servers.some((server) => server.ownerId === currentUser.uid);
    if (ownsServer) {
      serverLimitHint.textContent = "Her kullanici su an sadece 1 sunucu olusturabilir.";
    } else {
      serverLimitHint.textContent = "";
    }
  }

  addServerBtn.addEventListener("click", () => {
    serverNameInput.value = "";
    inviteCodeInput.value = "";
    updateServerLimitHint();
    openModal(addServerModal);
    serverNameInput.focus();
  });

  createServerBtn.addEventListener("click", async () => {
    if (!currentUser) {
      showToast("Giris yapmalisin.");
      return;
    }
    const name = serverNameInput.value.trim();
    if (!name) return;
    try {
      await createServerForUser({
        uid: currentUser.uid,
        name,
        userName: currentUser.displayName || currentUser.email,
      });
      serverNameInput.value = "";
      closeModal(addServerModal);
    } catch (error) {
      showToast(error?.message || "Sunucu olusturulamadi.");
    }
  });

  joinServerBtn.addEventListener("click", async () => {
    if (!currentUser) {
      showToast("Giris yapmalisin.");
      return;
    }
    const code = inviteCodeInput.value.trim().toUpperCase();
    if (!code) return;
    try {
      const serverId = await joinServerByInvite({
        code,
        uid: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
      });
      inviteCodeInput.value = "";
      closeModal(addServerModal);
      setActiveServer(serverId);
    } catch (error) {
      showToast(error?.message || "Davet kodu gecersiz.");
    }
  });

  inviteBtn.addEventListener("click", async () => {
    if (!activeServerId || !currentUser) return;
    inviteEmailInput.value = "";
    inviteCode.textContent = "---";
    try {
      const code = await createInvite({
        serverId: activeServerId,
        createdBy: currentUser.uid,
      });
      inviteCode.textContent = code;
      openModal(inviteModal);
    } catch (error) {
      showToast(error?.message || "Davet kodu olusturulamadi.");
    }
  });

  copyInviteBtn.addEventListener("click", () => {
    const text = inviteCode.textContent.trim();
    if (!text || text === "---") return;
    navigator.clipboard?.writeText(text).catch(() => {});
  });

  sendInviteBtn.addEventListener("click", () => {
    const email = inviteEmailInput.value.trim();
    if (email) {
      inviteEmailInput.value = "";
    }
    closeModal(inviteModal);
  });

  root.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-close");
      if (target === "add") closeModal(addServerModal);
      if (target === "invite") closeModal(inviteModal);
    });
  });

  settingsBtn.addEventListener("click", () => {
    voiceSettings.classList.toggle("open");
  });

  micBtn.addEventListener("click", () => {
    micEnabled = !micEnabled;
    updateMicButton(micEnabled);
    if (localAudioTrack) {
      localAudioTrack.setEnabled(micEnabled);
    }
  });

  joinBtn.addEventListener("click", async () => {
    if (livekitRoom) {
      cleanupLivekit();
      return;
    }
    await connectLivekit();
  });

  volumeSlider.addEventListener("input", async (event) => {
    voiceConfig.volume = Number(event.target.value);
    volumeValue.textContent = `${voiceConfig.volume}%`;
    if (currentUser) {
      await saveVoiceSettings(currentUser.uid, voiceConfig);
    }
  });

  sensitivitySlider.addEventListener("input", async (event) => {
    voiceConfig.sensitivity = Number(event.target.value);
    sensitivityValue.textContent = `${voiceConfig.sensitivity}%`;
    if (currentUser) {
      await saveVoiceSettings(currentUser.uid, voiceConfig);
    }
  });

  noiseToggle.addEventListener("click", async () => {
    voiceConfig.noise = !voiceConfig.noise;
    noiseToggle.classList.toggle("active", voiceConfig.noise);
    if (currentUser) {
      await saveVoiceSettings(currentUser.uid, voiceConfig);
    }
  });

  echoToggle.addEventListener("click", async () => {
    voiceConfig.echo = !voiceConfig.echo;
    echoToggle.classList.toggle("active", voiceConfig.echo);
    if (currentUser) {
      await saveVoiceSettings(currentUser.uid, voiceConfig);
    }
  });

  async function sendMessage() {
    if (!activeServerId || !currentUser) return;
    const text = input.value.trim();
    if (!text) return;
    await sendServerMessage({
      serverId: activeServerId,
      uid: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      text,
    });
    input.value = "";
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendMessage();
  });

  watchAuth((user) => {
    currentUser = user;
    if (stopServers) stopServers();
    stopServers = null;
    stopActiveListeners();
    cleanupLivekit();
    servers = [];
    activeServerId = "";
    renderTabs();
    renderVoiceMembers([]);
    clearChat();
    if (!user) return;

    loadVoiceSettings(user.uid)
      .then((settings) => {
        if (settings) {
          voiceConfig = {
            volume: settings.volume ?? 70,
            sensitivity: settings.sensitivity ?? 50,
            noise: !!settings.noise,
            echo: !!settings.echo,
          };
          applyVoiceSettings(voiceConfig);
        }
      })
      .catch(() => {});

    stopServers = listenUserServers(
      user.uid,
      (items) => {
        servers = items;
        if (!servers.length) {
          activeServerId = "";
          renderTabs();
          renderVoiceMembers([]);
          clearChat();
          return;
        }
        if (!activeServerId || !servers.some((server) => server.id === activeServerId)) {
          activeServerId = servers[0].id;
        }
        renderTabs();
        setActiveServer(activeServerId);
        updateServerLimitHint();
      },
      () => {
        servers = [];
        activeServerId = "";
        renderTabs();
        renderVoiceMembers([]);
        clearChat();
      }
    );
  });
}
