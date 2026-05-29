import { useState, useEffect } from 'react';
import {
  Truck, Phone, MessageSquare, Plus, Minus, RefreshCw,
  AlertCircle, Flame, ClipboardList, ChevronDown, CheckCircle2
} from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { apiClient } from '@/lib/apiService';
import authAPI from '@/lib/authAPI';
import Swal from 'sweetalert2';

const UPDATE_STATUSES = ['DISPATCHED', 'CANCELLED'];

const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  DISPATCHED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-1 text-xs text-destructive mt-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

const emptyItem = () => ({ gasConfigId: '', quantity: '1' });

function GasDeliveryPage() {
  const [activeTab, setActiveTab] = useState('create');

  // Active gas configs for item selectors
  const [gasConfigs, setGasConfigs] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);

  // ── Create delivery state ──────────────────────────────────────
  const [createForm, setCreateForm] = useState({
    mobileNumber: '',
    customerRemarks: '',
    items: [emptyItem()],
  });
  const [createErrors, setCreateErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  // ── Deliveries list state ──────────────────────────────────────
  const [deliveries, setDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [deliveriesError, setDeliveriesError] = useState(null);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);

  // ── Update status state ────────────────────────────────────────
  const [statusForm, setStatusForm] = useState({
    deliveryId: '',
    status: 'DISPATCHED',
    adminRemarks: '',
    items: [],
  });
  const [statusErrors, setStatusErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => { fetchGasConfigs(); }, []);

  useEffect(() => {
    if (activeTab === 'status') fetchDeliveries();
  }, [activeTab]);

  const setAuth = () => {
    const token = authAPI.getStoredToken();
    if (token) apiClient.setAuthToken(token);
  };

  const fetchDeliveries = async () => {
    try {
      setLoadingDeliveries(true);
      setDeliveriesError(null);
      setAuth();
      const response = await apiClient.get('/api/gas-delivery/');
      const data = response?.data ?? response;
      setDeliveries(Array.isArray(data) ? data : []);
    } catch (err) {
      setDeliveriesError('Failed to load deliveries.');
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const isDeliveryLocked = (delivery) => delivery?.status === 'CANCELLED';

  const selectedDelivery = deliveries.find(d => d.id === selectedDeliveryId) ?? null;
  const canUpdateSelected = selectedDelivery && !isDeliveryLocked(selectedDelivery);

  const handleSelectDelivery = (delivery) => {
    if (isDeliveryLocked(delivery)) return;
    setSelectedDeliveryId(delivery.id);
    const preItems = Array.isArray(delivery.items) && delivery.items.length > 0
      ? delivery.items.map(i => ({ gasConfigId: String(i.gasConfigId ?? i.id ?? ''), quantity: String(i.quantity ?? 1) }))
      : [emptyItem()];
    setStatusForm(prev => ({
      ...prev,
      deliveryId: String(delivery.id),
      status: 'DISPATCHED',
      adminRemarks: '',
      items: preItems,
    }));
    setStatusErrors({});
  };

  const fetchGasConfigs = async () => {
    try {
      setLoadingConfigs(true);
      setAuth();
      const response = await apiClient.get('/api/gas-config/?activeOnly=true');
      const data = response?.data ?? response;
      setGasConfigs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching gas configs:', err);
    } finally {
      setLoadingConfigs(false);
    }
  };

  // ── Create delivery helpers ────────────────────────────────────
  const updateCreateItem = (index, field, value) => {
    setCreateForm(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
    clearError(setCreateErrors, `items.${index}.${field}`);
  };

  const addCreateItem = () =>
    setCreateForm(prev => ({ ...prev, items: [...prev.items, emptyItem()] }));

  const removeCreateItem = (index) =>
    setCreateForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

  const validateCreate = () => {
    const errors = {};
    if (!createForm.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{8}$/.test(createForm.mobileNumber.trim())) {
      errors.mobileNumber = 'Enter a valid 8-digit mobile number';
    }
    if (createForm.items.length === 0) {
      errors.items = 'At least one item is required';
    }
    createForm.items.forEach((item, i) => {
      if (!item.gasConfigId) errors[`items.${i}.gasConfigId`] = 'Select a gas type';
      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty < 1) errors[`items.${i}.quantity`] = 'Min quantity is 1';
    });
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateCreate()) return;
    setIsCreating(true);
    try {
      setAuth();
      const payload = {
        mobileNumber: createForm.mobileNumber.trim(),
        ...(createForm.customerRemarks.trim() && { customerRemarks: createForm.customerRemarks.trim() }),
        items: createForm.items.map(item => ({
          gasConfigId: parseInt(item.gasConfigId),
          quantity: parseInt(item.quantity),
        })),
      };
      const response = await apiClient.post('/api/gas-delivery/', payload);
      const deliveryId = response?.data?.id;
      await Swal.fire({
        icon: 'success',
        title: 'Delivery Created',
        text: deliveryId ? `Delivery #${deliveryId} created successfully.` : 'Gas delivery order created.',
        timer: 2000,
        showConfirmButton: false,
      });
      setCreateForm({ mobileNumber: '', customerRemarks: '', items: [emptyItem()] });
      setCreateErrors({});
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Failed to create delivery.' });
    } finally {
      setIsCreating(false);
    }
  };

  // ── Update status helpers ──────────────────────────────────────
  const updateStatusItem = (index, field, value) => {
    setStatusForm(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
    clearError(setStatusErrors, `items.${index}.${field}`);
  };

  const addStatusItem = () =>
    setStatusForm(prev => ({ ...prev, items: [...prev.items, emptyItem()] }));

  const removeStatusItem = (index) =>
    setStatusForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

  const validateStatus = () => {
    const errors = {};
    const id = parseInt(statusForm.deliveryId);
    if (!statusForm.deliveryId.trim()) errors.deliveryId = 'Delivery ID is required';
    else if (isNaN(id) || id < 1) errors.deliveryId = 'Enter a valid delivery ID';
    if (!statusForm.status) errors.status = 'Status is required';
    if (statusForm.status === 'DISPATCHED') {
      statusForm.items.forEach((item, i) => {
        const qty = parseInt(item.quantity);
        if (isNaN(qty) || qty < 1) errors[`items.${i}.quantity`] = 'Min quantity is 1';
      });
    }
    setStatusErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    const delivery = deliveries.find(d => String(d.id) === statusForm.deliveryId.trim());
    if (isDeliveryLocked(delivery)) {
      Swal.fire({
        icon: 'info',
        title: 'Cannot Update',
        text: 'Cancelled deliveries cannot be updated.',
      });
      return;
    }
    if (!validateStatus()) return;
    setIsUpdating(true);
    try {
      setAuth();
      const payload = {
        status: statusForm.status,
        adminRemarks: statusForm.adminRemarks.trim(),
        items: statusForm.status === 'DISPATCHED'
          ? statusForm.items.map(item => ({
              gasConfigId: parseInt(item.gasConfigId),
              quantity: parseInt(item.quantity),
            }))
          : [],
      };
      await apiClient.put(`/api/gas-delivery/${statusForm.deliveryId.trim()}/status`, payload);
      await Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Delivery #${statusForm.deliveryId} status set to ${statusForm.status}.`,
        timer: 2000,
        showConfirmButton: false,
      });
      setStatusForm({ deliveryId: '', status: 'DISPATCHED', adminRemarks: '', items: [] });
      setStatusErrors({});
      setSelectedDeliveryId(null);
      fetchDeliveries();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Failed to update delivery status.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const clearError = (setter, key) =>
    setter(prev => { const n = { ...prev }; delete n[key]; return n; });

  // ── Shared item row ────────────────────────────────────────────
  const ItemRow = ({ item, index, onUpdate, onRemove, errors, disableGasConfig = false }) => (
    <div className="flex items-start gap-2">
      <div className="flex-1 space-y-1">
        <div className="relative">
          <select
            value={item.gasConfigId}
            onChange={(e) => onUpdate(index, 'gasConfigId', e.target.value)}
            className={`w-full h-9 rounded-md border bg-background px-3 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed ${
              errors[`items.${index}.gasConfigId`] ? 'border-destructive' : 'border-input'
            }`}
            disabled={loadingConfigs || disableGasConfig}
          >
            <option value="">Select gas type…</option>
            {gasConfigs.map(c => (
              <option key={c.id} value={c.id}>{c.gasType}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <FieldError message={errors[`items.${index}.gasConfigId`]} />
      </div>
      <div className="w-24 space-y-1">
        <Input
          type="number"
          min="1"
          placeholder="Qty"
          value={item.quantity}
          onChange={(e) => onUpdate(index, 'quantity', e.target.value)}
          className={errors[`items.${index}.quantity`] ? 'border-destructive' : ''}
        />
        <FieldError message={errors[`items.${index}.quantity`]} />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(index)}
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <PageWrapper title="Gas Deliveries" description="Create delivery orders and manage their status.">

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
        {[
          { key: 'create', label: 'Create Order', icon: Plus },
          { key: 'status', label: 'Update Status', icon: ClipboardList },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Create Order Tab ─────────────────────────────────────── */}
      {activeTab === 'create' && (
        <div className="w-full">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 border-b px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">New Delivery Order</h2>
                <p className="text-xs text-muted-foreground">Create a gas delivery on behalf of a customer</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-5">
              {/* Mobile number */}
              <div className="space-y-1.5">
                <Label htmlFor="create-mobile" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Mobile Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-mobile"
                  type="tel"
                  placeholder="e.g. 77123456"
                  value={createForm.mobileNumber}
                  onChange={(e) => { setCreateForm(p => ({ ...p, mobileNumber: e.target.value })); clearError(setCreateErrors, 'mobileNumber'); }}
                  className={createErrors.mobileNumber ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                <FieldError message={createErrors.mobileNumber} />
              </div>

              {/* Customer remarks */}
              <div className="space-y-1.5">
                <Label htmlFor="create-remarks" className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  Customer Remarks
                  <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="create-remarks"
                  placeholder="Any special instructions…"
                  value={createForm.customerRemarks}
                  onChange={(e) => setCreateForm(p => ({ ...p, customerRemarks: e.target.value }))}
                />
              </div>

              {/* Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                    Order Items <span className="text-destructive">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={addCreateItem}
                    className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add item
                  </button>
                </div>
                <FieldError message={createErrors.items} />
                <div className="space-y-2">
                  {createForm.items.map((item, index) => (
                    <ItemRow
                      key={index}
                      item={item}
                      index={index}
                      onUpdate={updateCreateItem}
                      onRemove={removeCreateItem}
                      errors={createErrors}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isCreating || loadingConfigs}>
                {isCreating
                  ? <><RefreshCw className="h-4 w-4 animate-spin" />Creating…</>
                  : <><Truck className="h-4 w-4" />Create Delivery</>
                }
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ── Update Status Tab ─────────────────────────────────────── */}
      {activeTab === 'status' && (
        <div className="w-full space-y-4">

          {/* Deliveries list */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Select Delivery</h2>
                  <p className="text-xs text-muted-foreground">Select a delivery to update its status. Cancelled orders cannot be changed.</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={fetchDeliveries}
                disabled={loadingDeliveries}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingDeliveries ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="p-3">
              {loadingDeliveries ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-14 rounded-lg bg-muted/40 animate-pulse" />
                  ))}
                </div>
              ) : deliveriesError ? (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {deliveriesError}
                </div>
              ) : deliveries.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No deliveries found.</p>
              ) : (
                <div className="space-y-1.5">
                  {deliveries.map(delivery => {
                    const isSelected = selectedDeliveryId === delivery.id;
                    const isLocked = isDeliveryLocked(delivery);
                    return (
                      <button
                        key={delivery.id}
                        type="button"
                        disabled={isLocked}
                        onClick={() => handleSelectDelivery(delivery)}
                        className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                          isLocked
                            ? 'cursor-not-allowed opacity-60 border-border bg-muted/20'
                            : isSelected
                              ? 'cursor-pointer border-primary bg-primary/5'
                              : 'cursor-pointer border-border hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">#{delivery.id}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${STATUS_STYLES[delivery.status] ?? 'bg-muted text-muted-foreground'}`}>
                              {delivery.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {delivery.mobileNumber}
                            {delivery.customerRemarks ? ` · ${delivery.customerRemarks}` : ''}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Update form — shown only when a non-cancelled delivery is selected */}
          {canUpdateSelected && (
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 border-b px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Update Delivery #{statusForm.deliveryId}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    PUT /api/gas-delivery/{statusForm.deliveryId}/status
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateStatus} className="p-5 space-y-5">
                {/* Status — only DISPATCHED or CANCELLED */}
                <div className="space-y-1.5">
                  <Label>Status <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    {UPDATE_STATUSES.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setStatusForm(p => ({ ...p, status: s })); clearError(setStatusErrors, 'status'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          statusForm.status === s
                            ? `${STATUS_STYLES[s]} border-transparent ring-2 ring-offset-1 ring-current`
                            : 'border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <FieldError message={statusErrors.status} />
                </div>

                {/* Admin remarks */}
                <div className="space-y-1.5">
                  <Label htmlFor="status-remarks" className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    Admin Remarks
                    <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="status-remarks"
                    placeholder="Internal notes about this update…"
                    value={statusForm.adminRemarks}
                    onChange={(e) => setStatusForm(p => ({ ...p, adminRemarks: e.target.value }))}
                  />
                </div>

                {/* Items — only shown for DISPATCHED; gasConfigId disabled */}
                {statusForm.status === 'DISPATCHED' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-1.5">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        Items
                        <span className="text-xs text-muted-foreground font-normal">(edit quantity only)</span>
                      </Label>
                      <button
                        type="button"
                        onClick={addStatusItem}
                        className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Add item
                      </button>
                    </div>
                    {statusForm.items.map((item, index) => (
                      <ItemRow
                        key={index}
                        item={item}
                        index={index}
                        onUpdate={updateStatusItem}
                        onRemove={removeStatusItem}
                        errors={statusErrors}
                        disableGasConfig
                      />
                    ))}
                  </div>
                )}

                {/* CANCELLED notice */}
                {statusForm.status === 'CANCELLED' && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    Reserved stock will be reverted automatically.
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedDeliveryId(null);
                      setStatusForm({ deliveryId: '', status: 'DISPATCHED', adminRemarks: '', items: [] });
                      setStatusErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 gap-2" disabled={isUpdating}>
                    {isUpdating
                      ? <><RefreshCw className="h-4 w-4 animate-spin" />Updating…</>
                      : <><ClipboardList className="h-4 w-4" />Update Status</>
                    }
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}

export default GasDeliveryPage;
