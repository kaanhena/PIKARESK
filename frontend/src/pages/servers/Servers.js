import "./Servers.css";
import { io } from "socket.io-client";

const FRIENDS_KEY = "pikaresk_friends";
const ACTIVE_DM_KEY = "pikaresk_active_dm";
const ACTIVE_DM_NAME_KEY = "pikaresk_active_dm_name";
const SERVER_MESSAGES_KEY = "pikaresk_server_messages";

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || "http://localhost:3001";
const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" }
];

const DEFAULT_SERVERS = [
  {
    id: "pika-hub",
    name: "Pika Hub",
    icon: "?",
    description: "Genel sohbet ve duyurular",
    channels: [
      { id: "genel", name: "genel", type: "text" },
      { id: "duyurular", name: "duyurular", type: "text" },
      { id: "yardim", name: "yardim", type: "text" },
      { id: "lobby", name: "lobby", type: "voice" },
      { id: "co-op", name: "co-op", type: "voice" }
    ],
    members: ["ayse", "mehmet", "selin"]
  },
  {
    id: "arena",
    name: "Arena",
    icon: "??",
    description: "Turnuvalar ve etkinlikler",
    channels: [
      { id: "etkinlik", name: "etkinlik", type: "text" },
      { id: "duyuru", name: "duyuru", type: "text" },
      { id: "matchmaking", name: "matchmaking", type: "voice" }
    ],
    members: ["mehmet", "selin"]
  },
  {
    id: "market",
    name: "Market",
    icon: "??",
    description: "Takas ve ilanlar",
    channels: [
      { id: "ilanlar", name: "ilanlar", type: "text" },
      { id: "takas", name: "takas", type: "text" },
      { id: "sesli", name: "sesli", type: "voice" }
    ],
    members: ["ayse"]
  }
];

const statusText = {
  online: "Cevrimici",
  pending: "Bekliyor",
  blocked: "Engellenmis"
};

