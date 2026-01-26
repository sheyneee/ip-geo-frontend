import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/layout/Header";
import GeoMap from "../components/ui/GeoMap";

const isValidIPv4 = (ip) => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;
  return ip.split(".").every((part) => {
    const n = Number(part);
    return Number.isInteger(n) && n >= 0 && n <= 255;
  });
};

const safeText = (v) => (v === null || v === undefined || v === "" ? "---" : String(v));

const ipinfo = axios.create({
  baseURL: import.meta.env.VITE_IPINFO_BASE_URL || "https://ipinfo.io",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

const normalizeIpInfo = (data) => {
  const [latStr, lonStr] = String(data?.loc || "").split(",");
  const lat = latStr ? Number(latStr) : null;
  const lon = lonStr ? Number(lonStr) : null;

  return {
    ip: data?.ip || "---",
    country: data?.country || "---",
    city: data?.city || "---",
    region: data?.region || "---",
    timezone: data?.timezone || "---",
    org: data?.org || "---",
    latitude: Number.isFinite(lat) ? lat : null,
    longitude: Number.isFinite(lon) ? lon : null,
  };
};

const Home = () => {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  const [ipInput, setIpInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [userGeo, setUserGeo] = useState(null);      // geo of the logged user (the one accessing the app)
  const [geo, setGeo] = useState(null);              // current displayed geo
  const [history, setHistory] = useState([]);        // { ip, country, city, timestamp }
  const [selectedIps, setSelectedIps] = useState(() => new Set());

  const abortRef = useRef(null);

  const fetchGeo = async (ipOrEmpty = "") => {
    setError("");
    setLoading(true);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const path = ipOrEmpty ? `/${encodeURIComponent(ipOrEmpty)}/geo` : `/geo`;
      const res = await ipinfo.get(path, { signal: controller.signal });

      const normalized = normalizeIpInfo(res.data);

      setGeo(normalized);
      if (!ipOrEmpty && !userGeo) setUserGeo(normalized);
      if (ipOrEmpty) {
        setHistory((prev) => {
          const exists = prev.some((h) => h.ip === normalized.ip);
          if (exists) return prev;

          const next = [
            {
              ip: normalized.ip,
              country: normalized.country,
              city: normalized.city,
              timestamp: new Date().toISOString(),
            },
            ...prev,
          ];
          return next.slice(0, 50);
        });
      }
    } catch (e) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;

      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to fetch geolocation data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // On page open, display geo of the logged user (the one accessing the app)
    fetchGeo("");
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = useMemo(() => {
    const lat = geo?.latitude;
    const lon = geo?.longitude;

    return [
      { label: "IP Address", value: safeText(geo?.ip), mono: true },
      { label: "Country", value: safeText(geo?.country) },
      { label: "City", value: safeText(geo?.city) },
      { label: "Region", value: safeText(geo?.region) },
      { label: "Timezone", value: safeText(geo?.timezone) },
      { label: "ISP / Org", value: safeText(geo?.org), small: true },
      { label: "Latitude", value: lat === null || lat === undefined ? "---" : Number(lat).toFixed(4), mono: true },
      { label: "Longitude", value: lon === null || lon === undefined ? "---" : Number(lon).toFixed(4), mono: true },
    ];
  }, [geo]);

  const locString = useMemo(() => {
    if (geo?.latitude == null || geo?.longitude == null) return "";
    return `${geo.latitude},${geo.longitude}`;
  }, [geo?.latitude, geo?.longitude]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const ip = ipInput.trim();
    if (!ip) return setError("Please enter an IP address.");
    if (!isValidIPv4(ip)) return setError("Please enter a valid IPv4 address.");

    await fetchGeo(ip);
  };

  const handleClear = async () => {
    setError("");
    setIpInput("");

    // revert to logged user by re-calling /geo (not by reusing an old stored IP)
    await fetchGeo("");
  };

  const toggleSelected = (ip) => {
    setSelectedIps((prev) => {
      const next = new Set(prev);
      if (next.has(ip)) next.delete(ip);
      else next.add(ip);
      return next;
    });
  };

  const clearSelected = () => setSelectedIps(new Set());

  const deleteSelected = () => {
    if (selectedIps.size === 0) return;

    setHistory((prev) => prev.filter((h) => !selectedIps.has(h.ip)));
    clearSelected();
  };


  return (
    <div className="min-h-screen gradient-bg overflow-auto">
      <main className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Header
            title="IP Geolocation"
            subtitle="View your current IP details or search any IP address"
          />

          {/* Search */}
          <div className="card-glass rounded-2xl p-6 mb-8">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="sr-only" htmlFor="ipInput">IP Address</label>

                <input
                  id="ipInput"
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  className="search-input w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white outline-none font-mono"
                  placeholder="Enter IP address (e.g., 8.8.8.8)"
                  disabled={loading}
                />

                {error && (
                  <div className="mt-2 text-red-200 text-sm">
                    {error}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
              >
                {loading ? "Searching..." : "Search"}
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="px-6 py-3 rounded-xl font-semibold text-white bg-white/20 hover:bg-white/25 transition disabled:opacity-60"
              >
                Clear
              </button>
            </form>

            {/* Optional helper line */}
            {userGeo?.ip && (
              <p className="text-white/60 text-xs mt-3">
                Current user IP detected: <span className="font-mono">{userGeo.ip}</span>
              </p>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="card-glass rounded-2xl p-8 mb-8">
              <div className="shimmer h-8 rounded mb-4"></div>
              <div className="shimmer h-6 rounded mb-3"></div>
              <div className="shimmer h-6 rounded"></div>
            </div>
          )}

          {/* Geo cards */}
          <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 ${loading ? "opacity-50" : ""}`}>
            {cards.map((c) => (
              <div key={c.label} className="info-card card-glass rounded-2xl p-6">
                <h3 className="text-white/70 text-sm font-semibold mb-3">{c.label}</h3>
                <p className={`${c.mono ? "font-mono" : ""} ${c.small ? "text-base" : "text-xl"} text-white font-bold`}>
                  {c.value}
                </p>
              </div>
            ))}
          </div>

          <GeoMap
        loc={locString}
        title={geo?.ip ? `Map for ${geo.ip}` : "Location Map"}
      />

      {/* History */}
      <div className="card-glass rounded-2xl p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center justify-between md:justify-start gap-4">
            <h2 className="text-2xl font-bold text-white">Search History</h2>
            <span className="text-white/70 text-sm">
              {history.length} item{history.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-white font-semibold bg-white/15 hover:bg-white/20 transition"
              onClick={() => {
                if (history.length === 0) return;
                setSelectedIps(new Set(history.map((h) => h.ip)));
              }}
              disabled={history.length === 0}
            >
              Select all
            </button>

            <button
              type="button"
              className="px-4 py-2 rounded-xl text-white font-semibold bg-white/15 hover:bg-white/20 transition"
              onClick={clearSelected}
              disabled={selectedIps.size === 0}
            >
              Clear selection
            </button>

            <button
              type="button"
              className="px-4 py-2 rounded-xl text-white font-semibold bg-red-500/80 hover:bg-red-500 transition disabled:opacity-60"
              onClick={deleteSelected}
              disabled={selectedIps.size === 0}
            >
              Delete selected ({selectedIps.size})
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="text-white/70 text-center py-8">No search history yet</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => {
              const checked = selectedIps.has(h.ip);

              return (
                <div
                  key={h.ip}
                  className="history-item w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded"
                      style={{ accentColor: "#667eea" }}
                      checked={checked}
                      onChange={() => toggleSelected(h.ip)}
                    />

                    <button
                      type="button"
                      onClick={() => fetchGeo(h.ip)}
                      className="text-left"
                    >
                      <p className="text-white font-semibold font-mono">{h.ip}</p>
                      <p className="text-white/70 text-sm">
                        {safeText(h.city)}, {safeText(h.country)}
                      </p>
                    </button>
                  </div>

                  <span className="text-white/50 text-xs">
                    {new Date(h.timestamp).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
