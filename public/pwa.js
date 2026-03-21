const INSTALL_BUTTON = document.getElementById("install-button");
let deferredInstallPrompt = null;

function showInstallButton() {
  if (INSTALL_BUTTON && deferredInstallPrompt) {
    INSTALL_BUTTON.hidden = false;
  }
}

function hideInstallButton() {
  if (INSTALL_BUTTON) {
    INSTALL_BUTTON.hidden = true;
  }
}

async function installApp() {
  if (!deferredInstallPrompt) {
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  hideInstallButton();
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("/sw.js?v=20260321b");
  } catch (error) {
    console.warn("Service worker registration failed:", error);
  }
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  showInstallButton();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  hideInstallButton();
});

INSTALL_BUTTON?.addEventListener("click", installApp);

registerServiceWorker();
