let observer = null;
let deathnoteCards = [];
let isRunning = false;
let clickHandler = null;
let activeModal = null;

function startExtension() {
    if (isRunning) {
        return;
    }

    isRunning = true;

    observer = new MutationObserver(() => {
        const nickname = document.querySelector('[class*="Nickname"]');

        if (!nickname) {
            return;
        }

        observer.disconnect();
        observer = null;

        initialDeathnote(
            nickname.textContent.trim(),
            nickname
        );
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    //глобальный click handler
    clickHandler = (event) => {
        const target = event.target;

        if (!(target instanceof HTMLElement)) {
            return;
        }

        if (!target.classList.contains("dn-open-modal-btn")) {
            return;
        }

        const card = target.closest(".deathnote-card");

        if (!card) {
            console.log("Карточка не найдена");
            return;
        }

        console.log("Карточка найдена");

        openModal(
            card.dataset.nickname,
            card.dataset.playerId
        );
    };

    document.addEventListener("click", clickHandler);
}


function stopExtension() {
    if (!isRunning) {
        return;
    }

    isRunning = false;

    // Останавливаем MutationObserver
    if (observer) {
        observer.disconnect();
        observer = null;
    }

    if (clickHandler) {
        document.removeEventListener("click", clickHandler);
        clickHandler = null;
    }


    deathnoteCards.forEach((card) => {
        card.remove();
    });

    deathnoteCards = [];

    if (activeModal) {
        activeModal.remove();
        activeModal = null;
    }
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") {
        return;
    }

    if (!changes.enabled) {
        return;
    }

    const enabled = changes.enabled.newValue;

    console.log("Enabled changed:", enabled);

    if (enabled) {
        startExtension();
    } else {
        stopExtension();
    }
});


chrome.storage.local.get(["enabled"], (result) => {
    const enabled = result.enabled ?? true;

    if (!enabled) {
        console.log("Deathnote disabled");
        return;
    }

    startExtension();
});

function openModal(nickname, playerId) {

    const closeModal = () => {
        if (activeModal) {
            activeModal.remove();
            activeModal = null;
        }
    };


    const modalOverlay = document.createElement("div");

    modalOverlay.className = "deathnote-modal-overlay";

    modalOverlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(0,0,0,0.75);
        display: flex;
        align-items: center;
        justify-content: center;
    `;


    const modalCard = document.createElement("div");

    modalCard.className = "deathnote-modal-card";

    modalCard.style.cssText = `
        width: 420px;
        max-width: 90%;
        background: #1e1f22;
        color: orange;
        padding: 24px;
        border-radius: 10px;
        box-sizing: border-box;
        box-shadow: 0 10px 40px rgba(0,0,0,0.6);
    `;


    modalCard.innerHTML = `
        <h2>Report: ${nickname}</h2>

        <section>
            Reason:
            <input
                id="deathnote-reason"
                name="reason"
                placeholder="Reason"
            />
        </section>

        <section>
            Comment:
            <input
                id="deathnote-comment"
                name="comment"
                placeholder="Comment"
            />
        </section>

        <button class="deathnote-submit-btn">
            Submit
        </button>

        <button class="deathnote-close-btn">
            &times;
        </button>

        <div class="deathnote-modal-footer">
            <button class="deathnote-cancel-btn">
                Cancel
            </button>
        </div>
    `;


    modalOverlay.appendChild(modalCard);

    document.body.appendChild(modalOverlay);

    activeModal = modalOverlay;


    const closeBtn = modalCard.querySelector(
        ".deathnote-close-btn"
    );

    closeBtn.addEventListener(
        "click",
        closeModal
    );


    const cancelBtn = modalCard.querySelector(
        ".deathnote-cancel-btn"
    );

    cancelBtn.addEventListener(
        "click",
        closeModal
    );


    const submitButton = modalCard.querySelector(
        ".deathnote-submit-btn"
    );

    submitButton.addEventListener(
        "click",
        () => {
            console.log("Submit нажата");
        }
    );
}

function getPlayer(nickname) {

    return new Promise((resolve, reject) => {

        chrome.runtime.sendMessage(
            {
                type: "GET_PLAYER",
                nickname,
            },
            (response) => {

                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }

                resolve(response);
            }
        );

    });
}


function getDeathnote(playerId) {

    return new Promise((resolve, reject) => {

        chrome.runtime.sendMessage(
            {
                type: "GET_DEATHNOTE",
                playerId,
            },
            (response) => {

                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }

                resolve(response);
            }
        );

    });
}

async function initialDeathnote(
    nickname,
    nicknameElement
) {

    try {

        const playerData = await getPlayer(nickname);

        const playerId = playerData.player_id;


        if (!playerId) {
            console.error("Игрок не найден");
            return;
        }


        const deathnoteData =
            await getDeathnote(playerId);

        const {
            memeScore,
            count
        } = deathnoteData;


        console.log(
            `Статистика deathnote ${nickname}: Score - ${memeScore}, Count - ${count}`
        );


        const card = document.createElement("div");

        card.dataset.nickname = nickname;
        card.dataset.playerId = playerId;

        card.className = "deathnote-card";


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


        const scoreColor =
            memeScore >= 80
                ? "#ff3333"
                : memeScore >= 50
                    ? "#ffcc00"
                    : "#55ff55";


        card.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
                border-bottom: 1px solid #2d2e33;
                padding-bottom: 8px;
            ">
                <span style="
                    color: #ff5500;
                    font-weight: 700;
                    font-size: 11px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                ">
                    Deathnote Stats
                </span>

                <span style="
                    font-size: 10px;
                    color: #8a8c94;
                ">
                    ID: ${playerId.substring(0, 8)}...
                </span>
            </div>


            <div style="
                display: flex;
                gap: 16px;
                margin-bottom: 14px;
            ">

                <div style="
                    flex: 1;
                    background: #151618;
                    padding: 8px;
                    border-radius: 4px;
                    text-align: center;
                ">

                    <div style="
                        font-size: 10px;
                        color: #8a8c94;
                        text-transform: uppercase;
                        margin-bottom: 2px;
                    ">
                        MemeScore
                    </div>

                    <div style="
                        font-size: 18px;
                        font-weight: 700;
                        color: ${scoreColor};
                    ">
                        ${memeScore ?? 0}
                    </div>

                </div>


                <div style="
                    flex: 1;
                    background: #151618;
                    padding: 8px;
                    border-radius: 4px;
                    text-align: center;
                ">

                    <div style="
                        font-size: 10px;
                        color: #8a8c94;
                        text-transform: uppercase;
                        margin-bottom: 2px;
                    ">
                        Reports
                    </div>

                    <div style="
                        font-size: 18px;
                        font-weight: 700;
                        color: #ff4444;
                    ">
                        ${count ?? 0}
                    </div>

                </div>

            </div>


            <button
                class="dn-open-modal-btn"
                style="
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
                "
            >
                Submit Report
            </button>
        `;


        // Hover

        const btn = card.querySelector(
            ".dn-open-modal-btn"
        );

        btn.onmouseenter = () => {
            btn.style.background = "#e04b00";
        };

        btn.onmouseleave = () => {
            btn.style.background = "#ff5500";
        };


        const cardContent =
            document.querySelector('[class*="CardContent"]');


        if (!cardContent) {
            console.error(
                "SecondaryContent не найден"
            );

            return;
        }


        cardContent.appendChild(card);

        deathnoteCards.push(card);

    } catch (error) {

        console.error(error.name);
        console.error(error.message);
        console.error(error.stack);

    }

}

