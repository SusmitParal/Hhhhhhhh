import { SpatialMode, Song } from '../types';

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private pannerNode: PannerNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private eqNodes: BiquadFilterNode[] = [];
  
  private audioElement: HTMLAudioElement;
  private animationFrameId: number | null = null;
  
  // Spatial config
  private currentMode: SpatialMode = 'off';

  // Callbacks for Media Session Actions
  private actionHandlers: {
      onPlay?: () => void;
      onPause?: () => void;
      onNext?: () => void;
      onPrev?: () => void;
  } = {};
  
  constructor() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = "anonymous"; // Needed for Visualizer/EQ
    
    // Error handling: If CORS fails, retry without CORS so user still hears audio
    this.audioElement.onerror = (e) => {
        const src = this.audioElement.src;
        if (this.audioElement.crossOrigin === "anonymous" && src) {
            console.warn("Audio CORS failed. Retrying in playback-only mode (No Visualizer).");
            this.audioElement.crossOrigin = null; // Remove CORS requirement
            this.audioElement.src = src;
            this.audioElement.play().catch(err => console.error("Retry playback failed", err));
        }
    };

    this.initMediaSession();
  }

  // --- MEDIA SESSION API ---
  private initMediaSession() {
      if ('mediaSession' in navigator) {
          navigator.mediaSession.setActionHandler('play', () => {
              this.play();
              this.actionHandlers.onPlay?.();
          });
          navigator.mediaSession.setActionHandler('pause', () => {
              this.pause();
              this.actionHandlers.onPause?.();
          });
          navigator.mediaSession.setActionHandler('previoustrack', () => {
              this.actionHandlers.onPrev?.();
          });
          navigator.mediaSession.setActionHandler('nexttrack', () => {
              this.actionHandlers.onNext?.();
          });
          navigator.mediaSession.setActionHandler('seekto', (details) => {
              if (details.seekTime !== undefined) {
                  this.seek(details.seekTime);
              }
          });
      }
  }

  setMediaSessionHandlers(handlers: { onPlay: () => void, onPause: () => void, onPrev: () => void, onNext: () => void }) {
      this.actionHandlers = handlers;
  }

  updateMediaSession(song: Song) {
      if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
              title: song.title,
              artist: song.artist,
              album: song.album,
              artwork: [
                  { src: song.coverUrl, sizes: '96x96', type: 'image/jpeg' },
                  { src: song.coverUrl, sizes: '128x128', type: 'image/jpeg' },
                  { src: song.coverUrl, sizes: '192x192', type: 'image/jpeg' },
                  { src: song.coverUrl, sizes: '256x256', type: 'image/jpeg' },
                  { src: song.coverUrl, sizes: '384x384', type: 'image/jpeg' },
                  { src: song.coverUrl, sizes: '512x512', type: 'image/jpeg' },
              ]
          });
      }
  }

  init() {
    if (this.audioContext) return;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass();
    
    // Create Nodes
    try {
        this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
    } catch (e) {
        console.warn("Could not create MediaElementSource (likely CORS). Visualizer will be disabled.");
    }

    this.gainNode = this.audioContext.createGain();
    this.pannerNode = this.audioContext.createPanner();
    this.analyserNode = this.audioContext.createAnalyser();
    
    // Config Panner
    this.pannerNode.panningModel = 'HRTF'; // High quality spatialization
    this.pannerNode.distanceModel = 'inverse';
    
    // Config Analyser
    this.analyserNode.fftSize = 256;

    // Create 6-band EQ
    const eqFreqs = [60, 200, 500, 1000, 4000, 10000];
    
    this.eqNodes = eqFreqs.map(freq => {
      const node = this.audioContext!.createBiquadFilter();
      node.type = 'peaking';
      node.frequency.value = freq;
      node.Q.value = 1;
      return node;
    });

    // Connect Chain
    if (this.sourceNode) {
        let currentNode: AudioNode = this.sourceNode;
        
        // Connect EQs in series
        this.eqNodes.forEach(node => {
        currentNode.connect(node);
        currentNode = node;
        });

        currentNode.connect(this.pannerNode);
        this.pannerNode.connect(this.gainNode);
        this.gainNode.connect(this.analyserNode);
        this.analyserNode.connect(this.audioContext.destination);
    }

    this.startSpatialLoop();
  }

  async loadTrack(url: string) {
    // SMART TRANSITION:
    // If audio is currently playing and hasn't ended naturally, fade it out smoothly.
    // If it ended naturally, start next one immediately.
    
    if (this.audioContext && this.gainNode && !this.audioElement.paused && !this.audioElement.ended) {
         try {
             // Quick Fade Out (200ms)
             const currTime = this.audioContext.currentTime;
             this.gainNode.gain.cancelScheduledValues(currTime);
             this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currTime);
             this.gainNode.gain.linearRampToValueAtTime(0.01, currTime + 0.2);
             
             // Wait for fade
             await new Promise(r => setTimeout(r, 200));
         } catch (e) {
             // Ignore fade errors
         }
    }

    if (!this.audioContext) this.init();
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    // Reset volume/gain for new track
    if (this.gainNode && this.audioContext) {
        this.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
        this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    }

    // Reset to anonymous for each new track to try and get Visualizer working
    this.audioElement.crossOrigin = "anonymous";
    this.audioElement.src = url;
    this.audioElement.load();
  }

  play() {
    if (!this.audioContext) this.init();
    this.audioContext?.resume();
    return this.audioElement.play();
  }

  pause() {
    this.audioElement.pause();
  }

  setVolume(value: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
    this.audioElement.volume = value; // Redundant backup
  }

  seek(time: number) {
    if (isFinite(time)) {
        this.audioElement.currentTime = time;
    }
  }

  get currentTime() {
    return this.audioElement.currentTime;
  }

  get duration() {
    return this.audioElement.duration || 0;
  }

  setSpatialMode(mode: SpatialMode) {
    this.currentMode = mode;
    if (mode === 'off' && this.pannerNode) {
      this.pannerNode.positionX.value = 0;
      this.pannerNode.positionY.value = 0;
      this.pannerNode.positionZ.value = 0;
    }
  }

  setEQBand(index: number, gain: number) {
    if (this.eqNodes[index]) {
      this.eqNodes[index].gain.value = gain;
    }
  }

  getAnalyser() {
    return this.analyserNode;
  }

  private startSpatialLoop() {
    const loop = () => {
      if (this.currentMode !== 'off' && this.pannerNode && this.audioContext && !this.audioElement.paused) {
        const time = this.audioContext.currentTime;
        
        let x = 0, y = 0, z = 0;
        
        // 8D: Simple Circle around head
        // 16D: Circle + moving up and down slightly (Helix)
        // 32D: Faster, wider, more chaotic
        
        if (this.currentMode === '8d') {
          // Period of ~8 seconds
          const speed = 0.8; 
          x = Math.sin(time * speed) * 3; // 3 units away
          z = Math.cos(time * speed) * 3; 
          y = 0;
        } else if (this.currentMode === '16d') {
           const speed = 1.2;
           x = Math.sin(time * speed) * 5;
           z = Math.cos(time * speed) * 5;
           y = Math.sin(time * 0.5) * 2; // Up and down
        } else if (this.currentMode === '32d') {
           const speed = 2.0;
           x = Math.sin(time * speed) * 8;
           z = Math.cos(time * speed * 1.1) * 8; // Slightly out of phase for chaos
           y = Math.cos(time * 1.5) * 4;
        }

        // Apply position
        if (this.pannerNode.positionX) {
             this.pannerNode.positionX.value = x;
             this.pannerNode.positionY.value = y;
             this.pannerNode.positionZ.value = z;
        }
      }
      
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  // Events
  onTimeUpdate(callback: () => void) {
    this.audioElement.addEventListener('timeupdate', callback);
  }
  
  onEnded(callback: () => void) {
    this.audioElement.addEventListener('ended', callback);
  }
}

export const audioEngine = new AudioEngine();