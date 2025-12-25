const KEY = "pikareks_friends";

export function getFriends() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

export function addFriend(friend) {
  const friends = getFriends();
  friends.push(friend);
  localStorage.setItem(KEY, JSON.stringify(friends));
}

export function updateFriend(id, data) {
  const friends = getFriends().map(f =>
    f.id === id ? { ...f, ...data } : f
  );
  localStorage.setItem(KEY, JSON.stringify(friends));
}
