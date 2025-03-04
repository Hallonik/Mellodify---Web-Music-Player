console.log("Lets start the Music scripting...");

let currentsong = new Audio();
let songs;
let currfolder;
async function getsongs(folder) {
    try {
        currfolder = folder
        let response = await fetch(`./${currfolder}/`); // Fetch directory listing
        let text = await response.text();


        let div = document.createElement("div");
        div.innerHTML = text;

        // Extract song file names if they are inside <a> tags (server-generated listing)
        let links = div.getElementsByTagName("a");

        songs = [];

        for (let link of links) {
            let href = link.getAttribute("href");
            if (href.endsWith(".mp3")) { // Filter only MP3 files
                songs.push(href.split(`/${folder}/`)[1]); // Extract the song name
            }
        }


        //Show all the songs in the list
        let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
        songUL.innerHTML = ""
        for (const element of songs) {

            songUL.innerHTML = songUL.innerHTML + `<li>
         <img class="invert" src="img/music.svg" alt="">
                            <div class="songinfo">
                                <div class="musicname">${element.replaceAll("%20", " ")}</div>
                                <div class ="artistname">Arijit Singh,Shreya Ghosal</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>

                                <img class="invert" src="img/playsong.svg" alt="">
                            </div>
        </li>`;

        }

        //Attatch eventlistener to each song
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
            e.addEventListener("click", () => {
                //   console.log(e.querySelector(".songinfo").firstElementChild.innerHTML);
                playMusic((e.querySelector(".songinfo").firstElementChild.innerHTML.trim()));
            });
        })




        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}



const playMusic = (track, pause = false) => {
    // let audio = new Audio("./Songs/"+track);
    currentsong.src = `./${currfolder}/` + track;
    // console.log(currentsong);
    playon.src = "img/playsong.svg";


    if (!pause) {

        currentsong.play();
        playon.src = "img/pause.svg";
    }

    document.querySelector(".displayinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}
const formatTime = (time) => {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

async function displayAlbums() {

    let response = await fetch("./Songs/"); // Fetch directory listing
    let text = await response.text();


    let div = document.createElement("div");
    div.innerHTML = text;

    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer")



    let array = Array.from(anchors)
    for (let i = 0; i < array.length; i++) {
        const e = array[i]
        if (e.href.includes("/Songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            //Get metadata of the folder


            let a = await fetch(`./Songs/${folder}/info.json`); // Fetch directory listing
            let resp = await a.json();


            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <img src="img/play.svg" alt="">
            </div>
            <img src="./Songs/${folder}/cover.jpeg" alt="" width=50px>

            <h3>${resp.title}</h3>
            <p>${resp.description}</p>
        </div>`


        }
    }
    //Load the playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {

            songs = await getsongs(`Songs/${item.currentTarget.dataset.folder}`);


        })
    })
}


async function main() {

    //Get the list of all the songs 

    await getsongs("Songs/crs");


    playMusic(songs[0], true)

    //Display all ablbums in the page
    displayAlbums();






    //Attatch eventlistener to play ,previous and next button
    playon.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            playon.src = "img/pause.svg";
        }
        else {
            currentsong.pause();
            playon.src = "img/playsong.svg";
        }
    });

    //Listen for time update event
    currentsong.addEventListener("timeupdate", () => {


        let duration = currentsong.duration || 0;
        let currentTime = currentsong.currentTime || 0;
        // if (isNaN(duration)) {
        //     duration = 0;
        //     currentTime = 0;
        // }
        document.querySelector(".songtime").innerHTML = `${formatTime(currentTime)} / ${formatTime(duration)}`;

        //console.log(document.querySelector(".songtime").innerHTML);

        // Get seekbar and circle elements
        let seekbar = document.querySelector(".seekbar");
        let circle = document.querySelector(".circle");

        // Get dimensions
        let seekbarWidth = seekbar.offsetWidth;
        let circleWidth = circle.offsetWidth;

        // Calculate the left position of the circle (ensuring it stays within bounds)
        let percentage = (currentTime / duration);
        let newLeft = percentage * (seekbarWidth - circleWidth);

        // Apply new position
        circle.style.left = newLeft + "px";
    });


    // Add event listener to the seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let duration = currentsong.duration;
        let seekbar = document.querySelector(".seekbar");
        let circle = document.querySelector(".circle");

        // Calculate seek time based on click position
        let seekTime = (e.offsetX / seekbar.offsetWidth) * duration;
        currentsong.currentTime = seekTime;

        // Move circle to clicked position
        let seekbarWidth = seekbar.offsetWidth;
        let circleWidth = circle.offsetWidth;
        let newLeft = (e.offsetX / seekbarWidth) * (seekbarWidth - circleWidth);

        circle.style.left = newLeft + "px";
    });

    // Add event listener to the hamberger
    document.querySelector(".hamberger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add event listener to the close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%";
    });

    //Add event listener to previous and next
    previous.addEventListener("click", () => {
        currentsong.pause()
        //console.log("Previous clicked")


        let currentSongPath = currentsong.src.split("/").slice(-1)[0];
        // We use slice(-4) to match the structure of songs array



        // Find the index in the songs array
        let indx = songs.indexOf(currentSongPath);



        if (indx === -1) {
            console.error("Error: Current song not found in the songs array!");
        }


        if ((indx - 1) >= 0) {
            indx = indx - 1
            playMusic(songs[indx]);
        }
        else

            playMusic(songs[(songs.length) - 1]);
    });
    next.addEventListener("click", () => {
        currentsong.pause();


        let currentSongPath = currentsong.src.split("/").slice(-1)[0];
        // We use slice(-4) to match the structure of songs array


        // Find the index in the songs array
        let indx = songs.indexOf(currentSongPath);



        if (indx === -1) {
            console.error("Error: Current song not found in the songs array!");
        }


        if ((indx + 1) < songs.length) {
            indx = indx + 1
            playMusic(songs[indx]);

        }
        else
            playMusic(songs[0]);

    });

    //Add event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {

        currentsong.volume = parseInt(e.target.value) / 100


    });

    //Add event listener to mute the track
    document.querySelector(".volume > img").addEventListener("click",e=>{
        

        if(e.target.src.includes("volume.svg")){
            e.target.src= e.target.src.replace("volume.svg","mute.svg");
            currentsong.volume=0; 
            volcontrol.value=0
            
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg");
            currentsong.volume=.50
            volcontrol.value=50
        }
            
    })






}
main();


