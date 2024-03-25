
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
    if (currentSession) {
        currentSession.setReceiverVolumeLevel(0.4, onMediaCommandSuccess, onError);
    }
});

let isMuted = false;
document.getElementById('muteBtn').addEventListener('click', () => {
    if (currentSession) {
        isMuted = !isMuted;
        currentSession.setReceiverMuted(isMuted, onMediaCommandSuccess, onError);
    }
});
 
document.getElementById('volUp').addEventListener('click', () => {
    if (currentSession) {
        currentSession.setReceiverVolumeLevel(Math.round((currentSession.receiver.volume.level += 0.04) *100)/100, onMediaCommandSuccess, onError);
        console.log(currentSession.receiver.volume.level)
        let readableVolume = Math.round(currentSession.receiver.volume.level * 25);
        document.getElementById('currentVolume').value = readableVolume;
        document.getElementById('volumeValue').innerHTML = "Current volume: " + readableVolume;
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});
 
document.getElementById('volDown').addEventListener('click', () => {
    if (currentSession) {
        currentSession.setReceiverVolumeLevel(Math.round((currentSession.receiver.volume.level -= 0.04) *100)/100, onMediaCommandSuccess, onError);
        console.log(currentSession.receiver.volume.level)
        let readableVolume = Math.round(currentSession.receiver.volume.level * 25);
        document.getElementById('currentVolume').value = readableVolume;
        document.getElementById('volumeValue').innerHTML = "Current volume: " + readableVolume;
    } else {
        alert('Connectez-vous sur chromecast en premier');
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
    if (currentMediaSession) {
        if (isPlaying) {
            currentMediaSession.pause(null, onMediaCommandSuccess, onError);
            document.getElementById('pause').style.color = 'green';
            document.getElementById('play').style.color = '#333';
        } else {
            currentMediaSession.play(null, onMediaCommandSuccess, onError);
            document.getElementById('play').style.color = 'green';
            document.getElementById('pause').style.color = '#333';
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


function initializeSeekSlider(remotePlayerController, mediaSession) {
    currentMediaSession = mediaSession;
    document.getElementById('playBtn').style.display = 'block';
//    // Set max value of seek slider to media duration in seconds
//    seekSlider.max = mediaSession.media.duration;

//     // Update seek slider and time elements on time update
//     updateInterval = setInterval(() => {
//         const currentTime = mediaSession.getEstimatedTime();
//         const totalTime = mediaSession.media.duration;
  
//         seekSlider.value = currentTime;
//         currentTimeElement.textContent = formatTime(currentTime);
//         totalTimeElement.textContent = formatTime(totalTime);
//       }, 1000); //chaque 1000 ms... 1 sec
  
//       // slider change
//       seekSlider.addEventListener('input', () => {
//         const seekTime = parseFloat(seekSlider.value);
//         remotePlayerController.seek(seekTime);
    //   });
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
        initializeSeekSlider(remotePlayerController, mediaSession);
      }, onError);
}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}