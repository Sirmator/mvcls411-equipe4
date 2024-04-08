let currentSession;
let currentMediaSession;
let isPlaying = true;
let currentVideoIndex = 0;
let currentVideoUrl;
let updateInterval;
const seekSlider = document.getElementById('seekSlider');
const currentTimeElement = document.getElementById('currentTime');
const totalTimeElement = document.getElementById('totalTime');
const defaultContentType = 'video/mp4';
const videoList = [
    'https://transfertco.ca/video/DBillPrelude.mp4',
    'https://transfertco.ca/video/DBillSpotted.mp4',
    'https://transfertco.ca/video/usa23_7_02.mp4',
    'https://chromecast-project.s3.us-east-2.amazonaws.com/Rick+Astley+-+Never+Gonna+Give+You+Up+(Official+Music+Video).mp4'

];
let currentVolume = 0.48
//let currentVolume = parseFloat(currentSession.receiver.volume.level);

// QuerySelector collects the className of the given ID 
// theme = > i 
const themeToggle = document.getElementById('theme');
const btn = document.getElementById('btn');
const icon = document.querySelector('#theme i');
const bouton = document.querySelector('#btn i');

themeToggle.addEventListener('click', function() {
    const currentTheme = document.body.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-bs-theme', newTheme);

    if (newTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');

    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

document.getElementById('connectButton').addEventListener('click', () => {
    initializeApiOnly();
    document.getElementById("connectButton").style.backgroundColor = "green"
    document.getElementById("connect").style.color = "white"
});

let isMuted = false;
document.getElementById('muteBtn').addEventListener('click', () => {
    if (currentSession) {
        isMuted = !isMuted;
        currentSession.setReceiverMuted(isMuted, onMediaCommandSuccess, onError);
    }
});
 
document.getElementById('volUp').addEventListener('click', () => {
    if(!currentSession){
        alert('Connectez-vous sur chromecast en premier')
        return
    }
    if (currentVolume < 1) {
        currentVolume += 0.04
        currentSession.setReceiverVolumeLevel(currentVolume, onMediaCommandSuccess, onError);
        document.getElementById('currentVolume').innerHTML = parseInt(currentVolume * 25)
        console.log(currentVolume)
    } else {
        alert("Volume maximum de 25 déja atteint");
    }
});
 
document.getElementById('volDown').addEventListener('click', () => {
    if(!currentSession){
        alert('Connectez-vous sur chromecast en premier')
        return
    }
    if (currentVolume > 0) {
        currentVolume -= 0.04
        currentSession.setReceiverVolumeLevel(currentVolume, onMediaCommandSuccess, onError);
        document.getElementById('currentVolume').innerHTML = parseInt(currentVolume * 25)
    } else {
        alert("Volume minimum de 0 déja atteint");
    }
});



document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentSession) {
        currentVideoIndex = (currentVideoIndex - 1) % videoList.length;
        loadMedia(videoList[currentVideoIndex]);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentSession) {
        currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
        loadMedia(videoList[currentVideoIndex]);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

document.getElementById('playBtn').addEventListener('click', () => {
    if(currentMediaSession){
        if (isPlaying) {
            currentMediaSession.pause(null, onMediaCommandSuccess, onError);
            document.getElementById('playBtn').innerHTML = '<i class="fa-solid fa-pause"></i>'
        } else {
            currentMediaSession.play(null, onMediaCommandSuccess, onError);
            document.getElementById('playBtn').innerHTML = '<i class="fa-solid fa-play"></i>'
        }
        isPlaying = !isPlaying;
    }
});

document.getElementById('forward').addEventListener('click', () => {
    if (currentMediaSession) {
        const futureSeekTime = currentMediaSession.getEstimatedTime() + 15;
        const seekRequest = new chrome.cast.media.SeekRequest();
        seekRequest.currentTime = futureSeekTime;
        currentMediaSession.seek(seekRequest, onMediaCommandSuccess, onError);
    }
});

document.getElementById('backward').addEventListener('click', () => {
    if (currentMediaSession) {
        const seekTime = Math.max(0, currentMediaSession.getEstimatedTime() - 15);
        const seekRequest = new chrome.cast.media.SeekRequest();
        seekRequest.currentTime = seekTime;
        currentMediaSession.seek(seekRequest, onMediaCommandSuccess, onError);
    }
});

 function sessionListener(newSession) {
     currentSession = newSession;
    loadMedia(videoList[currentVideoIndex]);

}



function setCurrentMediaSession(remotePlayerController, mediaSession) {
    currentMediaSession = mediaSession;
    document.getElementById('playBtn').style.display = 'block';
    setInitialVolume()
}


function setInitialVolume(){
    currentVolume = currentSession.receiver.volume.level;
    document.getElementById('currentVolume').innerHTML = parseInt(currentVolume * 25)
}

function receiverListener(availability) {
    if (availability === chrome.cast.ReceiverAvailability.AVAILABLE) {
        document.getElementById('connectButton').style.display = 'block';
    } else {
        document.getElementById('connectButton').style.display = 'none';
    }
}

function onInitSuccess() {
    console.log('Chromecast init success');
}

function onError(error) {
    console.error('Chromecast initialization error', error);
}

function onMediaCommandSuccess() {
    console.log('Media command success');
}

function initializeApiOnly() {
    
    
    const sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);    
    const apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);

    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
}

function loadMedia(videoUrl) {
    currentVideoUrl = videoUrl;
    const mediaInfo = new chrome.cast.media.MediaInfo(videoUrl, defaultContentType);
    const request = new chrome.cast.media.LoadRequest(mediaInfo);
    const remotePlayer = new cast.framework.RemotePlayer();
    const remotePlayerController = new cast.framework.RemotePlayerController(remotePlayer);

    currentSession.loadMedia(request, mediaSession => {
        console.log('Media chargé avec succès');
     setCurrentMediaSession(remotePlayerController, mediaSession);
        
      }, onError);
}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
 

 


// document.getElementById('currentVolume').innerHTML = currentVolume * 25


// document.getElementById('prevBtn').addEventListener('click', () => {
//     if (currentSession) {
//         currentVideoIndex = (currentVideoIndex - 1) % videoList.length;
//         loadMedia(videoList[currentVideoIndex]);
//     } else {
//         alert('Connectez-vous sur chromecast en premier');
//     }
// });

// document.getElementById('nextBtn').addEventListener('click', () => {
//     if (currentSession) {
//         currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
//         loadMedia(videoList[currentVideoIndex]);
//     } else {
//         alert('Connectez-vous sur chromecast en premier');
//     }
// });

// document.getElementById('playBtn').addEventListener('click', () => {
//     // if(currentMediaSession){
//     //     if (true) {
//     //         currentMediaSession.pause(null, onMediaCommandSuccess, onError);
//     //         document.getElementById('playBtn').innerHTML = '<i class="fa-solid fa-pause"></i>'
//     //     } else {
//     //         currentMediaSession.play(null, onMediaCommandSuccess, onError);
//     //         document.getElementById('playBtn').innerHTML = '<i class="fa-solid fa-play"></i>'
//     //     }
//     //     isPlaying = !isPlaying;
//     // }
//     if (currentMediaSession) {
//         if (isPlaying) {
//             currentMediaSession.pause(null, onMediaCommandSuccess, onError);
//         } else {
//             currentMediaSession.play(null, onMediaCommandSuccess, onError);
//         }
//         isPlaying = !isPlaying;
//     }
// });

// // document.getElementById('forward').addEventListener('click', () => {
// //     if (currentMediaSession) {
// //         const futureSeekTime = currentMediaSession.getEstimatedTime() + 15;
// //         const seekRequest = new chrome.cast.media.SeekRequest();
// //         seekRequest.currentTime = futureSeekTime;
// //         currentMediaSession.seek(seekRequest, onMediaCommandSuccess, onError);
// //     }
// // });

// // document.getElementById('backward').addEventListener('click', () => {
// //     if (currentMediaSession) {
// //         const seekTime = Math.max(0, currentMediaSession.getEstimatedTime() - 15);
// //         const seekRequest = new chrome.cast.media.SeekRequest();
// //         seekRequest.currentTime = seekTime;
// //         currentMediaSession.seek(seekRequest, onMediaCommandSuccess, onError);
// //     }
// // });

//  function sessionListener(newSession) {
//      currentSession = newSession;
//     loadMedia(videoList[currentVideoIndex]);

// }


// function setCurrentMediaSession(remotePlayerController, mediaSession) {
//     currentMediaSession = mediaSession;
//     document.getElementById('playBtn').style.display = 'block';
//  }

// function receiverListener(availability) {
//     if (availability === chrome.cast.ReceiverAvailability.AVAILABLE) {
//         document.getElementById('connectButton').style.color = 'green';
//     } else {
//         document.getElementById('connectButton').style.color = 'red';
//     }
// }

// function onInitSuccess() {
//     console.log('Chromecast init success');
// }

// function onError(error) {
//     console.error('Chromecast initialization error', error);
// }

// function onMediaCommandSuccess() {
//     console.log('Media command success');
// }

// function initializeApiOnly() {
    
    
//     const sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);    
//     const apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);

//     chrome.cast.initialize(apiConfig, onInitSuccess, onError);
// }

// function loadMedia(videoUrl) {
//     currentVideoUrl = videoUrl;
//     const mediaInfo = new chrome.cast.media.MediaInfo(videoUrl, defaultContentType);
//     const request = new chrome.cast.media.LoadRequest(mediaInfo);
//     const remotePlayer = new cast.framework.RemotePlayer();
//     const remotePlayerController = new cast.framework.RemotePlayerController(remotePlayer);

//     currentSession.loadMedia(request, mediaSession => {
//         console.log('Media chargé avec succès');
//         setCurrentMediaSession(remotePlayerController, mediaSession);
//       }, onError);
// }

// function formatTime(timeInSeconds) {
//     const minutes = Math.floor(timeInSeconds / 60);
//     const seconds = Math.floor(timeInSeconds % 60);
//     return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
// }