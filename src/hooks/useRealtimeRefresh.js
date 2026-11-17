import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// Live updates from entity subscriptions, so command delivery shows up without
// waiting for the next poll.
export default function useRealtimeRefresh(queryKeys, entities = ["AnimationCommand", "RegisteredDevice"]) {
  const queryClient = useQueryClient();
  const signature = JSON.stringify(queryKeys) + entities.join(",");

  useEffect(() => {
    const unsubscribes = entities.map((name) =>
      base44.entities[name].subscribe(() => {
        queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      })
    );
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
}