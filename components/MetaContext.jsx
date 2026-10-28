"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const Ctx = createContext({ meta: {}, configured: false, load: () => {} });

// Holds posters and trailer ids fetched from /api/meta, so any component can read them.
export function MetaProvider({ children }) {
  const [meta, setMeta] = useState({});
  const [configured, setConfigured] = useState(null);
  const asked = useRef(new Set());

  const load = useCallback((ids) => {
    const need = ids.filter((id) => !asked.current.has(id));
    if (!need.length) return;
    need.forEach((id) => asked.current.add(id));
    fetch(`/api/meta?ids=${need.join(",")}`)
      .then((r) => r.json())
      .then((d) => {
        setConfigured(d.configured);
        if (d.meta) setMeta((m) => ({ ...m, ...d.meta }));
        // Anything the server could not resolve can be asked for again later.
        need.forEach((id) => { if (!d.meta?.[id]) asked.current.delete(id); });
      })
      .catch(() => need.forEach((id) => asked.current.delete(id)));
  }, []);

  const value = useMemo(() => ({ meta, configured, load }), [meta, configured, load]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useMetaStore = () => useContext(Ctx);
export const useMovieMeta = (id) => useContext(Ctx).meta[id] || null;
