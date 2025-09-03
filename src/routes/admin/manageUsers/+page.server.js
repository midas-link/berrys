export const prerender = false;

export const actions = {
  verify: async ({ request, fetch }) => {
    const form = await request.formData();
    const selectedUserIds = form.getAll('selectedUserIds');
    if (!selectedUserIds || selectedUserIds.length === 0) {
      return { ok: false, message: 'Please select at least one user to verify.', refresh: false };
    }

    try {
      const res = await fetch('/api/admin/verifyUsers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ selectedUserIds })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, message: data.error || 'Verification failed.', refresh: false };
      }
      return { ok: true, message: data.message || 'Users verified successfully!', refresh: true };
    } catch (e) {
      return { ok: false, message: e?.message || 'Server error.', refresh: false };
    }
  },

  unverify: async ({ request, fetch }) => {
    const form = await request.formData();
    const selectedUserIds = form.getAll('selectedUserIds');
    if (!selectedUserIds || selectedUserIds.length === 0) {
      return { ok: false, message: 'Please select at least one user to unverify.', refresh: false };
    }

    try {
      // If your backend uses a different endpoint, update this URL accordingly:
      const res = await fetch('/api/admin/unverifyUsers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ selectedUserIds })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, message: data.error || 'Unverification failed.', refresh: false };
      }
      return { ok: true, message: data.message || 'Users unverified successfully!', refresh: true };
    } catch (e) {
      return { ok: false, message: e?.message || 'Server error.', refresh: false };
    }
  }
};