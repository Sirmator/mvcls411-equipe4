
let currentSession;
let currentMediaSession;
let isPlaying = true;
let currentVideoIndex = 0;
let currentVideoUrl;
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
const volumeValue = document.querySelector('#volumeValue');

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
});
 
document.getElementById('volUp').addEventListener('click', () => {
    if (currentSession) {
        value = currentSession.receiver.volume.level += 0.1;
        formatVolume(value);
        currentSession.setReceiverVolumeLevel(value, onMediaCommandSuccess, onError);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});
 
document.getElementById('volDown').addEventListener('click', () => {
    if (currentSession) {
        value = currentSession.receiver.volume.level -= 0.1;
        formatVolume(value);
        currentSession.setReceiverVolumeLevel(value, onMediaCommandSuccess, onError);
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
        } else {
            currentMediaSession.play(null, onMediaCommandSuccess, onError);
        }
        isPlaying = !isPlaying;
        swapPlayPause();
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
    let cbtn = document.getElementById('connectButton');
    cbtn.classList.remove("btn-outline-secondary");
    cbtn.classList.remove("btn-outline-success");
    //cbtn.classList.remove('btn-outline-secondary');
}

function receiverListener(availability) {
    if (availability === chrome.cast.ReceiverAvailability.AVAILABLE) {
        ///
    } else {
        let cbtn = document.getElementById('connectButton');
        cbtn.classList.remove("btn-outline-secondary");
        cbtn.classList.add("btn-outline-danger");
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
    document.getElementById('connectButton').setAttribute('disabled', '');
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
      }, onError);
}

function swapPausePlay()
{
    if(isPlaying)
    {
        document.querySelector("i#playPauseIcon").classList.remove("fa-play");
        document.querySelector("i#playPauseIcon").classList.add("fa-pause");
    } else {
        document.querySelector("i#playPauseIcon").classList.add("fa-play");
        document.querySelector("i#playPauseIcon").classList.remove("fa-pause");
    }
}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatVolume(value)
{
    volumeValue.innerText = `${Math.max(Math.min((value,1),0)*100) | 0}%`;
}