const observer = new MutationObserver(() => {
    const nickname = document.querySelector('[class*="Nickname"]');

    if (nickname) {
        observer.disconnect()
        initialDeathnote(nickname.textContent, nickname)
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});

    function openModal(nickname, playerId) {
    const closeModal = () => {
        modalOverlay.remove()
    }
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "deathnote-modal-overlay";

    const modalCard = document.createElement("div");
    modalCard.className = "deathnote-modal-card";
    modalCard.innerHTML = ` 
        <h2>Report: ${nickname}</h2> 
        <button class="deathnote-close-btn">&times;</button>
        <div class="deathnote-modal-footer">
            <button class="deathnote-cancel-btn">Cancel</button>
        </div>
    `; 

    modalOverlay.appendChild(modalCard)
    document.body.appendChild(modalOverlay)

    const closeBtn = modalCard.querySelector(".deathnote-close-btn");
    closeBtn.addEventListener("click", closeModal);

    const cancelBtn = modalCard.querySelector(".deathnote-cancel-btn");
    cancelBtn.addEventListener("click", closeModal);
}


async function initialDeathnote(nickname, nicknameElement) {
    try {
        console.log("nickname", nickname);
    const playerResponse = await fetch(`https://faceit-extension.vercel.app/api/faceit/player?nickname=${nickname}`)
    console.log(playerData);
console.log(playerData.player_id);
    if (!playerResponse.ok) {
        throw new Error(`Faceit Api Error`)
    }
    const playerData = await playerResponse.json()
    const playerId = playerData.player_id
    if (!playerId) {
        console.error(`Игрок не найден`)
        return;
    }
    console.log(playerData);
console.log(playerData.player_id);
    const deathnoteResponse = await fetch(`https://faceit-extension.vercel.app/api/deathnote/player/${playerId}`)
    console.log(deathnoteData);
    if (!deathnoteResponse.ok) {
        throw new Error(`Deathnote Api Error`)
    }
    const deathnoteData = await deathnoteResponse.json()
    const {memeScore, count} = deathnoteData;

    console.log(`Статистика deathnote ${nickname}: Score- ${memeScore}, Count - ${count}`)

    const card = document.createElement("div");
    card.className= "deathnote-card";
    card.style.cssText = `
    background: #1e1f22;
    border: 1px solid rgba(255,85,0,0.4);
    border-radius: 6px;
    padding: 14px;
    margin: 12px 0;
    font-family: "Play", "Helvetica Neue", "Arial", sans-serif;
    color: #fff;
    max-width: 100%;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    box-sizing: border-box;
    `;

    const scoreColor = memeScore >= 80 ? "#ff3333" : memeScore >= 50? "#ffcc00" : "#55ff55"
    
    //Наполняем карточку структурой
    card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #2d2e33; padding-bottom: 8px">
            <span style="color: #ff5500; font-weight: 700; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">Deathnote Stats</span>
            <span style="font-size: 10px; color: #8a8c94;">ID: ${playerId.substring(0, 8)}...</span>
        </div>

        <div style="display: flex; gap: 16px; margin-bottom: 14px;">
                <div style="flex: 1; background: #151618; padding: 8px; border-radius: 4px; text-align: center;">
                    <div style="font-size: 10px; color: #8a8c94; text-transform: uppercase; margin-bottom: 2px;">MemeScore</div>
                    <div style="font-size: 18px; font-weight: 700; color: ${scoreColor};">${memeScore ?? 0}</div>
                </div>
                <div style="flex: 1; background: #151618; padding: 8px; border-radius: 4px; text-align: center;">
                    <div style="font-size: 10px; color: #8a8c94; text-transform: uppercase; margin-bottom: 2px;">Reports</div>
                    <div style="font-size: 18px; font-weight: 700; color: #ff4444;">${count ?? 0}</div>
                </div>
        </div>

         <button id="dn-open-modal-btn" style="
                background: #ff5500;
                color: #fff;
                border: none;
                padding: 10px 16px;
                border-radius: 4px;
                cursor: pointer;
                width: 100%;
                font-weight: 600;
                font-size: 13px;
                transition: background 0.2s;
            ">Submit Report</button>
    `;

    //эффект хоовера для кнопки на чистоом jse
    const btn = card.querySelector("#dn-open-modal-btn");
    btn.onmouseenter = () => btn.style.background = "#e04b00";
    btn.onmouseleave = () => btn.style.background = "#ff5500";

    //привязка клика и вызов модалки
    btn.onclick = () => {
        openModal(nickname, playerId);
    };


    } catch (error) {
        console.error(error.name)
        console.error(error.message)
        console.error(error.stack)
    }

}