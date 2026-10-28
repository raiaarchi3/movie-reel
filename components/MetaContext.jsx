// "use client";
// import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

// const Ctx = createContext({ meta: {}, configured: false, load: () => {} });

// // Holds posters and trailer ids fetched from /api/meta, so any component can read them.
// export function MetaProvider({ children }) {
//   const [meta, setMeta] = useState({});
//   const [configured, setConfigured] = useState(null);
//   const asked = useRef(new Set());

//   const load = useCallback((ids) => {
//     const need = ids.filter((id) => !asked.current.has(id));
//     if (!need.length) return;
//     need.forEach((id) => asked.current.add(id));
//     fetch(`/api/meta?ids=${need.join(",")}`)
//       .then((r) => r.json())
//       .then((d) => {
//         setConfigured(d.configured);
//         if (d.meta) setMeta((m) => ({ ...m, ...d.meta }));
//         // Anything the server could not resolve can be asked for again later.
//         need.forEach((id) => { if (!d.meta?.[id]) asked.current.delete(id); });
//       })
//       .catch(() => need.forEach((id) => asked.current.delete(id)));
//   }, []);

//   const value = useMemo(() => ({ meta, configured, load }), [meta, configured, load]);
//   return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
// }

// export const useMetaStore = () => useContext(Ctx);
// export const useMovieMeta = (id) => useContext(Ctx).meta[id] || null;
"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const Ctx = createContext({ meta: {}, configured: false, problem: "", load: () => {} });

// Holds posters and trailer ids fetched from /api/meta, so any component can read them.
export function MetaProvider({ children }) {
  const [meta, setMeta] = useState({});
  const [configured, setConfigured] = useState(null);
  const [problem, setProblem] = useState("");
  const asked = useRef(new Set());

  const load = useCallback((ids) => {
    const need = ids.filter((id) => !asked.current.has(id));
    if (!need.length) return;
    need.forEach((id) => asked.current.add(id));
    fetch(`/api/meta?ids=${need.join(",")}`)
      .then((r) => r.json())
      .then((d) => {
        setConfigured(d.configured);
        if (d.error) { console.warn("[meta]", d.error); setProblem(d.error); }
        else if (d.failed?.length && !Object.keys(d.meta || {}).length) setProblem("TMDB could not be reached from the server. Check the TMDB token and try again.");
        else setProblem("");
        if (d.meta) setMeta((m) => ({ ...m, ...d.meta }));
        // Anything the server could not resolve can be asked for again later.
        need.forEach((id) => { if (!d.meta?.[id]) asked.current.delete(id); });
      })
      .catch(() => {
        setProblem("The /api/meta route did not answer. Make sure app/api/meta/route.js is in the deployed code.");
        need.forEach((id) => asked.current.delete(id));
      });
  }, []);

  const value = useMemo(() => ({ meta, configured, problem, load }), [meta, configured, problem, load]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useMetaStore = () => useContext(Ctx);
export const useMovieMeta = (id) => useContext(Ctx).meta[id] || null;