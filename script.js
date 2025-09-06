console.log("Lets write Javascript");

let currFolder;
let audio = new Audio();
let currentIndex = 0;
let songs = [];

// DOM elements
let playBtn, previousBtn, nextBtn, volumeSlider, volumeIcon, seekbar, circle;

// Convert seconds to MM:SS
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Play a track
function playMusic(track) {
    try {
        audio.src = `${currFolder}/` + track;
        audio.play()
            .then(() => {
                playBtn.src = "pause.svg";
            })
            .catch(error => {
                console.error("Error playing audio:", error);
                playBtn.src = "play.svg";
            });
        document.querySelector(".songinfo").innerHTML = track ? decodeURI(track) : "";
        document.querySelector(".songtime").innerHTML = "00:00/00:00";
    } catch (error) {
        console.error("Error in playMusic function:", error);
    }
}

// Load songs from a folder — modified for direct loading
async function getSongs(folder) {
    currFolder = folder;
    try {
        console.log(`Loading songs from ${folder}`);
        
        // Hardcoded song lists for each folder to avoid fetch issues
        const songLists = {
            "songs/Real_boss": [
                "First Flex - PaagalWorld.Com.Se.mp3",
                "Hathyar 320Kbps  - PaagalWorld.Com.Se.mp3",
                "IN MATES - PaagalWorld.Com.Se.mp3",
                "Issue (Mudda Ishq Da) 320Kbps  - PaagalWorld.Com.Se.mp3",
                "Scammer - PaagalWorld.Com.Se.mp3",
                "Stuck B 320Kbps  - PaagalWorld.Com.Se.mp3",
                "ZAZA - PaagalWorld.Com.Se.mp3",
                "Wishes 320Kbps  - PaagalWorld.Com.Se.mp3",
                "Khayaal Talwiinder 128 Kbps.mp3"

            ],
            "songs/cheema_y": [
                "Brush Off - PaagalWorld.Com.Se.mp3",
                "Stag Entry 320Kbps  - PaagalWorld.Com.Se.mp3",
                "Takde Gharde - PaagalWorld.Com.Se.mp3",
                "Vancouver - PaagalWorld.Com.Se.mp3"
            ],
            "songs/SMG_Music": [
                "3 AM IN MUMBAI - PaagalWorld.Com.Se.mp3",
                "Bexley .Road - PaagalWorld.Com.Se.mp3"
            ],
            "songs/Dhanda_Nyoliwala": [
                "Knife Brows 320Kbps  - PaagalWorld.Com.Se.mp3",
                "Rubicon 320Kbps  - PaagalWorld.Com.Se.mp3",
                "Russian Bandana (Lo-Fi) - PaagalWorld.Com.Se.mp3"
            ]
        };
        
        // Get songs for the current folder
        let folderSongs = songLists[folder] || [];

    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of folderSongs) {
        if (song) {
            let displayName = song;
            try {
                // Format the song name
                if (typeof song === 'string') {
                    displayName = song.replace(/%20/g, " ")
                        .replace(/-?\s*PaagalWorld\.Com\.Se\.mp3$/i, "")
                        .replace(/320Kbps/gi, "")
                        .replace(/\(.*?\)/g, "")
                        .trim();
                }
            } catch (error) {
                console.error("Error formatting song name:", error);
            }
            
            songUL.insertAdjacentHTML('beforeend', `
                <li data-file="${song}">
                    <img class="invert" src="music.svg" alt="">
                    <div class="info">
                        <div>${displayName}</div>
                        <div>Jatin</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="play.svg" alt="">
                    </div>
                </li>
            `);
        }
    }

    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            const file = e.getAttribute("data-file");
            currentIndex = folderSongs.indexOf(file);
            playMusic(file);
        });
    });

    return folderSongs;
    } catch (error) {
        console.error(`Error fetching songs from ${folder}:`, error);
        return [];
    }
}

