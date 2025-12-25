export function FriendItem(friend) {
  return `
    <div class="friend-item ${friend.status}">
      <span class="status-dot"></span>
      <span class="username">${friend.username}</span>
    </div>
  `;
}
