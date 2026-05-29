import { useState, useEffect } from 'react';
import {
  Flame, Plus, X, RefreshCw, AlertCircle, Edit2
} from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { apiClient } from '@/lib/apiService';
import authAPI from '@/lib/authAPI';
import Swal from 'sweetalert2';

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-1 text-xs text-destructive mt-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-muted/50 ${className}`} />;
}

function GasConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeOnly, setActiveOnly] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({ gasType: '', quantity: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchConfigs(); }, [activeOnly]);

  const setAuth = () => {
    const token = authAPI.getStoredToken();
    if (token) apiClient.setAuthToken(token);
  };

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      setAuth();
      const url = activeOnly ? '/api/gas-config/?activeOnly=true' : '/api/gas-config/';
      const response = await apiClient.get(url);
      const data = response?.data ?? response;
      setConfigs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching gas configs:', err);
      setError('Failed to load gas configurations.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingConfig(null);
    setFormData({ gasType: '', quantity: '' });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (config) => {
    setEditingConfig(config);
    setFormData({ gasType: config.gasType, quantity: config.quantity != null ? String(config.quantity) : '' });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.gasType.trim()) {
      errors.gasType = 'Gas type is required';
    } else if (formData.gasType.trim().length < 2) {
      errors.gasType = 'Gas type must be at least 2 characters';
    }
    if (formData.quantity !== '' && (isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) < 0)) {
      errors.quantity = 'Quantity must be a non-negative number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      setAuth();
      const payload = {
        gasType: formData.gasType.trim(),
        ...(formData.quantity !== '' && { quantity: parseInt(formData.quantity) }),
      };
      if (editingConfig) {
        await apiClient.put(`/api/gas-config/${editingConfig.id}`, payload);
        await Swal.fire({ icon: 'success', title: 'Updated', text: 'Gas configuration updated.', timer: 1500, showConfirmButton: false });
      } else {
        await apiClient.post('/api/gas-config/', payload);
        await Swal.fire({ icon: 'success', title: 'Created', text: 'Gas type added successfully.', timer: 1500, showConfirmButton: false });
      }
      setShowModal(false);
      fetchConfigs();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Failed to save configuration.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFieldError = (field) =>
    setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  return (
    <PageWrapper title="Gas Configuration" description="Manage gas types and available quantities.">

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={activeOnly}
            onClick={() => setActiveOnly(p => !p)}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${activeOnly ? 'bg-primary' : 'bg-input'}`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-background shadow transition-transform ${activeOnly ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
          <span className="text-sm text-muted-foreground">Active only</span>
        </label>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Gas Type
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="hidden sm:grid sm:grid-cols-[64px_1fr_100px_100px_140px] items-center gap-4 px-4 py-3 bg-muted/40 border-b border-border">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">ID</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Gas Type</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">Quantity</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center">Status</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">Actions</span>
        </div>

        {error ? (
          <div className="flex items-center gap-3 m-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <button type="button" onClick={fetchConfigs} className="ml-auto text-xs text-primary hover:underline">Retry</button>
          </div>
        ) : loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : configs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 mb-3">
              <Flame className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No gas configurations found.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Click "Add Gas Type" to create one.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {configs.map(config => (
              <div
                key={config.id}
                className="flex flex-col sm:grid sm:grid-cols-[64px_1fr_100px_100px_140px] items-start sm:items-center gap-3 sm:gap-4 px-4 py-3 hover:bg-muted/20 transition-colors"
              >
                <span className="text-xs text-muted-foreground font-mono">#{config.id}</span>

                <span className="text-sm font-medium text-foreground">{config.gasType}</span>

                <span className="text-sm text-muted-foreground sm:text-right">
                  {config.quantity != null ? config.quantity : '—'}
                </span>

                <div className="flex sm:justify-center">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    config.active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {config.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-start sm:justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1.5 text-xs px-2.5"
                    onClick={() => openEditModal(config)}
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md bg-card rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {editingConfig ? 'Edit Gas Type' : 'Add Gas Type'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {editingConfig ? `Editing: ${editingConfig.gasType}` : 'Create a new gas configuration'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="gas-type">Gas Type <span className="text-destructive">*</span></Label>
                <Input
                  id="gas-type"
                  placeholder="e.g. LPG 12kg, Industrial Gas"
                  value={formData.gasType}
                  onChange={(e) => { setFormData(p => ({ ...p, gasType: e.target.value })); clearFieldError('gasType'); }}
                  className={formErrors.gasType ? 'border-destructive focus-visible:ring-destructive' : ''}
                  autoFocus
                />
                <FieldError message={formErrors.gasType} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gas-quantity">
                  Quantity
                  <span className="text-xs text-muted-foreground font-normal ml-1">(optional)</span>
                </Label>
                <Input
                  id="gas-quantity"
                  type="number"
                  min="0"
                  placeholder="e.g. 100"
                  value={formData.quantity}
                  onChange={(e) => { setFormData(p => ({ ...p, quantity: e.target.value })); clearFieldError('quantity'); }}
                  className={formErrors.quantity ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                <FieldError message={formErrors.quantity} />
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
                  {isSubmitting
                    ? <><RefreshCw className="h-4 w-4 animate-spin" />Saving…</>
                    : <><Plus className="h-4 w-4" />{editingConfig ? 'Save Changes' : 'Add Type'}</>
                  }
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

export default GasConfigPage;
