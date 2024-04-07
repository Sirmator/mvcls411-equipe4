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

const themeToggle = document.getElementById('theme');
const icon = document.querySelector('#theme i');

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

const gaugeElement = document.querySelector(".gauge");
function setGaugeValue(gauge, value) {
if (value < 0 || value > 1) {
    return;
}

gauge.querySelector(".gauge__fill").style.transform = `rotate(${
    value / 2
}turn)`;
gauge.querySelector(".gauge__cover").textContent = `${Math.round(
    value * 100
)}%`;
}
let currentVolume = 1.0; 
let isMuted = false;
document.getElementById('muteBtn').addEventListener('click', () => {
    if (currentSession) {
        isMuted = !isMuted;
        if (isMuted) {
            previousVolume = currentVolume; 
            currentVolume = 0; 
        } else {
            currentVolume = previousVolume; 
        }
        currentSession.setReceiverMuted(isMuted, onMediaCommandSuccess, onError);
        setGaugeValue(gaugeElement, isMuted ? 0 : currentVolume); // Réglez la jauge à 0 si muet, sinon à la valeur actuelle du volume

       
        const muteIcon = document.querySelector('#muteBtn i');
        if (isMuted) {
            muteIcon.classList.add('fa-volume-xmark');
            muteIcon.classList.remove('fa-volume-high');
        } else {
            muteIcon.classList.add('fa-volume-high');
            muteIcon.classList.remove('fa-volume-xmark');
        }
    }
});



document.getElementById('volDown').addEventListener('click', () => {
    if (currentSession) {
        if (isMuted) {
        
            isMuted = false;
            const muteIcon = document.querySelector('#muteBtn i');
            muteIcon.classList.remove('fa-volume-xmark');
            muteIcon.classList.add('fa-volume-high');
            console.log("Valeur du volume actuelle : ", currentVolume);
            currentSession.setReceiverMuted(false, onMediaCommandSuccess, onError);
        } else {
            currentVolume = Math.max(currentVolume - 0.1, 0.0); 
            currentSession.setReceiverVolumeLevel(currentVolume, onMediaCommandSuccess, onError);
            console.log("Valeur du volume actuelle : ", currentVolume);
            setGaugeValue(gaugeElement, currentVolume);
        }
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

document.getElementById('volUp').addEventListener('click', () => {
    if (currentSession) {
        if (isMuted) {
        
            isMuted = false;
            const muteIcon = document.querySelector('#muteBtn i');
            muteIcon.classList.remove('fa-volume-xmark');
            muteIcon.classList.add('fa-volume-high');
            currentSession.setReceiverMuted(false, onMediaCommandSuccess, onError);
        } else {
        
            currentVolume = Math.min(currentVolume + 0.1, 1.0); 
            currentSession.setReceiverVolumeLevel(currentVolume, onMediaCommandSuccess, onError);
            console.log("Valeur du volume actuelle : ", currentVolume);
            setGaugeValue(gaugeElement, currentVolume);
        }
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
    }
});

document.getElementById('forward').addEventListener('click', () => {
    if (currentSession) {
        currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
        loadMedia(videoList[currentVideoIndex]);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

document.getElementById('backward').addEventListener('click', () => {
    console.log(currentSession)
    if (currentSession) {
        currentVideoIndex = (currentVideoIndex - 1) % videoList.length;
        loadMedia(videoList[currentVideoIndex]);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

function sessionListener(newSession) {
    currentSession = newSession;
    loadMedia(videoList[currentVideoIndex]);
}

function initializeSeekSlider(remotePlayerController, mediaSession) {
    currentMediaSession = mediaSession;
    document.getElementById('playBtn').style.display = 'block';
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