function loadFriends() {
  try {
    const data = JSON.parse(localStorage.getItem(FRIENDS_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function getLocalUserId() {
  return localStorage.getItem("pikaresk_current_user") || "local-user";
}

export function Servers(root) {
  const state = {
    servers: DEFAULT_SERVERS,
    friends: loadFriends(),
    activeServerId: DEFAULT_SERVERS[0]?.id,
    membersOpen: false
  };

  const voiceState = {
    socket: null,
    localStream: null,
    peers: new Map(),
    members: new Map(),
    joinedServerId: null,
    muted: false,
    userId: getLocalUserId()
  };

  root.innerHTML = `
    <div class="servers-shell">
      <aside class="servers-list">
        <div class="servers-list-header">
          <span>Sunucular</span>
          <button class="servers-add" title="Sunucu ekle">+</button>
        </div>
        <div class="servers-items" id="serversList"></div>
      </aside>

      <section class="server-main">
        <header class="server-header">
          <div class="server-title">
            <div class="server-title-icon" id="serverIcon"></div>
            <div>
              <h2 id="serverName"></h2>
              <p id="serverDesc"></p>
            </div>
          </div>
          <div class="server-actions">
            <button class="ghost">Davetiye</button>
            <button class="ghost">Ayarlar</button>
            <button class="ghost" id="toggleMembers" title="Uyeler">??</button>
          </div>
        </header>

        <div class="server-body">
          <main class="channel-content">
            <div class="chat-panel server-chat">
              <div class="chat-header">
                <div class="chat-user-info">
                  <div class="chat-avatar" id="serverChatIcon"></div>
                  <div>
                    <strong id="serverChatName"></strong>
                    <div class="server-chat-sub" id="serverChatSub"></div>
                  </div>
                </div>
              </div>

              <div class="messages-area" id="messagesArea"></div>

              <div class="message-input-area">
                <div class="input-container">
                  <textarea class="msg-input" id="serverMessageInput" placeholder="Sunucuda mesaj yaz..."></textarea>
                  <button class="send-btn" id="sendServerMessage">?</button>
                </div>
              </div>

              <div class="voice-panel">
                <div class="voice-header">
                  <div>
                    <div class="voice-title">Sesli Oda</div>
                    <div class="voice-subtitle">Sunucu icinde canli sohbet</div>
                  </div>
                  <div class="voice-status" id="voiceStatus">Baglanti yok</div>
                </div>
                <div class="voice-controls">
                  <button class="voice-btn" id="voiceJoinBtn" type="button">Katil</button>
                  <button class="voice-btn secondary" id="voiceLeaveBtn" type="button" disabled>Ayril</button>
                  <button class="voice-btn ghost" id="voiceMuteBtn" type="button" disabled>Mikrofon: Acik</button>
                </div>
                <div class="voice-members" id="voiceMembers"></div>
                <div class="voice-audio" id="voiceAudio"></div>
              </div>
            </div>
          </main>

          <aside class="members-panel" id="membersPanel">
            <div class="members-header">
              <div class="panel-title">Uyeler</div>
              <button class="ghost" id="closeMembers">Kapat</button>
            </div>
            <div class="member-list" id="memberList"></div>
          </aside>
        </div>
      </section>
    </div>
  `;

  const serversList = root.querySelector("#serversList");
  const memberList = root.querySelector("#memberList");
  const serverIcon = root.querySelector("#serverIcon");
  const serverName = root.querySelector("#serverName");
  const serverDesc = root.querySelector("#serverDesc");
  const serverChatIcon = root.querySelector("#serverChatIcon");
  const serverChatName = root.querySelector("#serverChatName");
  const serverChatSub = root.querySelector("#serverChatSub");
  const messagesArea = root.querySelector("#messagesArea");
  const messageInput = root.querySelector("#serverMessageInput");
  const sendMessageBtn = root.querySelector("#sendServerMessage");
  const membersPanel = root.querySelector("#membersPanel");
  const toggleMembers = root.querySelector("#toggleMembers");
  const closeMembers = root.querySelector("#closeMembers");
  const voiceJoinBtn = root.querySelector("#voiceJoinBtn");
  const voiceLeaveBtn = root.querySelector("#voiceLeaveBtn");
  const voiceMuteBtn = root.querySelector("#voiceMuteBtn");
  const voiceMembers = root.querySelector("#voiceMembers");
  const voiceStatus = root.querySelector("#voiceStatus");
  const voiceAudio = root.querySelector("#voiceAudio");

  function getActiveServer() {
    return state.servers.find((s) => s.id === state.activeServerId);
  }

  function loadServerMessages() {
    try {
      const data = JSON.parse(localStorage.getItem(SERVER_MESSAGES_KEY) || "{}");
      return data && typeof data === "object" ? data : {};
    } catch {
      return {};
    }
  }

  function saveServerMessages(messagesByServer) {
    localStorage.setItem(SERVER_MESSAGES_KEY, JSON.stringify(messagesByServer));
  }

  function renderServers() {
    serversList.innerHTML = state.servers
      .map(
        (s) => `
      <button class="server-pill ${s.id === state.activeServerId ? "active" : ""}" data-server-id="${s.id}">
        <span class="server-icon">${s.icon}</span>
        <span class="server-name">${s.name}</span>
        <span class="server-count">${s.members.length}</span>
      </button>
    `
      )
      .join("");
  }

  function renderHeader() {
    const server = getActiveServer();
    if (!server) return;
    serverIcon.textContent = server.icon;
    serverName.textContent = server.name;
    serverDesc.textContent = server.description;
  }

  function renderChannelContent() {
    const server = getActiveServer();
    if (!server) return;
    serverChatIcon.textContent = server.icon;
    serverChatName.textContent = server.name;
    serverChatSub.textContent = "Ortak sohbet";
    const messages = server.messages || [];
    if (messages.length === 0) {
      messagesArea.innerHTML = "";
      return;
    }
    messagesArea.innerHTML = messages
      .map(
        (msg) => `
      <div class="message-wrapper ${msg.author === "Sen" ? "own" : ""}">
        <div class="msg-avatar">${msg.author === "Sen" ? "ME" : msg.author.slice(0, 1).toUpperCase()}</div>
        <div class="msg-bubble">${msg.text}</div>
      </div>
    `
      )
      .join("");
  }

  function renderMembers() {
    const server = getActiveServer();
    if (!server) return;
    const friendMap = new Map(state.friends.map((f) => [f.id, f]));
    const members = server.members
      .map((id) => friendMap.get(id) || { id, name: id, status: "online" })
      .sort((a, b) => (a.status === "online" ? -1 : 1));

    memberList.innerHTML = members
      .map(
        (m) => `
      <div class="member-item" data-member-id="${m.id}">
        <div class="member-avatar">${m.name.slice(0, 1).toUpperCase()}</div>
        <div class="member-info">
          <div class="member-name">${m.name}</div>
          <div class="member-status ${m.status}">${statusText[m.status] || m.status}</div>
        </div>
        <button class="member-dm" data-action="dm" title="DM">??</button>
      </div>
    `
      )
      .join("");
  }

  function renderAll() {
    renderServers();
    renderHeader();
    renderChannelContent();
    renderMembers();
  }

  function setVoiceStatus(text) {
    if (voiceStatus) {
      voiceStatus.textContent = text;
    }
  }

  function setVoiceControls(joined) {
    voiceJoinBtn.disabled = joined;
    voiceLeaveBtn.disabled = !joined;
    voiceMuteBtn.disabled = !joined;
  }

  function renderVoiceMembers() {
    const entries = Array.from(voiceState.members.entries());
    if (entries.length === 0) {
      voiceMembers.innerHTML = `<div class="voice-empty">Henuz kimse yok.</div>`;
      return;
    }
    voiceMembers.innerHTML = entries
      .map(([id, data]) => {
        const label = id === "local" ? "Sen" : data.userId || "Misafir";
        return `
          <div class="voice-member ${id === "local" ? "local" : ""}">
            <span class="voice-member-dot"></span>
            <span class="voice-member-name">${label}</span>
          </div>
        `;
      })
      .join("");
  }

  function initSocket() {
    if (voiceState.socket) return;
    voiceState.socket = io(SIGNALING_URL, { transports: ["websocket"] });

    voiceState.socket.on("voice-users", (users) => {
      users.forEach((user) => {
        voiceState.members.set(user.id, { userId: user.userId });
        createPeerConnection(user.id, false);
      });
      renderVoiceMembers();
      setVoiceStatus("Baglandi");
    });

    voiceState.socket.on("voice-user-joined", (user) => {
      voiceState.members.set(user.id, { userId: user.userId });
      createPeerConnection(user.id, true);
      renderVoiceMembers();
    });

    voiceState.socket.on("voice-user-left", (id) => {
      cleanupPeer(id);
      voiceState.members.delete(id);
      renderVoiceMembers();
    });

    voiceState.socket.on("voice-signal", async ({ from, data }) => {
      await handleSignal(from, data);
    });
  }

  async function ensureLocalStream() {
    if (voiceState.localStream) return voiceState.localStream;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    voiceState.localStream = stream;
    stream.getTracks().forEach((track) => {
      track.enabled = !voiceState.muted;
    });
    return stream;
  }

  async function createPeerConnection(remoteId, isInitiator) {
    if (voiceState.peers.has(remoteId)) {
      return voiceState.peers.get(remoteId);
    }
    await ensureLocalStream();
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    voiceState.peers.set(remoteId, pc);

    voiceState.localStream.getTracks().forEach((track) => {
      pc.addTrack(track, voiceState.localStream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        voiceState.socket.emit("voice-signal", {
          to: remoteId,
          data: { type: "candidate", candidate: event.candidate }
        });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) {
        attachRemoteStream(remoteId, stream);
      }
    };

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      voiceState.socket.emit("voice-signal", { to: remoteId, data: pc.localDescription });
    }

    return pc;
  }

  async function handleSignal(from, data) {
    let pc = voiceState.peers.get(from);
    if (!pc) {
      pc = await createPeerConnection(from, false);
    }

    if (data.type === "offer") {
      await pc.setRemoteDescription(data);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      voiceState.socket.emit("voice-signal", { to: from, data: pc.localDescription });
      return;
    }

    if (data.type === "answer") {
      await pc.setRemoteDescription(data);
      return;
    }

    if (data.type === "candidate" && data.candidate) {
      try {
        await pc.addIceCandidate(data.candidate);
      } catch {
        // ignore bad candidates
      }
    }
  }

  function attachRemoteStream(remoteId, stream) {
    let audio = voiceAudio.querySelector(`[data-voice-id="${remoteId}"]`);
    if (!audio) {
      audio = document.createElement("audio");
      audio.dataset.voiceId = remoteId;
      audio.autoplay = true;
      audio.playsInline = true;
      voiceAudio.appendChild(audio);
    }
    audio.srcObject = stream;
  }

  function cleanupPeer(remoteId) {
    const pc = voiceState.peers.get(remoteId);
    if (pc) {
      pc.close();
      voiceState.peers.delete(remoteId);
    }
    const audio = voiceAudio.querySelector(`[data-voice-id="${remoteId}"]`);
    if (audio) {
      audio.srcObject = null;
      audio.remove();
    }
  }

  function cleanupAllPeers() {
    Array.from(voiceState.peers.keys()).forEach((id) => cleanupPeer(id));
    voiceState.peers.clear();
  }

  function resetVoiceState() {
    voiceState.members.clear();
    renderVoiceMembers();
    setVoiceStatus("Baglanti yok");
  }

  async function joinVoice() {
    if (voiceState.joinedServerId) return;
    try {
      setVoiceStatus("Baglaniyor...");
      await ensureLocalStream();
      initSocket();
      voiceState.joinedServerId = state.activeServerId;
      voiceState.members.set("local", { userId: voiceState.userId });
      renderVoiceMembers();
      setVoiceControls(true);
      voiceState.socket.emit("voice-join", {
        serverId: state.activeServerId,
        userId: voiceState.userId
      });
    } catch {
      setVoiceStatus("Mikrofon erisimi yok");
      setVoiceControls(false);
    }
  }

  function leaveVoice() {
    if (!voiceState.joinedServerId) return;
    voiceState.socket?.emit("voice-leave", { serverId: voiceState.joinedServerId });
    voiceState.joinedServerId = null;
    voiceState.localStream?.getTracks().forEach((track) => track.stop());
    voiceState.localStream = null;
    voiceState.muted = false;
    voiceMuteBtn.textContent = "Mikrofon: Acik";
    cleanupAllPeers();
    resetVoiceState();
    setVoiceControls(false);
  }

  function toggleMute() {
    voiceState.muted = !voiceState.muted;
    if (voiceState.localStream) {
      voiceState.localStream.getTracks().forEach((track) => {
        track.enabled = !voiceState.muted;
      });
    }
    voiceMuteBtn.textContent = voiceState.muted ? "Mikrofon: Kapali" : "Mikrofon: Acik";
  }

  serversList.addEventListener("click", (e) => {
    const btn = e.target.closest(".server-pill");
    if (!btn) return;
    if (voiceState.joinedServerId && voiceState.joinedServerId !== btn.dataset.serverId) {
      leaveVoice();
    }
    state.activeServerId = btn.dataset.serverId;
    renderAll();
  });

  function setMembersOpen(open) {
    state.membersOpen = open;
    membersPanel.classList.toggle("open", open);
  }

  memberList.addEventListener("click", (e) => {
    const actionBtn = e.target.closest("[data-action] ");
    if (!actionBtn) return;
    const item = e.target.closest(".member-item");
    if (!item) return;
    const memberId = item.dataset.memberId;
    const memberName = item.querySelector(".member-name")?.textContent || memberId;
    localStorage.setItem(ACTIVE_DM_KEY, memberId);
    localStorage.setItem(ACTIVE_DM_NAME_KEY, memberName);
    window.PIKARESK?.go?.("dm");
  });

  toggleMembers.addEventListener("click", () => {
    setMembersOpen(!state.membersOpen);
  });

  closeMembers.addEventListener("click", () => {
    setMembersOpen(false);
  });

  function sendServerMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    const server = getActiveServer();
    if (!server) return;
    if (!server.messages) server.messages = [];
    server.messages.push({
      author: "Sen",
      text,
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    });
    const stored = loadServerMessages();
    stored[server.id] = server.messages;
    saveServerMessages(stored);
    messageInput.value = "";
    renderChannelContent();
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  sendMessageBtn.addEventListener("click", sendServerMessage);
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendServerMessage();
    }
  });

  voiceJoinBtn.addEventListener("click", joinVoice);
  voiceLeaveBtn.addEventListener("click", leaveVoice);
  voiceMuteBtn.addEventListener("click", toggleMute);

  renderAll();
  setVoiceControls(false);
  renderVoiceMembers();

  const storedMessages = loadServerMessages();
  state.servers.forEach((server) => {
    if (storedMessages[server.id]) {
      server.messages = storedMessages[server.id];
    }
  });
  renderChannelContent();
}
