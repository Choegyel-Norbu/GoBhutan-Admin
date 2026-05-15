import { useState, useEffect } from 'react';
import { UserPlus, User, Mail, Lock, Phone, Eye, EyeOff, Building2, Bus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
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

// Supported client types that have staff management
const SUPPORTED_CLIENTS = ['hotel', 'bus'];

const CLIENT_META = {
  hotel: {
    label: 'Hotel',
    icon: Building2,
    entityLabel: 'Select Hotel',
    entityType: 'hotel',
  },
  bus: {
    label: 'Bus',
    icon: Bus,
    entityLabel: 'Select Bus',
    entityType: 'bus',
  },
};

const EMPTY_FORM = {
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
};

function Field({ id, label, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function AddStaffPage() {
  const { user } = useAuth();

  // Derive the clients this user has that support staff management
  const availableClients = (user?.clients || []).filter((c) =>
    SUPPORTED_CLIENTS.includes(c)
  );

  const [selectedClient, setSelectedClient] = useState('');
  const [entities, setEntities] = useState([]);
  const [entitiesLoading, setEntitiesLoading] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState('');

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch entities whenever the selected client changes
  useEffect(() => {
    if (!selectedClient) {
      setEntities([]);
      setSelectedEntityId('');
      return;
    }

    const fetchEntities = async () => {
      setEntitiesLoading(true);
      setEntities([]);
      setSelectedEntityId('');
      try {
        if (selectedClient === 'hotel') {
          const response = await api.hotel.getHotels();
          const data = response?.data ?? response;
          setEntities(Array.isArray(data) ? data : []);
        } else if (selectedClient === 'bus') {
          const response = await api.bus.getBuses();
          const data = Array.isArray(response)
            ? response
            : response?.data ?? response?.buses ?? [];
          setEntities(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load entities:', err);
        Swal.fire({
          icon: 'error',
          title: 'Load Failed',
          text: `Could not load ${CLIENT_META[selectedClient]?.label ?? selectedClient} list.`,
          confirmButtonText: 'OK',
        });
      } finally {
        setEntitiesLoading(false);
      }
    };

    fetchEntities();
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
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};

    if (!selectedClient) errs.client = 'Please select a client';
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

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm the password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (formData.phoneNumber) {
      if (!/^\d{7,15}$/.test(String(formData.phoneNumber).trim())) {
        errs.phoneNumber = 'Phone number must be 7–15 digits';
      }
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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
        confirmButtonText: 'OK',
      });

      setFormData(EMPTY_FORM);
      setErrors({});
      setSelectedEntityId('');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error?.message || 'Could not register staff. Please try again.',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const meta = selectedClient ? CLIENT_META[selectedClient] : null;

  return (
    <PageWrapper
      title="Add Staff"
      description="Register a new staff member for your organisation"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* ── Step 1: Client selection ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Client</CardTitle>
            <CardDescription>Choose the service this staff member belongs to</CardDescription>
          </CardHeader>
          <CardContent>
            {availableClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No supported clients found for your account.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {availableClients.map((client) => {
                  const cm = CLIENT_META[client];
                  const Icon = cm.icon;
                  const active = selectedClient === client;
                  return (
                    <button
                      key={client}
                      type="button"
                      onClick={() => {
                        setSelectedClient(client);
                        setErrors((prev) => ({ ...prev, client: '', entity: '' }));
                      }}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors
                        ${active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-foreground hover:bg-muted'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {cm.label}
                    </button>
                  );
                })}
              </div>
            )}
            {errors.client && <p className="mt-2 text-xs text-destructive">{errors.client}</p>}
          </CardContent>
        </Card>

        {/* ── Step 2: Entity selection ── */}
        {selectedClient && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{meta.entityLabel}</CardTitle>
              <CardDescription>
                Choose the specific {meta.label.toLowerCase()} this staff member will be assigned to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entitiesLoading ? (
                <p className="text-sm text-muted-foreground">Loading {meta.label.toLowerCase()} list…</p>
              ) : entities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No {meta.label.toLowerCase()} records found. Please add one first.
                </p>
              ) : (
                <div className="max-w-sm">
                  <Select
                    value={selectedEntityId}
                    onChange={(e) => {
                      setSelectedEntityId(e.target.value);
                      setErrors((prev) => ({ ...prev, entity: '' }));
                    }}
                    className={errors.entity ? 'border-destructive' : ''}
                  >
                    <option value="">— Select {meta.label} —</option>
                    {entities.map((entity) => (
                      <option key={entity.id} value={entity.id}>
                        {getEntityLabel(entity)}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              {errors.entity && <p className="mt-2 text-xs text-destructive">{errors.entity}</p>}
            </CardContent>
          </Card>
        )}

        {/* ── Step 3: Staff details ── */}
        {selectedClient && selectedEntityId && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Staff Details</CardTitle>
                  <CardDescription>Enter login credentials for the new staff member</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Name row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="firstName" label="First Name" error={errors.firstName}>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="Tenzin"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className={`pl-9 ${errors.firstName ? 'border-destructive' : ''}`}
                    />
                  </div>
                </Field>

                <Field id="lastName" label="Last Name" error={errors.lastName}>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      placeholder="Dorji"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className={`pl-9 ${errors.lastName ? 'border-destructive' : ''}`}
                    />
                  </div>
                </Field>
              </div>

              {/* Username */}
              <Field id="username" label="Username" error={errors.username}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="tenzin.dorji"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    className={`pl-9 ${errors.username ? 'border-destructive' : ''}`}
                    autoComplete="username"
                  />
                </div>
              </Field>

              {/* Email */}
              <Field id="email" label="Email" error={errors.email}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tenzin@example.bt"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`pl-9 ${errors.email ? 'border-destructive' : ''}`}
                    autoComplete="email"
                  />
                </div>
              </Field>

              {/* Phone */}
              <Field id="phoneNumber" label="Phone Number (optional)" error={errors.phoneNumber}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="17123456"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    className={`pl-9 ${errors.phoneNumber ? 'border-destructive' : ''}`}
                  />
                </div>
              </Field>

              {/* Password row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="password" label="Password" error={errors.password}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={`pl-9 pr-9 ${errors.password ? 'border-destructive' : ''}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <Field id="confirmPassword" label="Confirm Password" error={errors.confirmPassword}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={`pl-9 pr-9 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
              </div>

              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters with one uppercase letter, one lowercase letter, and one number.
              </p>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setFormData(EMPTY_FORM); setErrors({}); }}
                  disabled={isSubmitting}
                >
                  Clear
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Registering…' : 'Register Staff'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </PageWrapper>
  );
}

export default AddStaffPage;
