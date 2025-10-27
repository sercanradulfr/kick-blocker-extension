// ==UserScript==
// @name         Kick Streamer Blocker
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Hide unwanted streamers from Kick’s Home and Browse pages
// @author       sercanradulfr
// @match        https://kick.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Chrome storage’dan bloklanan yayıncı listesini al
    chrome.storage.sync.get("blockedStreamers", (data) => {
        const blockedList = (data.blockedStreamers || []).map(name => name.toLowerCase());
        const hiddenCards = new Set();

        if (isHomePage()) {
            hideMainCarousel();
        }

        hideBlockedStreamers(blockedList, hiddenCards);
        observeDOM(blockedList, hiddenCards);
    });

    // Sayfanın anasayfa olup olmadığını kontrol eder
    function isHomePage() {
        const path = window.location.pathname;
        return path === '/' || path === '';
    }

    // Yayıncıları gizleyen fonksiyon
    function hideBlockedStreamers(blockedList, hiddenCards) {
        try {
            // Sadece yayın kartlarını hedefle
            const links = document.querySelectorAll("a[href^='/']");
            links.forEach((link) => {
                const name = link.getAttribute("href")?.split("/")[1]?.toLowerCase();
                if (!name || !blockedList.includes(name)) return;

                // Kart veya link bulunduğunda gizle
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

    // Ana carousel’i gizleyen fonksiyon (sadece anasayfada)
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

    // DOM değişikliklerini gözlemleyip dinamik içerikleri gizleyen observer
    function observeDOM(blockedList, hiddenCards) {
        let timeout;
        const observer = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                hideBlockedStreamers(blockedList, hiddenCards);

                // Sadece anasayfada carousel gizle
                if (isHomePage()) {
                    hideMainCarousel();
                }
            }, 200);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

})();

