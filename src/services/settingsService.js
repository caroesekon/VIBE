import api from './api';

export const getPublicSettings = async () => {
  const response = await api.get('/settings/public');
  return response.data;
};

export const getAllSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

export const updateSettings = async (data) => {
  const response = await api.put('/admin/settings', data);
  return response.data;
};