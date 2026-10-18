
import { useEffect, useState } from "react";
import { getHelmetData, type HelmetData } from "../lib/api";

export function useHelmetLiveData(helmetId: string) {
  const [data, setData] = useState<HelmetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stopped = false;

    const load = async () => {
      try {
        const result = await getHelmetData(helmetId);

        if (!stopped) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!stopped) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to fetch helmet data."
          );
        }
      } finally {
        if (!stopped) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    load();

    // Refresh readings every 3 seconds.
    const timer = setInterval(load, 3000);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [helmetId]);

  return { data, error, loading };
}
