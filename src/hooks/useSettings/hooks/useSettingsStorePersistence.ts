import { VOKeys } from '@model/constants';
import { loadSettingsStore, saveSettingsStore } from '@model/db/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SettingsStoreExport } from '../types';

export const useSettingsStorePersistence = (settingsId: string = 'default') => {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: VOKeys.settings(settingsId),
    queryFn: () => loadSettingsStore(settingsId)
  });

  const { mutate: saveSettingsStoreExport } = useMutation({
    mutationFn: (data: SettingsStoreExport) => saveSettingsStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOKeys.settings(settingsId) });
    }
  });

  const updatedAt = data?.updatedAt ?? null;

  return {
    settingsStoreExport: data,
    saveSettingsStoreExport,
    updatedAt
  };
};
