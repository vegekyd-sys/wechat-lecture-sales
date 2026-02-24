class PlaybackProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Ring buffer: 4 seconds at 24kHz
    this._ring = new Float32Array(96000);
    this._writePos = 0;
    this._readPos = 0;
    this._count = 0;

    this.port.onmessage = (e) => {
      if (e.data === 'clear') {
        // Interruption: flush all buffered audio
        this._writePos = 0;
        this._readPos = 0;
        this._count = 0;
        return;
      }
      // e.data is Float32Array of PCM samples at context sample rate
      const samples = e.data;
      for (let i = 0; i < samples.length; i++) {
        if (this._count < this._ring.length) {
          this._ring[this._writePos] = samples[i];
          this._writePos = (this._writePos + 1) % this._ring.length;
          this._count++;
        }
      }
    };
  }

  process(inputs, outputs) {
    const output = outputs[0][0];
    if (!output) return true;

    for (let i = 0; i < output.length; i++) {
      if (this._count > 0) {
        output[i] = this._ring[this._readPos];
        this._readPos = (this._readPos + 1) % this._ring.length;
        this._count--;
      } else {
        output[i] = 0;
      }
    }
    return true;
  }
}

registerProcessor('playback-processor', PlaybackProcessor);
