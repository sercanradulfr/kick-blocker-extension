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

    // Get the blocked streamer list from Chrome storage
    chrome.storage.sync.get("blockedStreamers", (data) => {
        const blockedList = (data.blockedStreamers || []).map(name => name.toLowerCase());
        const hiddenCards = new Set();

        if (isHomePage()) {
            hideMainCarousel();
        }

        hideBlockedStreamers(blockedList, hiddenCards);
        observeDOM(blockedList, hiddenCards);
    });

    // Checks if the current page is the homepage
    function isHomePage() {
        const path = window.location.pathname;
        return path === '/' || path === '';
    }

    // Function to hide blocked streamers
    function hideBlockedStreamers(blockedList, hiddenCards) {
        try {
            // Target only streamer links
            const links = document.querySelectorAll("a[href^='/']");
            links.forEach((link) => {
                const name = link.getAttribute("href")?.split("/")[1]?.toLowerCase();
                if (!name || !blockedList.includes(name)) return;

                // Hide the closest card or link container
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

    // Function to hide the main carousel (homepage only)
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

    // Observer to watch for DOM changes and hide dynamic content
    function observeDOM(blockedList, hiddenCards) {
        let timeout;
        const observer = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                hideBlockedStreamers(blockedList, hiddenCards);

                // Hide carousel only on homepage
                if (isHomePage()) {
                    hideMainCarousel();
                }
            }, 200); // Debounce to avoid excessive calls
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

})();


