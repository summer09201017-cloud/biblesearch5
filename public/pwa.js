const INSTALL_BUTTON = document.getElementById("install-button");
let deferredInstallPrompt = null;
let isRefreshingForUpdate = false;

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
    const registration = await navigator.serviceWorker.register("/sw.js?v=20260421a");
    watchServiceWorker(registration);
    navigator.serviceWorker.addEventListener("controllerchange", refreshForUpdatedWorker);
    triggerServiceWorkerUpdate(registration);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        triggerServiceWorkerUpdate(registration);
      }
    });
  } catch (error) {
    console.warn("Service worker registration failed:", error);
  }
}

function refreshForUpdatedWorker() {
  if (isRefreshingForUpdate) {
    return;
  }

  isRefreshingForUpdate = true;
  window.location.reload();
}

function activateWaitingWorker(registration) {
  if (!registration?.waiting) {
    return false;
  }

  registration.waiting.postMessage({ type: "SKIP_WAITING" });
  return true;
}

function watchServiceWorker(registration) {
  activateWaitingWorker(registration);

  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    if (!installing) {
      return;
    }

    installing.addEventListener("statechange", () => {
      if (installing.state === "installed" && navigator.serviceWorker.controller) {
        activateWaitingWorker(registration);
      }
    });
  });
}

function triggerServiceWorkerUpdate(registration) {
  registration.update().catch((error) => {
    console.warn("Service worker update check failed:", error);
  });
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
