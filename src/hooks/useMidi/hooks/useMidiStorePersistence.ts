import { MidiStoreExport } from '@hooks/useMidi/types';
import { VOKeys } from '@model/constants';
import { loadMidiStore, saveMidiStore } from '@model/db/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useMidiStorePersistence = () => {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: VOKeys.midiStore(),
    queryFn: () => loadMidiStore()
  });

  const { mutate: saveMidiStoreExport } = useMutation({
    mutationFn: (data: MidiStoreExport) => saveMidiStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOKeys.midiStore() });
    }
  });

  const updatedAt = data?.updatedAt ?? null;

  return {
    midiStoreExport: data,
    saveMidiStoreExport,
    updatedAt
  };
};
