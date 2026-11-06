import mqtt, { type MqttClient } from "mqtt";

export interface RemoteState {
  index: number;
  step: number;
  blank: boolean;
  elapsed: number;
  room: string;
  ts: number;
}

export type RemoteCmd =
  | { type: "cmd"; cmd: "next" | "prev" | "blank" | "first" | "last" }
  | { type: "goto"; index: number; step?: number }
  | { type: "resetTimer" }
  | { type: "vote"; choice: "pow" | "pos" }
  | { type: "hello"; peer?: string }
  | { type: "ping" };

export interface SyncHandlers {
  onState?: (state: RemoteState) => void;
  onCmd?: (cmd: RemoteCmd) => void;
  onStatus?: (connected: boolean, broker: string) => void;
  onPeerJoin?: (peer: string) => void;
}

const BROKERS = [
  "wss://broker.emqx.io:8084/mqtt",
  "wss://broker.hivemq.com:8884/mqtt",
];

export class RemoteSync {
  private client: MqttClient | null = null;
  private bc: BroadcastChannel | null = null;
  private room: string;
  private isHost: boolean;
  private handlers: SyncHandlers = {};
  private brokerIndex = 0;
  private connected = false;

  constructor(room: string, isHost: boolean, handlers: SyncHandlers = {}) {
    this.room = room || "topic33";
    this.isHost = isHost;
    this.handlers = handlers;

    // 1. Same-device / local-tab sync via BroadcastChannel (zero-latency, offline safe)
    if (typeof BroadcastChannel !== "undefined") {
      try {
        this.bc = new BroadcastChannel(`bc-deck-${this.room}`);
        this.bc.onmessage = (ev) => {
          this.handleIncoming(ev.data);
        };
      } catch (err) {
        console.warn("BroadcastChannel not supported or blocked:", err);
      }
    }

    // 2. Internet / cross-device sync via public MQTT WSS broker
    this.connectMqtt();
  }

  private getTopic(sub: "cmd" | "state") {
    return `blockchain33/deck/${this.room}/${sub}`;
  }

  private connectMqtt() {
    const url = BROKERS[this.brokerIndex % BROKERS.length];
    const clientId = `bc_${this.isHost ? "pc" : "mob"}_${Math.random().toString(16).slice(2, 8)}`;

    try {
      this.client = mqtt.connect(url, {
        clientId,
        clean: true,
        connectTimeout: 7000,
        reconnectPeriod: 3000,
        keepalive: 30,
      });

      this.client.on("connect", () => {
        this.connected = true;
        this.handlers.onStatus?.(true, url);

        // Host listens for commands from mobile remotes
        // Mobile listens for state updates from host PC
        const topicToSub = this.isHost ? this.getTopic("cmd") : this.getTopic("state");
        this.client?.subscribe(topicToSub, { qos: 0 }, (err) => {
          if (err) console.error("Subscribe error:", err);
        });

        // Mobile announces itself upon connection
        if (!this.isHost) {
          this.sendCmd({ type: "hello", peer: navigator.userAgent.includes("iPhone") ? "iPhone" : "Mobile Phone" });
        }
      });

      this.client.on("message", (_topic, payload) => {
        try {
          const data = JSON.parse(payload.toString());
          this.handleIncoming(data);
        } catch (e) {
          console.error("Malformed MQTT message:", e);
        }
      });

      this.client.on("error", (err) => {
        console.warn("MQTT connection error:", err.message);
        this.connected = false;
        this.handlers.onStatus?.(false, url);
      });

      this.client.on("close", () => {
        this.connected = false;
        this.handlers.onStatus?.(false, url);
      });
    } catch (e) {
      console.error("Failed to initialize MQTT:", e);
      this.connected = false;
      this.handlers.onStatus?.(false, url);
    }
  }

  private handleIncoming(data: any) {
    if (!data || typeof data !== "object") return;

    if (this.isHost) {
      // Host receives commands from mobile
      if ("type" in data) {
        const cmd = data as RemoteCmd;
        if (cmd.type === "hello" && cmd.peer) {
          this.handlers.onPeerJoin?.(cmd.peer);
        }
        this.handlers.onCmd?.(cmd);
      }
    } else {
      // Mobile receives state from host
      if ("index" in data && "step" in data) {
        this.handlers.onState?.(data as RemoteState);
      }
    }
  }

  /** PC publishes live state to all mobile remotes */
  public sendState(state: Omit<RemoteState, "room" | "ts">) {
    const fullState: RemoteState = {
      ...state,
      room: this.room,
      ts: Date.now(),
    };

    // Broadcast locally
    try {
      this.bc?.postMessage(fullState);
    } catch (_) {}

    // Broadcast over MQTT
    if (this.client && this.connected) {
      try {
        this.client.publish(this.getTopic("state"), JSON.stringify(fullState), { qos: 0 });
      } catch (e) {
        console.warn("Failed to publish state over MQTT:", e);
      }
    }
  }

  /** Mobile publishes command to PC */
  public sendCmd(cmd: RemoteCmd) {
    // Broadcast locally
    try {
      this.bc?.postMessage(cmd);
    } catch (_) {}

    // Broadcast over MQTT
    if (this.client && this.connected) {
      try {
        this.client.publish(this.getTopic("cmd"), JSON.stringify(cmd), { qos: 0 });
      } catch (e) {
        console.warn("Failed to publish command over MQTT:", e);
      }
    }
  }

  public destroy() {
    try {
      this.bc?.close();
    } catch (_) {}
    try {
      this.client?.end(true);
    } catch (_) {}
  }
}

