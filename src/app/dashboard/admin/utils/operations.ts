export const ADMIN_STORAGE_KEYS = {
  tutorQueue: 'admin_tutor_queue_v1',
  adQueue: 'admin_ad_queue_v1',
  settings: 'admin_settings_v1',
  audit: 'admin_audit_v1',
} as const;

export type AdminAuditItem = {
  id: string;
  action: string;
  detail: string;
  actor: string;
  createdAt: string;
};

export function loadStoredState<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveStoredState<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function downloadFile(fileName: string, text: string, mimeType: string): void {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function appendAudit(action: string, detail: string, actor = 'Admin'): void {
  const existing = loadStoredState<AdminAuditItem[]>(ADMIN_STORAGE_KEYS.audit, []);
  const next: AdminAuditItem[] = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      action,
      detail,
      actor,
      createdAt: new Date().toISOString(),
    },
    ...existing,
  ].slice(0, 300);

  saveStoredState(ADMIN_STORAGE_KEYS.audit, next);
}

export function getAuditTrail(): AdminAuditItem[] {
  return loadStoredState<AdminAuditItem[]>(ADMIN_STORAGE_KEYS.audit, []);
}
