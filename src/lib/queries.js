import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { useAuth } from './auth';

export const usePrograms = () =>
  useQuery({ queryKey: ['programs'], queryFn: () => api.get('/api/programs') });

export const useProgram = (id) =>
  useQuery({ queryKey: ['programs', id], queryFn: () => api.get(`/api/programs/${id}`), enabled: Boolean(id) });

export function useSaveProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => (id ? api.put(`/api/programs/${id}`, payload) : api.post('/api/programs', payload)),
    onSuccess: (plan) => {
      qc.invalidateQueries({ queryKey: ['programs'] });
      qc.setQueryData(['programs', plan._id], plan);
    },
  });
}

export function useDeleteProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.del(`/api/programs/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['programs'] });
      const prev = qc.getQueryData(['programs']);
      qc.setQueryData(['programs'], (list = []) => list.filter((p) => p._id !== id));
      return { prev };
    },
    onError: (_e, _id, ctx) => qc.setQueryData(['programs'], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['programs'] }),
  });
}

export const useLogs = (from, to = from) =>
  useQuery({
    queryKey: ['logs', from, to],
    queryFn: () => api.get(`/api/nutrition/logs?from=${from}&to=${to}`).then((r) => r.logs),
  });

export function useLogMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ date, meal }) => api.post('/api/nutrition/logs', { date, meal }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['logs'] }),
  });
}

export function useDeleteMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, mealId }) => api.del(`/api/nutrition/logs/${logId}/meals/${mealId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['logs'] }),
  });
}

export function useSaveMetrics() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: (metrics) => api.put('/api/profile', metrics).then((r) => r.user),
    onSuccess: (user) => setUser(user),
  });
}

/** True when the user has filled in enough body metrics for targets to exist. */
export const hasTargets = (user) => Boolean(user?.dailyCalorieNeeds);
