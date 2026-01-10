let oneAudio = null;
let unlocked = false;

export function unlock() {
  if (unlocked) return;

  oneAudio = new Audio("/assets/one.mp3");
  oneAudio.preload = "auto";
  oneAudio.volume = 0.5;
  oneAudio.muted = false;

  // MUST be inside user gesture
  oneAudio
    .play()
    .then(() => {
      oneAudio.pause();
      oneAudio.currentTime = 0;
      unlocked = true;
      console.log("🔓 audio unlocked");
    })
    .catch(() => {
      console.warn("audio unlock blocked");
    });
}

export function playOne() {
  if (!oneAudio || !unlocked) {
    console.warn("audio not unlocked yet");
    return;
  }

  try {
    oneAudio.currentTime = 0;
    oneAudio.play();
  } catch (e) {
    console.warn("play failed", e);
  }
}

export function setMuted(flag) {
  if (oneAudio) oneAudio.muted = flag;
}

export function setVolume(vol) {
  if (oneAudio) oneAudio.volume = Math.max(0, Math.min(1, vol));
}
