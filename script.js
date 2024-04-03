var currentsong = new Audio();
let song;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/projects/spotify/${currFolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.querySelectorAll("a");
    song = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            song.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }
    let songul = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songul.innerHTML = "";

    for (var songs of song) {
        songul.innerHTML += `<li>
       <img class="invert" src="music.svg " alt="">
       <div class="info">
           <div>${songs.replaceAll("%20", " ")}</div>
           <div>Song Artist</div>
       </div>
       <div class="playnow">
           <span>Play Now</span>
           <img class="invert" src="play2.svg" alt="">
       </div>
      
   </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            play_music(e.querySelector(".info").firstElementChild.innerHTML);
        });
    });
    return song
}

function play_music(music, pause = false) {

    currentsong.src = `http://127.0.0.1:5500/projects/spotify/${currFolder}/` + music;
    if (!pause) {
        currentsong.play()
        play.src = "pause.svg"

    }

    document.querySelector(".songinfo").innerHTML = decodeURI(music)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"

}
async function displayAllAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/projects/spotify/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardcontainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        let e = array[index];
        if (e.href.includes("/songs")) {
            let f = (e.href.split("/").slice(-1)[0])
            if (f !== "songs") {
                let a = await fetch(`http://127.0.0.1:5500/projects/spotify/songs/${f}/info.json`);
                let response = await a.json();
                cardContainer.innerHTML += `<div data-folder="${f}" class="card">
            <button><img src="play.png" alt=""></button>
            <img src="songs/${f}/cover.jpg" alt="">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`
            }
        }


    }
    Array.from(document.querySelectorAll(".card")).forEach(e => {
        e.addEventListener("click", async item => {
            song = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            play_music(song[0])
        })
    })

}

async function main() {
    await getsongs("songs/randomsong");
    play_music(song[0], true);

    await displayAllAlbums()


    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        } else {
            currentsong.pause()
            play.src = "play2.svg"

        }
    })

    currentsong.addEventListener("timeupdate", () => {

        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
        let circle = document.querySelector(".circle");

        circle.style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
      

    })

    document.querySelector(".line").addEventListener("click", e => {

        const progressPercent = (e.offsetX / e.target.offsetWidth) * 100;
        const circle = document.querySelector(".circle");
        if (circle) {
            circle.style.left = `${progressPercent}%`;
        }
        const newTime = (e.offsetX / e.target.offsetWidth) * currentsong.duration;
        currentsong.currentTime = newTime;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    prev.addEventListener("click", () => {

        let index = song.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            play_music(song[index - 1])
        }
    })
    next.addEventListener("click", () => {

        let index = song.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < song.length) {
            play_music(song[index + 1])
        }
    });

    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = (e.target.value) / 100

    })

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("vol.svg")) {
            e.target.src = e.target.src.replace("vol.svg", "mute.svg")
            currentsong.volume = 0
        } else {
            e.target.src = e.target.src.replace("mute.svg", "vol.svg")
            currentsong.volume = .1
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10



        }
    })

}

main();
