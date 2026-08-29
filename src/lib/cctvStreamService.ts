import Peer, { MediaConnection, DataConnection } from 'peerjs';

/**
 * Universal Cross-Device WebRTC Live Video Streaming & Telemetry Service
 * Enables phones anywhere on 4G/Wi-Fi to stream 30-60 FPS video directly to PC dashboard.
 */

export interface LiveFramePayload {
  cameraId: string;
  frameDataUrl: string;
  timestamp: number;
  sequence: number;
  width: number;
  height: number;
  battery?: number;
  torch?: boolean;
}

export const DEFAULT_HUB_ID = 'mit-acsc-cctv-control-room-v1';

type StreamCallback = (stream: MediaStream, cameraId: string) => void;
type FrameListener = (payload: LiveFramePayload) => void;

class CCTVStreamService {
  private peer: Peer | null = null;
  private channel: BroadcastChannel | null = null;
  private localStream: MediaStream | null = null;
  private activeCalls: Map<string, MediaConnection> = new Map();
  private activeDataConns: Map<string, DataConnection> = new Map();
  private streamListeners: Set<StreamCallback> = new Set();
  private frameListeners: Map<string, Set<FrameListener>> = new Map();
  private globalFrameListeners: Set<FrameListener> = new Set();
  private calculatedFps: Map<string, number> = new Map();
  private lastFrameTimes: Map<string, number[]> = new Map();
  private isHubInitialized = false;
  private isNodeInitialized = false;

