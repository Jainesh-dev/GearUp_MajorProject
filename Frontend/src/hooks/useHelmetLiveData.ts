import { useEffect, useState } from "react";
import { getHelmetData } from "../lib/api";

export function useHelmetLiveData(helmetId: string) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;

    const load = async () => {
      try {
        const result = await getHelmetData(helmetId);

        if (!stopped) {
          setData(result);
          setError(null);
        }
      } catch {
        if (!stopped) {
          setError("Backend connection failed");
        }
      }
    };

    load();

    // Update every 3 seconds
    const timer = setInterval(load, 3000);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [helmetId]);

  return { data, error };
}