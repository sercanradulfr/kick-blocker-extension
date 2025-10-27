const input = document.getElementById("streamerName");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("blockedList");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 1500);
}

function renderList(blockedStreamers) {
  list.innerHTML = "";
  blockedStreamers.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.classList.add("remove-btn");
    removeBtn.onclick = () => removeStreamer(name);

    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

function loadList() {
  try {
    chrome.storage.sync.get("blockedStreamers", (data) => {
      renderList(data.blockedStreamers || []);
    });
  } catch (err) {
    console.error(err);
  }
}

function addStreamer() {
  const name = input.value.trim().toLowerCase();
  if (!name) return;

  chrome.storage.sync.get("blockedStreamers", (data) => {
    const blockedStreamers = data.blockedStreamers || [];
    if (blockedStreamers.includes(name)) {
      showToast("Already blocked!");
      return;
    }
    if (blockedStreamers.length >= 500) {
      showToast("Maximum 500 streamers allowed!");
      return;
    }

    blockedStreamers.push(name);
    chrome.storage.sync.set({ blockedStreamers }, () => {
      loadList();
      input.value = "";
      showToast("Streamer added!");
    });
  });
}

function removeStreamer(name) {
  chrome.storage.sync.get("blockedStreamers", (data) => {
    const blockedStreamers = (data.blockedStreamers || []).filter(n => n !== name);
    chrome.storage.sync.set({ blockedStreamers }, () => {
      loadList();
      showToast("Streamer removed!");
    });
  });
}

addBtn.addEventListener("click", addStreamer);
input.addEventListener("keyup", (e) => { if (e.key === "Enter") addStreamer(); });

loadList();