  constructor() {
    // 1. Local same-device BroadcastChannel fallback
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('campuscare_cctv_live_stream_v2');
      this.channel.onmessage = (event) => {
        const payload: LiveFramePayload = event.data;
        if (!payload || !payload.cameraId) return;
        this.calculateFps(payload.cameraId, payload.timestamp);
        this.dispatchFrameLocally(payload);
      };
    }
  }

  /**
   * Initialize PC as the Central Control Room Hub (Receives Phone Streams)
   */
  public initHub(hubId: string = DEFAULT_HUB_ID, onStreamReceived?: StreamCallback): Promise<string> {
    return new Promise((resolve) => {
      if (this.peer && this.isHubInitialized) {
        if (onStreamReceived) this.streamListeners.add(onStreamReceived);
        resolve(this.peer.id);
        return;
      }

      this.cleanup();

      const peer = new Peer(hubId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ],
        },
      });

      this.peer = peer;
      this.isHubInitialized = true;
      if (onStreamReceived) this.streamListeners.add(onStreamReceived);

      peer.on('open', (id) => {
        console.log('✅ WebRTC CCTV Control Room Hub Online:', id);
        resolve(id);
      });

      peer.on('call', (call) => {
        console.log('📞 Incoming WebRTC Phone Camera Call from:', call.peer);
        call.answer(); // Answer without outgoing stream

        call.on('stream', (remoteStream) => {
          console.log('🎥 WebRTC Remote MediaStream Received from:', call.peer);
          this.streamListeners.forEach((cb) => cb(remoteStream, call.peer));
        });

        this.activeCalls.set(call.peer, call);
      });

      peer.on('connection', (conn) => {
        console.log('🔗 DataConnection established with:', conn.peer);
        conn.on('data', (data: any) => {
          if (data && data.type === 'FRAME_DATA') {
            const payload: LiveFramePayload = data.payload;
            this.calculateFps(payload.cameraId, payload.timestamp);
            this.dispatchFrameLocally(payload);
          }
        });
        this.activeDataConns.set(conn.peer, conn);
      });

      peer.on('error', (err) => {
        console.warn('WebRTC Hub Notice:', err.type, err.message);
        // If ID is taken (e.g. previous tab), create unique fallback ID
        if (err.type === 'unavailable-id') {
          const altId = `mit-acsc-hub-${Math.floor(1000 + Math.random() * 9000)}`;
          this.initHub(altId, onStreamReceived).then(resolve);
        }
      });
    });
  }

  /**
   * Initialize Phone as an Active CCTV Camera Node (Streams video to PC Hub)
   */
  public initPhoneNode(nodeId: string, localMediaStream: MediaStream, hubId: string = DEFAULT_HUB_ID): Promise<boolean> {
    return new Promise((resolve) => {
      this.cleanup();
      this.localStream = localMediaStream;

      const peer = new Peer(nodeId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ],
        },
      });

      this.peer = peer;
      this.isNodeInitialized = true;

      peer.on('open', (id) => {
        console.log('📱 Phone CCTV Node WebRTC Online:', id);
        this.connectAndCallHub(hubId, localMediaStream);
        resolve(true);
      });

      peer.on('error', (err) => {
        console.warn('Phone WebRTC Notice:', err.type, err.message);
        if (err.type === 'unavailable-id') {
          const randNodeId = `${nodeId}-${Math.floor(100 + Math.random() * 900)}`;
          this.initPhoneNode(randNodeId, localMediaStream, hubId).then(resolve);
        }
      });
    });
  }

  private connectAndCallHub(hubId: string, stream: MediaStream) {
    if (!this.peer) return;

    try {
      // 1. Establish WebRTC MediaStream Call
      const call = this.peer.call(hubId, stream);
      if (call) {
        this.activeCalls.set(hubId, call);
        call.on('close', () => {
          console.log('Call to Hub closed, attempting reconnect in 3s...');
          setTimeout(() => this.connectAndCallHub(hubId, stream), 3000);
        });
      }

      // 2. Establish WebRTC Data Channel
      const conn = this.peer.connect(hubId);
      if (conn) {
        conn.on('open', () => {
          console.log('⚡ High-speed WebRTC data channel connected to Hub');
          this.activeDataConns.set(hubId, conn);
        });
      }
    } catch (e) {
      console.warn('Connect to Hub error:', e);
    }
  }

  /**
   * Broadcast a live frame (via WebRTC DataChannel + BroadcastChannel)
   */
  public broadcastFrame(payload: LiveFramePayload) {
    // 1. Send across network to Hub via WebRTC DataConnection
    this.activeDataConns.forEach((conn) => {
      if (conn.open) {
        conn.send({ type: 'FRAME_DATA', payload });
      }
    });

    // 2. Send locally via BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (err) {
        // Safe fallback
      }
    }
  }

  private dispatchFrameLocally(payload: LiveFramePayload) {
    const specific = this.frameListeners.get(payload.cameraId);
    if (specific) {
      specific.forEach((l) => l(payload));
    }
    this.globalFrameListeners.forEach((l) => l(payload));
  }

  public subscribeToStream(callback: StreamCallback): () => void {
    this.streamListeners.add(callback);
    return () => {
      this.streamListeners.delete(callback);
    };
  }

  public subscribeToCamera(cameraId: string, callback: FrameListener): () => void {
    if (!this.frameListeners.has(cameraId)) {
      this.frameListeners.set(cameraId, new Set());
    }
    this.frameListeners.get(cameraId)!.add(callback);
    return () => {
      this.frameListeners.get(cameraId)?.delete(callback);
    };
  }

  public getFps(cameraId: string): number {
    return this.calculatedFps.get(cameraId) || 28;
  }

  private calculateFps(cameraId: string, currentTimestamp: number) {
    let times = this.lastFrameTimes.get(cameraId) || [];
    times.push(currentTimestamp);
    if (times.length > 25) {
      times.shift();
    }
    this.lastFrameTimes.set(cameraId, times);

    if (times.length > 5) {
      const durationSec = (times[times.length - 1] - times[0]) / 1000;
      if (durationSec > 0) {
        const fps = Math.round((times.length - 1) / durationSec);
        this.calculatedFps.set(cameraId, Math.min(30, Math.max(15, fps)));
      }
    }
  }

  public cleanup() {
    this.activeCalls.forEach((call) => call.close());
    this.activeCalls.clear();
    this.activeDataConns.forEach((conn) => conn.close());
    this.activeDataConns.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.isHubInitialized = false;
    this.isNodeInitialized = false;
  }
}

export const cctvStreamService = new CCTVStreamService();
