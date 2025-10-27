chrome.storage.sync.get("blockedStreamers", (data) => {
  const blockedList = data.blockedStreamers || [];
  const hiddenCards = new Set();

  hideBlockedStreamers(blockedList, hiddenCards);
  hideMainCarousel();
  observeDOM(blockedList, hiddenCards);
});

// Belirli yayıncıları gizleyen fonksiyon
function hideBlockedStreamers(blockedList, hiddenCards) {
  try {
    const cards = document.querySelectorAll("a[href^='/']");
    cards.forEach((link) => {
      const name = link.getAttribute("href")?.split("/")[1]?.toLowerCase();
      if (!name || !blockedList.includes(name)) return;

      const card = link.closest("div[class*='card'], article, div[class*='grid']");
      if (card && !hiddenCards.has(card)) {
        card.style.display = "none";
        hiddenCards.add(card);
      } else if (!card) {
        link.style.display = "none";
      }
    });
  } catch (err) {
    console.error("Error hiding streamers:", err);
  }
}

// Ana carousel’i gizleyen fonksiyon
function hideMainCarousel() {
  try {
    const container = document.querySelector("div.flex.w-full.justify-between");
    if (container) {
      container.style.display = "none";
      console.log("Main carousel hidden");
    }
  } catch (err) {
    console.error("Error hiding main carousel:", err);
  }
}

// DOM değişikliklerini gözlemleyip hem bloklanan yayıncıları hem de carousel’i tekrar gizleyen observer
function observeDOM(blockedList, hiddenCards) {
  let timeout;
  const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      hideBlockedStreamers(blockedList, hiddenCards);
      hideMainCarousel();
    }, 200);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
