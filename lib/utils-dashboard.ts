export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatUptime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${Math.floor(seconds % 60)}s`;
  return `${Math.floor(seconds)}s`;
};

export const getStatusColor = (status: string): string => {
  const lower = status.toLowerCase();
  if (lower.includes('scam') || lower.includes('fraud')) return 'text-red-500';
  if (lower.includes('verified') || lower.includes('safe')) return 'text-green-500';
  if (lower.includes('unknown') || lower.includes('unverified')) return 'text-yellow-500';
  return 'text-gray-400';
};

export const getStatusBgColor = (status: string): string => {
  const lower = status.toLowerCase();
  if (lower.includes('scam') || lower.includes('fraud')) return 'bg-red-500/20';
  if (lower.includes('verified') || lower.includes('safe')) return 'bg-green-500/20';
  if (lower.includes('unknown') || lower.includes('unverified')) return 'bg-yellow-500/20';
  return 'bg-gray-500/20';
};

export const truncateString = (str: string, length: number): string => {
  return str.length > length ? str.slice(0, length) + '...' : str;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};
