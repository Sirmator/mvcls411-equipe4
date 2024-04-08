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
];

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
    if (!currentSession) {
        initializeApiOnly();
        document.getElementById("connectButton").style.color = "green";
        document.getElementById('connectButton').style.border = 'solid #66b239 2px';
        console.time('VolumeTest');
        console.time('PauseTest');
    } else {
        currentSession = null;
        currentMediaSession = null;
        document.getElementById("connectButton").style.color = "";
        alert("Chromecast killed");
        location.reload();
    }
});

let isMuted = false;
document.getElementById('muteBtn').addEventListener('click', () => {
    if (currentSession) {
        let readableVolume = Math.round(currentSession.receiver.volume.level * 25);
        if (isMuted) {
            isMuted = false;
            currentSession.setReceiverMuted(isMuted, onMediaCommandSuccess, onError);
            document.getElementById('currentVolume').value = readableVolume;
            document.getElementById('volumeValue').innerHTML = "Current volume: " + readableVolume;
            showUnmuted();
        } else {
            isMuted = true;
            currentSession.setReceiverMuted(isMuted, onMediaCommandSuccess, onError);
            document.getElementById('currentVolume').value = 0;
            document.getElementById('volumeValue').innerHTML = "Current volume: Muted";
            showMuted();
        }
    }
});
 
document.getElementById('volUp').addEventListener('click', () => {
    if (currentSession) {
        if (currentSession.receiver.volume.level < 1) {
            currentSession.setReceiverVolumeLevel(currentSession.receiver.volume.level += 0.04, onMediaCommandSuccess, onError);
            isMuted = false;
            showUnmuted();
            console.log(currentSession.receiver.volume.level)
            let readableVolume = Math.round(currentSession.receiver.volume.level * 25);
            document.getElementById('currentVolume').value = readableVolume;
            document.getElementById('volumeValue').innerHTML = "Current volume: " + readableVolume;
            if (readableVolume == 23) {
                console.timeEnd('VolumeTest');
            }
        }
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});
 
document.getElementById('volDown').addEventListener('click', () => {
    if (currentSession) {
        if (currentSession.receiver.volume.level > 0) {
            currentSession.setReceiverVolumeLevel(currentSession.receiver.volume.level -= 0.04, onMediaCommandSuccess, onError);
            isMuted = false;
            showUnmuted();
            console.log(currentSession.receiver.volume.level)
            let readableVolume = Math.round(currentSession.receiver.volume.level * 25);
            document.getElementById('currentVolume').value = readableVolume;
            document.getElementById('volumeValue').innerHTML = "Current volume: " + readableVolume;
        }
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

function showUnmuted() {
    document.getElementById('muted').style.display = 'none';
    document.getElementById('unmuted').style.display = 'block';
}

function showMuted() {
    document.getElementById('muted').style.display = 'block';
    document.getElementById('unmuted').style.display = 'none';
}

document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentSession) {
        if (currentVideoIndex == 0) {
            currentVideoIndex = 0;
        } else {
            currentVideoIndex = (currentVideoIndex - 1) % videoList.length;
        }
        loadMedia(videoList[currentVideoIndex]);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentSession) {
        if (currentVideoIndex == videoList.length -1) {
            currentVideoIndex = videoList.length -1;
        } else {
            currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
        }
        loadMedia(videoList[currentVideoIndex]);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

document.getElementById('playBtn').addEventListener('click', () => {
    if (currentMediaSession) {
        if (isPlaying) {
            currentMediaSession.pause(null, onMediaCommandSuccess, onError);
            showPlaying();
        } else {
            currentMediaSession.play(null, onMediaCommandSuccess, onError);
            showPaused();
            console.timeEnd('PauseTest');
        }
        isPlaying = !isPlaying;
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

function showPlaying() {
    document.getElementById("play").style.display = "block";
    document.getElementById('pause').style.display = 'none';
} 

function showPaused() {
    document.getElementById("play").style.display = "none";
    document.getElementById('pause').style.display = 'block';
}

document.getElementById('forward').addEventListener('click', () => {
    if (currentMediaSession) {
        const futureSeekTime = currentMediaSession.getEstimatedTime() + 15;
        const seekRequest = new chrome.cast.media.SeekRequest();
        seekRequest.currentTime = futureSeekTime;
        currentMediaSession.seek(seekRequest, onMediaCommandSuccess, onError);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

document.getElementById('backward').addEventListener('click', () => {
    if (currentMediaSession) {
        const seekTime = Math.max(0, currentMediaSession.getEstimatedTime() - 15);
        const seekRequest = new chrome.cast.media.SeekRequest();
        seekRequest.currentTime = seekTime;
        currentMediaSession.seek(seekRequest, onMediaCommandSuccess, onError);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

 function sessionListener(newSession) {
    currentSession = newSession;
    loadMedia(videoList[currentVideoIndex]);
    currentSession.setReceiverVolumeLevel(0.4, onMediaCommandSuccess, onError);
    document.getElementById('volumeValue').innerHTML = "Current volume: 10";
    document.getElementById('currentVolume').value = 10;
    showPaused();
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