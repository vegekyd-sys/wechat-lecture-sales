class PcmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    this._bufferSize = 2048;
  }

  process(inputs) {
    const input = inputs[0][0];
    if (!input) return true;

    // Accumulate samples
    for (let i = 0; i < input.length; i++) {
      this._buffer.push(input[i]);
    }

    // When we have enough, send a chunk
    while (this._buffer.length >= this._bufferSize) {
      const chunk = this._buffer.splice(0, this._bufferSize);
      const pcm16 = new Int16Array(chunk.length);
      for (let i = 0; i < chunk.length; i++) {
        pcm16[i] = Math.max(-32768, Math.min(32767, Math.round(chunk[i] * 32767)));
      }
      this.port.postMessage({ pcm: pcm16.buffer }, [pcm16.buffer]);
    }

    return true;
  }
}

registerProcessor('pcm-processor', PcmProcessor);
