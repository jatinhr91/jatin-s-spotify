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
    audio.src = `http://127.0.0.1:3000/${currFolder}/` + track;
    audio.play();
    playBtn.src = "pause.svg";
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

// Load songs from a folder — do not change
async function getSongs(folder) {
    currFolder = folder;
    let res = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let text = await res.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let as = div.getElementsByTagName("a");

    let folderSongs = [];
    for (let a of as) {
        if (a.href.endsWith(".mp3")) {
            folderSongs.push(a.href.split(`${folder}/`)[1]);
        }
    }

    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of folderSongs) {
        songUL.insertAdjacentHTML('beforeend', `
            <li data-file="${song}">
                <img class="invert" src="music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")
                        .replace(/-?\s*PaagalWorld\.Com\.Se\.mp3$/i, "")
                        .replace(/320Kbps/gi, "")
                        .replace(/\(.*?\)/g, "")
                        .trim()}</div>
                    <div>Jatin</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="">
                </div>
            </li>
        `);
    }

    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            const file = e.getAttribute("data-file");
            currentIndex = folderSongs.indexOf(file);
            playMusic(file);
        });
    });

    return folderSongs;
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
            const infoRes = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
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

                <img src="/songs/${folder}/${coverImg}" alt="${folder} cover">

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
            
        });
    });

    songs = await getSongs("songs/Real_boss");
    currentIndex = 0;
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
            audio.play();
            playBtn.src = "pause.svg";
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
}

document.addEventListener("DOMContentLoaded", main);






