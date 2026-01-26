import React, { useMemo } from "react";

function parseLoc(loc) {
  if (!loc) return null;
  const [latStr, lonStr] = String(loc).split(",");
  const lat = Number(latStr);
  const lon = Number(lonStr);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

export default function GeoMap({ loc, title = "Location Map" }) {
  const coords = useMemo(() => parseLoc(loc), [loc]);

  if (!coords) {
    return (
      <div className="card-glass rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/70">No location coordinates yet.</p>
      </div>
    );
  }

  const { lat, lon } = coords;
  const delta = 0.05;
  const left = lon - delta;
  const bottom = lat - delta;
  const right = lon + delta;
  const top = lat + delta;

  const embedUrl =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${encodeURIComponent(`${left},${bottom},${right},${top}`)}` +
    `&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}`;

  const openUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`;

  return (
    <div className="card-glass rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-white/70 text-sm">
            {lat.toFixed(4)}, {lon.toFixed(4)}
          </p>
        </div>

        <a
          href={openUrl}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl text-white font-semibold bg-white/15 hover:bg-white/20 transition"
        >
          Open in OSM
        </a>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/10">
        <iframe
          title="ip-map"
          src={embedUrl}
          className="w-full"
          style={{ height: 360 }}
          loading="lazy"
        />
      </div>
    </div>
  );
}
