import { useState, useEffect } from 'react';
import { UserPlus, User, Mail, Lock, Phone, Eye, EyeOff, Building2, Bus, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import PageWrapper from '@/components/PageWrapper';
import { api } from '@/lib/apiService';
import { useAuth } from '@/contexts/AuthContext';
import {
  validateEmail,
  validatePassword,
  validateFirstName,
  validateLastName,
  validateUsername,
} from '@/lib/validation';
import Swal from 'sweetalert2';

function extractErrorMessage(error) {
  const raw = error?.message || '';
  try {
    const match = raw.match(/\{[^}]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      const msg = parsed?.errorMessage || parsed?.message || parsed?.error;
      if (msg) return msg;
    }
  } catch {}
  return 'Could not register staff. Please try again.';
}

const SUPPORTED_CLIENTS = ['hotel', 'bus'];

const CLIENT_META = {
  hotel: { label: 'Hotel', icon: Building2, entityLabel: 'Select Hotel', entityType: 'hotel' },
  bus: { label: 'Bus', icon: Bus, entityLabel: 'Select Bus', entityType: 'bus' },
};

const EMPTY_FORM = {
  username: '', email: '', firstName: '', lastName: '',
  password: '', confirmPassword: '', phoneNumber: '',
};

function StepDot({ number, done, active }) {
  return (
    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
      done
        ? 'bg-primary text-primary-foreground'
        : active
          ? 'ring-4 ring-primary/20 bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground'
    }`}>
      {done ? <Check className="h-3 w-3" /> : number}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

function FormField({ id, label, optional, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
        )}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Divider({ faint }) {
  return <div className={`h-px ${faint ? 'bg-border/50' : 'bg-border'}`} />;
}

function AddStaffPage() {
  const { user } = useAuth();
  const availableClients = (user?.clients || []).filter(c => SUPPORTED_CLIENTS.includes(c));

  const [selectedClient, setSelectedClient] = useState('');
  const [entities, setEntities] = useState([]);
  const [entitiesLoading, setEntitiesLoading] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const step = !selectedClient ? 1 : !selectedEntityId ? 2 : 3;

  useEffect(() => {
    if (!selectedClient) { setEntities([]); setSelectedEntityId(''); return; }
    const load = async () => {
      setEntitiesLoading(true);
      setEntities([]);
      setSelectedEntityId('');
      try {
        if (selectedClient === 'hotel') {
          const r = await api.hotel.getHotels();
          const d = r?.data ?? r;
          setEntities(Array.isArray(d) ? d : []);
        } else if (selectedClient === 'bus') {
          const r = await api.bus.getBuses();
          const d = Array.isArray(r) ? r : r?.data ?? r?.buses ?? [];
          setEntities(Array.isArray(d) ? d : []);
        }
      } catch (err) {
        console.error('Failed to load entities:', err);
        Swal.fire({ icon: 'error', title: 'Load Failed', text: `Could not load ${CLIENT_META[selectedClient]?.label} list.` });
      } finally {
        setEntitiesLoading(false);
      }
    };
    load();
  }, [selectedClient]);

  const getEntityLabel = (entity) => {
    if (selectedClient === 'hotel') return entity.name || `Hotel ${entity.id}`;
    if (selectedClient === 'bus')
      return entity.busName
        ? `${entity.busName}${entity.busNumber ? ` (${entity.busNumber})` : ''}`
        : `Bus ${entity.id}`;
    return entity.name || String(entity.id);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!selectedClient) errs.client = 'Please select a service';
    if (!selectedEntityId) errs.entity = `Please select a ${CLIENT_META[selectedClient]?.label ?? 'entity'}`;
    const ur = validateUsername(formData.username);
    if (!ur.isValid) errs.username = ur.message;
    const er = validateEmail(formData.email);
    if (!er.isValid) errs.email = er.message;
    const fr = validateFirstName(formData.firstName);
    if (!fr.isValid) errs.firstName = fr.message;
    const lr = validateLastName(formData.lastName);
    if (!lr.isValid) errs.lastName = lr.message;
    const pr = validatePassword(formData.password);
    if (!pr.isValid) errs.password = pr.message;
    if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm the password';
    else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (formData.phoneNumber && !/^\d{7,15}$/.test(String(formData.phoneNumber).trim()))
      errs.phoneNumber = 'Phone number must be 7–15 digits';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setIsSubmitting(true);
    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber ? Number(formData.phoneNumber) : 0,
        client: selectedClient,
        entityId: String(selectedEntityId),
        entityType: CLIENT_META[selectedClient].entityType,
      };
      await api.hotel.registerStaff(payload);
      await Swal.fire({
        icon: 'success',
        title: 'Staff Registered',
        text: `${payload.firstName} ${payload.lastName} has been registered successfully.`,
      });
      setFormData(EMPTY_FORM);
      setErrors({});
      setSelectedEntityId('');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: extractErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const meta = selectedClient ? CLIENT_META[selectedClient] : null;

  return (
    <PageWrapper title="Add Staff" description="Register a new staff member for your organisation">
      <div className="w-full">

        {/* ── Progress bar ──────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6">
          {['Service', 'Assignment', 'Details'].map((label, i) => {
            const num = i + 1;
            return (
              <div key={label} className="flex items-center gap-2">
                <StepDot number={num} done={step > num} active={step === num} />
                <span className={`text-sm ${step === num ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {i < 2 && (
                  <div className={`mx-1 h-px w-8 transition-colors ${step > num ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="rounded-xl border border-border bg-card overflow-hidden">

            {/* ── Step 1: Service ───────────────────────────────── */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <StepDot number={1} done={step > 1} active={step === 1} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Select Service</p>
                    <p className="text-xs text-muted-foreground">Choose the service this staff member belongs to</p>
                  </div>
                </div>
                {selectedClient && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClient('');
                      setSelectedEntityId('');
                      setFormData(EMPTY_FORM);
                      setErrors({});
                    }}
                    className="text-xs text-primary hover:underline cursor-pointer shrink-0"
                  >
                    Change
                  </button>
                )}
              </div>

              {availableClients.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-9">
                  No supported clients found for your account.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pl-9">
                  {availableClients.map(client => {
                    const cm = CLIENT_META[client];
                    const Icon = cm.icon;
                    const isActive = selectedClient === client;
                    return (
                      <button
                        key={client}
                        type="button"
                        onClick={() => {
                          setSelectedClient(client);
                          setErrors(prev => ({ ...prev, client: '', entity: '' }));
                        }}
                        className={`relative flex flex-col items-center gap-2.5 rounded-xl border-2 p-5 text-sm font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-foreground hover:border-primary/30 hover:bg-muted'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                          </span>
                        )}
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                          isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        {cm.label}
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.client && (
                <p className="pl-9 text-xs text-destructive">{errors.client}</p>
              )}
            </div>

            {/* ── Step 2: Assignment ───────────────────────────── */}
            {selectedClient && (
              <>
                <Divider />
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <StepDot number={2} done={step > 2} active={step === 2} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{meta.entityLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        Assign this staff member to a specific {meta.label.toLowerCase()}
                      </p>
                    </div>
                  </div>

                  <div className="pl-9">
                    {entitiesLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Loading {meta.label.toLowerCase()} list…
                      </div>
                    ) : entities.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No {meta.label.toLowerCase()} records found. Please add one first.
                      </p>
                    ) : (
                      <div className="max-w-xs">
                        <Select
                          value={selectedEntityId}
                          onChange={e => {
                            setSelectedEntityId(e.target.value);
                            setErrors(prev => ({ ...prev, entity: '' }));
                          }}
                          className={errors.entity ? 'border-destructive' : ''}
                        >
                          <option value="">— Select {meta.label} —</option>
                          {entities.map(entity => (
                            <option key={entity.id} value={entity.id}>{getEntityLabel(entity)}</option>
                          ))}
                        </Select>
                      </div>
                    )}
                    {errors.entity && (
                      <p className="mt-2 text-xs text-destructive">{errors.entity}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── Step 3: Staff Details ─────────────────────────── */}
            {selectedClient && selectedEntityId && (
              <>
                <Divider />
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <StepDot number={3} done={false} active={true} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Staff Details</p>
                      <p className="text-xs text-muted-foreground">Enter the new staff member's login credentials</p>
                    </div>
                  </div>

                  {/* Identity */}
                  <div className="space-y-4 pl-9">
                    <SectionLabel>Identity</SectionLabel>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField id="firstName" label="First Name" error={errors.firstName}>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="firstName" placeholder="Tenzin" value={formData.firstName}
                            onChange={e => handleChange('firstName', e.target.value)}
                            className={`pl-9 ${errors.firstName ? 'border-destructive' : ''}`} />
                        </div>
                      </FormField>
                      <FormField id="lastName" label="Last Name" error={errors.lastName}>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="lastName" placeholder="Dorji" value={formData.lastName}
                            onChange={e => handleChange('lastName', e.target.value)}
                            className={`pl-9 ${errors.lastName ? 'border-destructive' : ''}`} />
                        </div>
                      </FormField>
                    </div>
                    <FormField id="username" label="Username" error={errors.username}>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="username" placeholder="tenzin.dorji" value={formData.username}
                          onChange={e => handleChange('username', e.target.value)}
                          className={`pl-9 ${errors.username ? 'border-destructive' : ''}`}
                          autoComplete="username" />
                      </div>
                    </FormField>
                  </div>

                  <Divider faint />

                  {/* Contact */}
                  <div className="space-y-4 pl-9">
                    <SectionLabel>Contact</SectionLabel>
                    <FormField id="email" label="Email" error={errors.email}>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" placeholder="tenzin@example.bt" value={formData.email}
                          onChange={e => handleChange('email', e.target.value)}
                          className={`pl-9 ${errors.email ? 'border-destructive' : ''}`}
                          autoComplete="email" />
                      </div>
                    </FormField>
                    <FormField id="phoneNumber" label="Phone Number" optional error={errors.phoneNumber}>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="phoneNumber" type="tel" placeholder="17123456" value={formData.phoneNumber}
                          onChange={e => handleChange('phoneNumber', e.target.value)}
                          className={`pl-9 ${errors.phoneNumber ? 'border-destructive' : ''}`} />
                      </div>
                    </FormField>
                  </div>

                  <Divider faint />

                  {/* Security */}
                  <div className="space-y-4 pl-9">
                    <SectionLabel>Security</SectionLabel>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField id="password" label="Password" error={errors.password}>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="password" type={showPassword ? 'text' : 'password'}
                            placeholder="Min. 8 characters" value={formData.password}
                            onChange={e => handleChange('password', e.target.value)}
                            className={`pl-9 pr-9 ${errors.password ? 'border-destructive' : ''}`}
                            autoComplete="new-password" />
                          <button type="button" tabIndex={-1}
                            onClick={() => setShowPassword(v => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormField>
                      <FormField id="confirmPassword" label="Confirm Password" error={errors.confirmPassword}>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'}
                            placeholder="Repeat password" value={formData.confirmPassword}
                            onChange={e => handleChange('confirmPassword', e.target.value)}
                            className={`pl-9 pr-9 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                            autoComplete="new-password" />
                          <button type="button" tabIndex={-1}
                            onClick={() => setShowConfirm(v => !v)}
                            aria-label={showConfirm ? 'Hide password' : 'Show password'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormField>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters with one uppercase, one lowercase, and one number.
                    </p>
                  </div>

                  {/* Submit */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => { setFormData(EMPTY_FORM); setErrors({}); }}
                      disabled={isSubmitting}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Clear form
                    </button>
                    <Button type="submit" disabled={isSubmitting} className="gap-2 px-6">
                      {isSubmitting
                        ? <><RefreshCw className="h-4 w-4 animate-spin" />Registering…</>
                        : <><UserPlus className="h-4 w-4" />Register Staff</>
                      }
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}

export default AddStaffPage;
