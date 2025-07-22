import { useState, useEffect } from "react";
import type * as WasmModule from "../wasm/wasm_lib";

export type WasmInstance = typeof WasmModule;

export const useWasm = () => {
  const [wasm, setWasm] = useState<WasmInstance | null>(null);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        const wasmModule = await import("../wasm/wasm_lib.js");
        await wasmModule.default();
        setWasm(wasmModule as WasmInstance);
      } catch (err) {
        console.error(`Failed to load WASM: ${err}`);
      } finally {
        console.log("Wasm loaded!");
      }
    };

    loadWasm();
  }, []);

  return wasm;
};