// Display albums — do not change
async function displayAlbums() {
    const folders = ["Real_boss", "cheema_y", "SMG_Music", "Dhanda_Nyoliwala"];
    const cardContainer = document.querySelector(".cardContainer");
    const folderCovers = {
        "Real_boss": "cover1.jpeg",
        "cheema_y": "cover.jpeg",
        "SMG_Music": "cover2.jpeg",
        "Dhanda_Nyoliwala": "cover4.jpeg"
    };

    for (const folder of folders) {
        let info = { title: folder, description: "No description available" };
        try {
            const infoRes = await fetch(`songs/${folder}/info.json`);
            if (infoRes.ok) info = await infoRes.json();
        } catch (err) {
            console.error(`Error loading info.json for ${folder}:`, err);
        }
        const coverImg = folderCovers[folder] || "cover.jpeg";

        cardContainer.insertAdjacentHTML('beforeend', `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="48" height="48" viewBox="0 0 48 48">
                        <defs>
                            <filter id="shadow" x="0" y="0" width="200%" height="200%">
                                <feOffset result="offOut" in="SourceAlpha" dx="0" dy="2"/>
                                <feGaussianBlur result="blurOut" in="offOut" stdDeviation="2"/>
                                <feColorMatrix result="blurOut" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                                <feBlend in="SourceGraphic" in2="blurOut" mode="normal"/>
                            </filter>
                        </defs>
                        <circle cx="24" cy="24" r="22" fill="#90EE90" filter="url(#shadow)"/>
                        <path d="M18 34V14L32 24L18 34Z" fill="black"/>
                    </svg>
                </div>

                <img src="songs/${folder}/${coverImg}" alt="${folder} cover">

                <h2>${info.title}</h2>
                <p>${info.description}</p>
            </div>
        `);
    }

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async event => {
            const folder = event.currentTarget.dataset.folder;
            songs = await getSongs(`songs/${folder}`);
            currentIndex = 0;
            if (songs.length > 0) {
                playMusic(songs[currentIndex]);
            }
        });
    });

    songs = await getSongs("songs/Real_boss");
    currentIndex = 0;
    if (songs.length > 0) {
        playMusic(songs[currentIndex]);
    }
}

