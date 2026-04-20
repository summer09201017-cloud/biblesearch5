const INSTALL_BUTTON = document.getElementById("install-button");
let deferredInstallPrompt = null;

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function updateInstallButton() {
  if (!INSTALL_BUTTON) {
    return;
  }

  INSTALL_BUTTON.hidden = false;
  INSTALL_BUTTON.textContent = isStandaloneMode() ? "已安裝 App" : "安裝 App";
}

function showInstallInstructions() {
  const message = isIosDevice()
    ? "iPhone 或 iPad 請按瀏覽器的分享按鈕，再選「加入主畫面」。"
    : "請按瀏覽器選單，再選「安裝 App」或「加入主畫面」。";

  window.alert(message);
}

async function installApp() {
  if (isStandaloneMode()) {
    window.alert("這個裝置已安裝此 App。");
    return;
  }

  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallButton();
    return;
  }

  showInstallInstructions();
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("/sw.js?v=20260419b");
  } catch (error) {
    console.warn("Service worker registration failed:", error);
  }
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallButton();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  updateInstallButton();
});

INSTALL_BUTTON?.addEventListener("click", installApp);

updateInstallButton();
registerServiceWorker();
