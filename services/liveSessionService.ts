import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

export interface LiveSessionCallbacks {
  onOpen: () => void;
  onTranscription: (text: string, isFinal: boolean) => void;
  onError: (error: Error) => void;
  onClose: () => void;
  onVolumeChange: (volume: number) => void;
}

export class LiveSessionService {
  private client: GoogleGenAI;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private sessionPromise: Promise<any> | null = null;
  private isActive = false;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  public async connect(callbacks: LiveSessionCallbacks) {
    try {
      this.isActive = true;
      // 1. Create Audio Context with 16kHz sample rate (preferred by Gemini)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000, 
      });

      // Ensure context is running (browsers sometimes suspend it)
      await this.audioContext.resume();

      // 2. Request high-quality audio with noise processing
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
        } 
      });
      
      this.sessionPromise = this.client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO], 
          inputAudioTranscription: {}, 
          // 3. Precise System Instruction
          systemInstruction: "You are a professional, verbatim transcriptionist. Your sole task is to accurately transcribe the speaker's presentation word-for-word. Capture technical terms accurately. Do not summarize. Do not reply to the content. Do not generate spoken audio responses, just listen and transcribe.",
        },
        callbacks: {
          onopen: () => {
            console.log('Live session connected');
            callbacks.onOpen();
            this.startAudioStreaming();
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
               const text = message.serverContent.inputTranscription.text;
               if (text) {
                 callbacks.onTranscription(text, false); 
               }
            }
            if (message.serverContent?.turnComplete) {
               callbacks.onTranscription('', true);
            }
          },
          onerror: (e: any) => {
            console.error('Live session error', e);
            callbacks.onError(new Error("Connection error"));
          },
          onclose: () => {
            console.log('Live session closed');
            callbacks.onClose();
          }
        }
      });

      // Audio Analysis for Visualizer
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVolume = () => {
        if (!this.isActive) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for(let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        callbacks.onVolumeChange(average);
        requestAnimationFrame(updateVolume);
      };

      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.source.connect(analyser); 
      updateVolume();

    } catch (error) {
      console.error("Failed to start session", error);
      callbacks.onError(error instanceof Error ? error : new Error("Unknown error starting session"));
    }
  }

  private startAudioStreaming() {
    if (!this.audioContext || !this.mediaStream) return;

    // 4. Reduced buffer size to 2048 for lower latency (approx 128ms at 16k)
    this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createBlob(inputData);
      
      if (this.sessionPromise) {
        this.sessionPromise.then(session => {
           session.sendRealtimeInput({ media: pcmBlob });
        });
      }
    };

    if (this.source) {
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    }
  }

  public disconnect() {
    this.isActive = false;
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.sessionPromise) {
       this.sessionPromise.then(session => {
          try { (session as any).close(); } catch(e) {} 
       });
    }
    
    this.sessionPromise = null;
  }

  private createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      // 5. Clamping: Important to prevent integer overflow distortion for loud audio
      const clamped = Math.max(-1, Math.min(1, data[i]));
      int16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
    }
    return {
      data: this.encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
