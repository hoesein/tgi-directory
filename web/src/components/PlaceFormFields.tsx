import { useState } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { LocateFixed, X } from 'lucide-react';
import { z } from 'zod';

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
  showDescription?: boolean;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="field-error">{message}</p> : null;
}

export default function PlaceFormFields({
  register,
  errors,
  typeOptions,
  townshipOptions,
  showDescription = false,
}: PlaceFormFieldsProps) {
  return (
    <>
      <div className="field">
        <label htmlFor="place-name">Name</label>
        <input id="place-name" {...register('name')} autoComplete="off" />
      </div>
      <FieldError message={errors.name?.message} />

      <div className="field">
        <label htmlFor="place-type">Type</label>
        <select id="place-type" {...register('typeCode')}>
          <option value="">Choose a type</option>
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <FieldError message={errors.typeCode?.message} />

      <div className="field">
        <label htmlFor="place-township">Township</label>
        <select id="place-township" {...register('townshipId')}>
          <option value="">Choose a township</option>
          {townshipOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <FieldError message={errors.townshipId?.message} />

      <div className="field">
        <label htmlFor="place-phone">Phone (optional)</label>
        <input id="place-phone" type="tel" {...register('phone')} />
      </div>
      <FieldError message={errors.phone?.message} />

      <div className="field">
        <label htmlFor="place-address">Address (optional)</label>
        <input id="place-address" {...register('address')} />
      </div>
      <FieldError message={errors.address?.message} />

      {showDescription && (
        <>
          <div className="field">
            <label htmlFor="place-description">Description (optional)</label>
            <textarea id="place-description" rows={3} {...register('description')} />
          </div>
          <FieldError message={errors.description?.message} />
        </>
      )}
    </>
  );
}

interface LocationFieldProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number | null, longitude: number | null) => void;
}

/** Location from the phone's GPS (no map in the PWA yet). Both coordinates or none. */
export function LocationField({ latitude, longitude, onChange }: LocationFieldProps) {
  const [status, setStatus] = useState<string | null>(null);
  const hasLocation = latitude !== null && longitude !== null;

  const useCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setStatus("This device can't share its location.");
      return;
    }
    setStatus('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange(
          Number(position.coords.latitude.toFixed(6)),
          Number(position.coords.longitude.toFixed(6)),
        );
        setStatus(null);
      },
      () => setStatus("Couldn't get your location. Check the location permission."),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  return (
    <div className="field location-field">
      <span className="location-label">Location (optional)</span>
      <p className="location-value">
        {hasLocation ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            {latitude}, {longitude}
          </a>
        ) : (
          'No location set'
        )}
      </p>
      <div className="location-actions">
        <button type="button" className="chip-btn" onClick={useCurrentLocation}>
          <LocateFixed size={16} />
          <span>Use my current location</span>
        </button>
        {hasLocation && (
          <button type="button" className="chip-btn" onClick={() => onChange(null, null)}>
            <X size={16} />
            <span>Clear</span>
          </button>
        )}
      </div>
      <p className="location-help">Stand at the place before using your location.</p>
      {status && <p className="location-status">{status}</p>}
    </div>
  );
}
