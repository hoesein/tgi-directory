import { useState, type ReactNode } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { LocateFixed, MapPin, X } from 'lucide-react';
import { z } from 'zod';
import LazyOsmMap from './map/LazyOsmMap';
import { round6 } from '../lib/maps';

/** Form values shared by "Suggest an edit" and "Add a missing place". Limits match the backend. */
export const placeFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter the name').max(200, 'At most 200 characters'),
  typeCode: z.string().min(1, 'Choose a type'),
  townshipId: z.string().min(1, 'Choose a township'),
  phone: z.string().trim().max(100, 'At most 100 characters'),
  address: z.string().trim().max(500, 'At most 500 characters'),
  description: z.string().trim().max(5000, 'At most 5000 characters'),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  note: z.string().trim().max(1000, 'At most 1000 characters'),
});

export type PlaceFormValues = z.infer<typeof placeFormSchema>;

interface Option {
  value: string;
  label: string;
}

interface PlaceFormFieldsProps {
  register: UseFormRegister<PlaceFormValues>;
  errors: FieldErrors<PlaceFormValues>;
  typeOptions: Option[];
  townshipOptions: Option[];
}

/** A titled card that groups related fields. */
export function FormSection({ id, title, hint, children }: { id?: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="form-section" id={id}>
      <h2>{title}</h2>
      {hint && <p className="form-section-hint">{hint}</p>}
      {children}
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="field-error" role="alert">
      {message}
    </p>
  ) : null;
}

export default function PlaceFormFields({ register, errors, typeOptions, townshipOptions }: PlaceFormFieldsProps) {
  return (
    <>
      <FormSection title="Place">
        <div className="field">
          <label htmlFor="place-name">Name</label>
          <input id="place-name" {...register('name')} autoComplete="off" aria-invalid={!!errors.name} />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="place-type">Type</label>
            <select id="place-type" {...register('typeCode')} aria-invalid={!!errors.typeCode}>
              <option value="">Choose</option>
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.typeCode?.message} />
          </div>

          <div className="field">
            <label htmlFor="place-township">Township</label>
            <select id="place-township" {...register('townshipId')} aria-invalid={!!errors.townshipId}>
              <option value="">Choose</option>
              {townshipOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.townshipId?.message} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Contact and details">
        <div className="field">
          <label htmlFor="place-phone">Phone</label>
          <input
            id="place-phone"
            type="tel"
            inputMode="tel"
            placeholder="e.g. 081 21 22 97"
            {...register('phone')}
          />
          <FieldError message={errors.phone?.message} />
        </div>

        <div className="field">
          <label htmlFor="place-address">Address</label>
          <textarea id="place-address" rows={2} {...register('address')} />
          <FieldError message={errors.address?.message} />
        </div>

        <div className="field">
          <label htmlFor="place-description">Description</label>
          <textarea
            id="place-description"
            rows={4}
            placeholder="What should visitors know?"
            {...register('description')}
          />
          <FieldError message={errors.description?.message} />
        </div>
      </FormSection>
    </>
  );
}

interface LocationFieldProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number | null, longitude: number | null) => void;
}

/** Map picker (OpenStreetMap): tap the map, drag the pin, or use the phone's GPS. Both coordinates or none. */
export function LocationField({ latitude, longitude, onChange }: LocationFieldProps) {
  const [status, setStatus] = useState<string | null>(null);
  const point = latitude !== null && longitude !== null ? { lat: latitude, lng: longitude } : null;

  const useCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setStatus("This device can't share its location.");
      return;
    }
    setStatus('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange(round6(position.coords.latitude), round6(position.coords.longitude));
        setStatus(null);
      },
      () => setStatus("Couldn't get your location. Check the location permission."),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  return (
    <FormSection id="location" title="Location" hint="Tap the map or drag the pin to the entrance.">
      <LazyOsmMap
        className="location-picker-map"
        point={point}
        onPick={(picked) => onChange(picked.lat, picked.lng)}
        label="Choose the place's location"
      />
      <div className="location-bar">
        <span className="location-value">
          <MapPin size={15} aria-hidden="true" />
          {point ? `${point.lat}, ${point.lng}` : 'No pin yet'}
        </span>
        <div className="location-actions">
          <button type="button" className="chip-btn" onClick={useCurrentLocation}>
            <LocateFixed size={16} />
            <span>My location</span>
          </button>
          {point && (
            <button type="button" className="chip-btn" onClick={() => onChange(null, null)} aria-label="Clear location">
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      {status && (
        <p className="location-status" role="status">
          {status}
        </p>
      )}
    </FormSection>
  );
}
