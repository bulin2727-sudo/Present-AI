import { useState, useRef, useEffect, useCallback } from 'react';

interface RecorderState {
  isRecording: boolean;
  transcript: string;
  volume: number;
  audioBlob: Blob | null;
  error: string | null;
}

export const useRecorder = () => {
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    transcript: '',
    volume: 0,
    audioBlob: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null); // Web Speech API
  const chunksRef = useRef<Blob[]>([]);
  // Fix: Initialize useRef with null to satisfy TypeScript "Expected 1 arguments, but got 0"
  const animationFrameRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 1. Setup MediaRecorder for backend file
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setState(prev => ({ ...prev, audioBlob: blob, isRecording: false }));
        // Stop all tracks
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // 2. Setup AudioContext for Visualizer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const updateVolume = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setState(prev => ({ ...prev, volume: avg }));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // 3. Setup Web Speech API for Real-time Transcript Preview
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // Default to English, could be configurable

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (finalTranscript) {
              setState(prev => ({ ...prev, transcript: prev.transcript + finalTranscript }));
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      setState(prev => ({ ...prev, isRecording: true, transcript: '', error: null, audioBlob: null }));

    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
  };
};