// Main function — fixed event listeners
async function main() {
    // Cache DOM elements according to your HTML
    playBtn = document.getElementById("play");
    previousBtn = document.getElementById("previous");
    nextBtn = document.getElementById("next");
    volumeSlider = document.querySelector(".volume input[type='range']");
    volumeIcon = document.querySelector(".volume img");
    seekbar = document.querySelector(".seekbar");
    circle = document.querySelector(".circle");

    await displayAlbums();

    // Play/Pause
    playBtn.addEventListener("click", () => {
        if (audio.paused) {
            if (songs.length > 0) {
                if (!audio.src) {
                    playMusic(songs[currentIndex]);
                } else {
                    audio.play();
                    playBtn.src = "pause.svg";
                }
            }
        } else {
            audio.pause();
            playBtn.src = "play.svg";
        }
    });

    // Previous
    previousBtn.addEventListener("click", () => {
        if (!songs.length) return;
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        playMusic(songs[currentIndex]);
    });

    // Next
    nextBtn.addEventListener("click", () => {
        if (!songs.length) return;
        currentIndex = (currentIndex + 1) % songs.length;
        playMusic(songs[currentIndex]);
    });

    // Time update & seekbar
    audio.addEventListener("timeupdate", () => {
        if (!audio.duration) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        circle.style.left = percent + "%";
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(audio.currentTime)} / ${secondsToMinutesSeconds(audio.duration)}`;
    });

    // Seekbar click
    seekbar.addEventListener("click", e => {
        const percent = e.offsetX / seekbar.getBoundingClientRect().width;
        audio.currentTime = audio.duration * percent;
        circle.style.left = percent * 100 + "%";
    });

    // Volume control
    audio.volume = volumeSlider.value / 100;
    volumeSlider.addEventListener("input", e => {
        const vol = parseInt(e.target.value) / 100;
        audio.volume = vol;
        volumeIcon.src = vol === 0 ? "mute.svg" : "volume.svg";
    });

    // Mute/unmute
    volumeIcon.addEventListener("click", () => {
        if (audio.volume > 0) {
            audio.dataset.prevVolume = audio.volume;
            audio.volume = 0;
            volumeSlider.value = 0;
        } else {
            const prev = audio.dataset.prevVolume || 0.5;
            audio.volume = prev;
            volumeSlider.value = prev * 100;
        }
        volumeIcon.src = audio.volume === 0 ? "mute.svg" : "volume.svg";
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // ===== Add this line here =====
audio.addEventListener("ended", () => {
    if (!songs.length) return;
    currentIndex = (currentIndex + 1) % songs.length;
    playMusic(songs[currentIndex]);
});

    const songListDiv = document.querySelector(".songList");
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search songs...";
    searchInput.style.width = "90%";
    searchInput.style.margin = "10px";
    searchInput.style.padding = "5px";
    songListDiv.insertBefore(searchInput, songListDiv.firstChild);

    const searchResultsUL = document.createElement("ul");
    songListDiv.insertBefore(searchResultsUL, songListDiv.children[1]);

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        searchResultsUL.innerHTML = "";
        if (!query) return;
        songs.forEach(song => {
            const displayName = song.replace(/%20/g, " ")
                .replace(/-?\s*PaagalWorld\.Com\.Se\.mp3$/i, "")
                .replace(/320Kbps/gi, "")
                .replace(/\(.*?\)/g, "")
                .trim();
            if (displayName.toLowerCase().includes(query)) {
                const li = document.createElement("li");
                li.innerHTML = `
                    <div class="info">
                        <div>${displayName}</div>
                        <div>Jatin</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="play.svg" alt="">
                    </div>
                `;
                li.addEventListener("click", () => {
                    currentIndex = songs.indexOf(song);
                    playMusic(song);
                });
                searchResultsUL.appendChild(li);
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", main);

// ==========================
// Inject Signup & Login Form (localStorage auth)
// ==========================

// Create auth modal dynamically
const authModal = document.createElement("div");
authModal.id = "authModal";
authModal.style.position = "fixed";
authModal.style.top = "0";
authModal.style.left = "0";
authModal.style.width = "100%";
authModal.style.height = "100%";
authModal.style.background = "rgba(0,0,0,0.7)";
authModal.style.display = "none";
authModal.style.justifyContent = "center";
authModal.style.alignItems = "center";
authModal.style.zIndex = "1000";

authModal.innerHTML = `
  <div style="background:#222; color:#fff; padding:20px; border-radius:10px; width:300px; display:flex; flex-direction:column;">
    <span id="closeAuth" style="align-self:flex-end; cursor:pointer;">&times;</span>
    <h2 id="authTitle">Sign Up</h2>
    <input type="text" id="authEmail" placeholder="Email" style="margin:5px 0; padding:8px; border-radius:5px; border:none;">
    <input type="password" id="authPassword" placeholder="Password" style="margin:5px 0; padding:8px; border-radius:5px; border:none;">
    <button id="authActionBtn" style="margin-top:10px; padding:8px; background:#1db954; border:none; border-radius:5px; cursor:pointer;">Submit</button>
    <p id="authMessage"></p>
  </div>
`;
document.body.appendChild(authModal);

// Elements
const signupBtn = document.querySelector(".signupbtn");
const loginBtn = document.querySelector(".loginbtn");
const closeAuth = document.getElementById("closeAuth");
const authTitle = document.getElementById("authTitle");
const authActionBtn = document.getElementById("authActionBtn");
const authMessage = document.getElementById("authMessage");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");

let authMode = "signup"; // default

// Show modal on signup
signupBtn.addEventListener("click", () => {
  authMode = "signup";
  authTitle.innerText = "Sign Up";
  authActionBtn.innerText = "Sign Up";
  authModal.style.display = "flex";
});

// Show modal on login
loginBtn.addEventListener("click", () => {
  authMode = "login";
  authTitle.innerText = "Login";
  authActionBtn.innerText = "Login";
  authModal.style.display = "flex";
});

// Close modal
closeAuth.addEventListener("click", () => {
  authModal.style.display = "none";
  authMessage.innerText = "";
});

// Handle submit
authActionBtn.addEventListener("click", () => {
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();

  if (!email || !password) {
    authMessage.innerText = "Please enter email and password.";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (authMode === "signup") {
    if (users[email]) {
      authMessage.innerText = "User already exists. Try login.";
      return;
    }
    users[email] = { password };
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", email);
    authMessage.innerText = "Signup successful! You are logged in.";
  } else if (authMode === "login") {
    if (users[email] && users[email].password === password) {
      localStorage.setItem("currentUser", email);
      authMessage.innerText = `Welcome back, ${email}!`;
    } else {
      authMessage.innerText = "Invalid email or password.";
    }
  }
});






