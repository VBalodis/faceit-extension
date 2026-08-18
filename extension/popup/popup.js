const toggleBtn = document.getElementById("toggleBtn");

init();

async function init() {
    const result = await chrome.storage.local.get("enabled");

    const enabled = result.enabled ?? true;

    if (result.enabled === undefined) {
        await chrome.storage.local.set({
            enabled: true
        });
    }

    render(enabled);
}

toggleBtn.addEventListener("click", async () => {
    const result = await chrome.storage.local.get("enabled");

    const currentState = result.enabled ?? true;
    const newState = !currentState;

    await chrome.storage.local.set({
        enabled: newState
    });

    render(newState);
});

function render(enabled) {
    toggleBtn.textContent = enabled
        ? "Extension ON"
        : "Extension OFF";
}