import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/utils/cn";
import { PRESENTERS } from "@/deck/ui";

interface RemoteModalProps {
  room: string;
  isOpen: boolean;
  onClose: () => void;
  connectedPeers: string[];
  isMqttConnected: boolean;
}

export function RemoteModal({
  room,
  isOpen,
  onClose,
  connectedPeers,
  isMqttConnected,
}: RemoteModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Compute remote URL based on current location
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const remoteUrl = `${currentOrigin}${currentPath}?remote#room=${room}`;

  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(
      remoteUrl,
      {
        width: 320,
        margin: 2,
        color: {
          dark: "#080808",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [remoteUrl, isOpen]);

  const copyUrl = () => {
    navigator.clipboard?.writeText(remoteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6 backdrop-blur-md"
      role="dialog"
      aria-label="Mobile Remote Pairing"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[820px] border-4 border-ink bg-paper p-8 text-ink shadow-[16px_16px_0px_#084BC5] transition-all">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="focus-ring absolute right-6 top-6 border-2 border-ink px-4 py-1 font-display text-[14px] font-bold uppercase tracking-wider hover:bg-ink hover:text-paper"
        >
          Close ✕ (Esc)
        </button>

        {/* Header */}
        <div className="border-b-2 border-ink pb-4">
          <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-cobalt">
            Swiss Editorial · Topic #33
          </div>
          <h2 className="mt-1 font-display text-[38px] font-black uppercase leading-none tracking-[-0.03em]">
            Mobile Speaker Notes & Remote
          </h2>
          <p className="mt-2 text-[16px] text-ink/75">
            Scan this QR code with any smartphone to view live speaker notes and control slides during the presentation.
          </p>
        </div>

        {/* Content Body */}
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left: QR Code Card */}
          <div className="flex flex-col items-center justify-center border-2 border-ink bg-white p-6 text-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code to connect smartphone remote"
                className="h-[220px] w-[220px] object-contain shadow-sm"
              />
            ) : (
              <div className="flex h-[220px] w-[220px] items-center justify-center bg-paper text-mute">
                Generating QR...
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <span
                className={cn(
                  "inline-block h-3 w-3 rounded-full",
                  isMqttConnected
                    ? "bg-[#10b981] shadow-[0_0_8px_#10b981]"
                    : "bg-[#f59e0b] animate-pulse"
                )}
              />
              <span className="text-[12px] font-bold uppercase tracking-wider">
                {isMqttConnected ? "Cloud Sync Active" : "Local Sync Only"}
              </span>
              <span className="rounded bg-ink px-2 py-0.5 text-[11px] font-mono font-bold text-paper">
                #{room}
              </span>
            </div>
          </div>

          {/* Right: Pairing Info & Team Status */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-mute">
                Direct Pairing URL
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={remoteUrl}
                  className="flex-1 border-2 border-ink bg-sheet px-3 py-2 font-mono text-[13px] text-ink select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyUrl}
                  className="border-2 border-ink bg-cobalt px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-paper hover:brightness-110 active:scale-95"
                >
                  {copied ? "Copied! ✓" : "Copy"}
                </button>
              </div>

              {/* Connected Peers Status */}
              <div className="mt-5 border-2 border-dashed border-ink/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-mute">
                    Connected Phones:
                  </span>
                  <span
                    className={cn(
                      "font-display text-[13px] font-extrabold uppercase",
                      connectedPeers.length > 0 ? "text-cobalt" : "text-ink/60"
                    )}
                  >
                    {connectedPeers.length > 0
                      ? `🟢 ${connectedPeers.length} Phone${connectedPeers.length > 1 ? "s" : ""} Paired`
                      : "🟡 Waiting for scan..."}
                  </span>
                </div>
                {connectedPeers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {connectedPeers.map((peer, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-ink px-2 py-0.5 text-[11px] font-mono text-paper"
                      >
                        {peer}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Speakers list */}
              <div className="mt-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-mute">
                  Assigned Team Presenters
                </div>
                <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 text-[12px]">
                  {PRESENTERS.map((p, i) => (
                    <div key={p.id} className="text-ink/80">
                      <span className="font-mono text-cobalt font-bold">Act 0{i + 1}:</span> {p.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop test link */}
            <div className="mt-6 pt-4 border-t border-rule flex items-center justify-between">
              <a
                href={remoteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] font-bold uppercase tracking-wider text-cobalt hover:underline"
              >
                Open Remote in New Tab ↗
              </a>
              <span className="text-[11px] text-mute uppercase font-semibold">
                Press [M] anytime to toggle
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
