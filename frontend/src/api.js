const BASE = "http://localhost:5000/api/contacts";
const SEQ_BASE = "http://localhost:5000/api/sequences";
const COMP_BASE = "http://localhost:5000/api/compliance";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  getContacts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`${BASE}?${qs}`);
  },

  filterContacts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`${BASE}/filter?${qs}`);
  },

  getContact: (id) => request(`${BASE}/${id}`),

  updateContact: (id, data) =>
    request(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  bulkUpdate: (ids, update) =>
    request(`${BASE}/bulk`, {
      method: "PATCH",
      body: JSON.stringify({ ids, update }),
    }),

  sendEmails: (contactIds, emailDraft = null) =>
    request(`${BASE}/emails/send`, {
      method: "POST",
      body: JSON.stringify({
        contactIds,
        ...(emailDraft && { customEmail: emailDraft })
      }),
    }),

  sendFollowups: (contactIds) =>
    request(`${BASE}/emails/followup`, {
      method: "POST",
      body: JSON.stringify({ contactIds }),
    }),

  getStats: () => request(`${BASE}/stats`),

  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data;
  },

  sequences: {
    initialize: (contactId, sequenceType) =>
      request(`${SEQ_BASE}/initialize`, {
        method: "POST",
        body: JSON.stringify({ contactId, sequenceType }),
      }),
    send: (contactId) =>
      request(`${SEQ_BASE}/${contactId}/send`, {
        method: "POST",
      }),
    pause: (contactId) =>
      request(`${SEQ_BASE}/${contactId}/pause`, {
        method: "POST",
      }),
    resume: (contactId) =>
      request(`${SEQ_BASE}/${contactId}/resume`, {
        method: "POST",
      }),
    status: (contactId) =>
      request(`${SEQ_BASE}/${contactId}/status`),
    health: async () => {
      const res = await request(`${SEQ_BASE}/health`);
      return res.health || res.data || res;
    },
    dueForEmail: async (type = null) => {
      const url = type ? `${SEQ_BASE}/due?type=${type}` : `${SEQ_BASE}/due`;
      const res = await request(url);
      return { data: res.data || res.contacts || [] };
    },
    runScheduled: (limit = 50) =>
      request(`${SEQ_BASE}/run-scheduled`, {
        method: "POST",
        body: JSON.stringify({ limit }),
      }),
    analytics: async (type = null) => {
      const url = type ? `${SEQ_BASE}/analytics?type=${type}` : `${SEQ_BASE}/analytics`;
      const res = await request(url);
      return res.data || res.analytics || res;
    },
  },

  compliance: {
    auditStats: (from = null) => {
      const url = from ? `${COMP_BASE}/audit-stats?from=${from}` : `${COMP_BASE}/audit-stats`;
      return request(url);
    },
    auditLog: (page = 1, limit = 50, filters = {}) => {
      const params = new URLSearchParams({ page, limit, ...filters }).toString();
      return request(`${COMP_BASE}/audit-log?${params}`);
    },
    suppression: (page = 1, limit = 50) =>
      request(`${COMP_BASE}/suppression?page=${page}&limit=${limit}`),
    addSuppression: (email, reason = "doNotContact") =>
      request(`${COMP_BASE}/suppression`, {
        method: "POST",
        body: JSON.stringify({ email, reason }),
      }),
    importSuppression: (emails) =>
      request(`${COMP_BASE}/suppression/import`, {
        method: "POST",
        body: JSON.stringify({ emails }),
      }),
    suppressionStats: () => request(`${COMP_BASE}/suppression/stats`),
    checkCompliance: (sequenceType) =>
      request(`${COMP_BASE}/check/${sequenceType}`),
    gdprExport: (contactId) => request(`${COMP_BASE}/gdpr/export/${contactId}`),
    verifyEmail: (email) =>
      request(`${COMP_BASE}/verify-email`, {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  },
};
