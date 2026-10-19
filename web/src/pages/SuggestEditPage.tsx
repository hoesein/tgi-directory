import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import BackButton from '../components/BackButton';
import PlaceFormFields, {
  FormSection,
  LocationField,
  placeFormSchema,
  type PlaceFormValues,
} from '../components/PlaceFormFields';
import { useDirectoryCategories, useDirectoryPlace } from '../api/useDirectory';
import { useSubmitSuggestion, useTownships } from '../api/useSuggestions';
import { placePath } from '../lib/routes';
import { canSuggest, suggestionErrorMessage } from '../services/suggestions';
import { useAuthStore } from '../store/authStore';
import type { DirectoryPlace, SuggestionChanges } from '../types';

const EMPTY: PlaceFormValues = {
  name: '',
  typeCode: '',
  townshipId: '',
  phone: '',
  address: '',
  description: '',
  latitude: null,
  longitude: null,
  note: '',
};

function valuesFromPlace(place: DirectoryPlace): PlaceFormValues {
  return {
    ...EMPTY,
    name: place.name,
    typeCode: place.type.code,
    townshipId: place.township?.id ?? '',
    phone: place.phone ?? '',
    address: place.address,
    description: place.description ?? '',
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

/** Only the fields the user changed, in backend names. */
function changedFields(initial: PlaceFormValues, values: PlaceFormValues): SuggestionChanges {
  const changes: SuggestionChanges = {};
  const text = (value: string) => value.trim();
  const nullable = (value: string) => value.trim() || null;
  if (text(values.name) !== text(initial.name)) changes.name = text(values.name);
  if (values.typeCode !== initial.typeCode) changes.type_code = values.typeCode;
  if (values.townshipId !== initial.townshipId) changes.township_id = values.townshipId;
  if (text(values.phone) !== text(initial.phone)) changes.phone = nullable(values.phone);
  if (text(values.address) !== text(initial.address)) changes.address = nullable(values.address);
  if (text(values.description) !== text(initial.description)) changes.description = nullable(values.description);
  if (values.latitude !== initial.latitude || values.longitude !== initial.longitude) {
    changes.latitude = values.latitude;
    changes.longitude = values.longitude;
  }
  return changes;
}

/** "Suggest an edit" for a place (TGI-24): correct details or report it closed. */
export default function SuggestEditPage() {
  const { entity = '', listingId = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore((state) => state.ready);
  const { data: place, isLoading } = useDirectoryPlace(entity, listingId);
  const { data: categories } = useDirectoryCategories();
  const { data: townships } = useTownships(!!user);
  const submit = useSubmitSuggestion();
  const [closed, setClosed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const initial = useMemo(() => (place ? valuesFromPlace(place) : EMPTY), [place]);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlaceFormValues>({ resolver: zodResolver(placeFormSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (place) reset(valuesFromPlace(place));
  }, [place, reset]);

  const values = watch();
  const changes = changedFields(initial, values);
  const hasChanges = Object.keys(changes).length > 0;

  const category = categories?.find((item) => item.id === entity);
  const typeOptions = (category?.types ?? []).map((type) => ({ value: type.code, label: type.name }));
  const townshipOptions = (townships ?? []).map((township) => ({ value: township.id, label: township.name }));

  if (!canSuggest()) return <Navigate to={`/place/${entity}/${listingId}`} replace />;
  if (ready && !user) {
    return <Navigate to={`/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (!place) {
    return <div className="centered">{isLoading ? <p>Loading…</p> : <p>Place not found</p>}</div>;
  }

  const send = (form: PlaceFormValues) => {
    setFormError(null);
    const note = form.note.trim() || undefined;
    const input = closed
      ? { kind: 'closed' as const, entity, record_id: place.id, note }
      : { kind: 'correction' as const, entity, record_id: place.id, changes: changedFields(initial, form), note };
    submit.mutate(input, {
      onSuccess: () =>
        navigate('/profile/suggestions', {
          replace: true,
          state: { toast: 'Thanks! An admin will review your suggestion.' },
        }),
      onError: (error) => setFormError(suggestionErrorMessage(error)),
    });
  };

  return (
    <div className="suggest-page">
      <div className="page-head">
        <BackButton onBack={() => navigate(placePath(place), { replace: true })} />
        <h1>Suggest an edit</h1>
        <span style={{ width: 24 }} />
      </div>

      <form className="suggest-form" onSubmit={handleSubmit(send)} noValidate>
        <p className="suggest-intro">
          Help keep <strong>{place.name}</strong> up to date. An admin checks every suggestion before it
          appears.
        </p>

        <label className="switch-row">
          <span>
            <strong>This place is closed</strong>
            <small>Report it instead of editing details</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={closed}
            onChange={(event) => setClosed(event.target.checked)}
          />
        </label>

        {!closed && (
          <>
            <PlaceFormFields
              register={register}
              errors={errors}
              typeOptions={typeOptions}
              townshipOptions={townshipOptions}
            />
            <LocationField
              latitude={values.latitude}
              longitude={values.longitude}
              onChange={(latitude, longitude) => {
                setValue('latitude', latitude, { shouldDirty: true });
                setValue('longitude', longitude, { shouldDirty: true });
              }}
            />
          </>
        )}

        <FormSection title={closed ? 'How do you know?' : 'Note for the admin'}>
          <div className="field">
            <label htmlFor="suggest-note" className="visually-hidden">
              Note (optional)
            </label>
            <textarea
              id="suggest-note"
              rows={3}
              placeholder={closed ? 'e.g. The shop has been empty since June' : 'Optional'}
              {...register('note')}
            />
            {errors.note && <p className="field-error">{errors.note.message}</p>}
          </div>
        </FormSection>

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <div className="form-submit-bar">
          {!closed && (
            <p className="suggest-hint" aria-live="polite">
              {hasChanges ? 'Only the details you changed are sent.' : 'Change at least one detail to send.'}
            </p>
          )}
          <button className="btn-primary" type="submit" disabled={(!closed && !hasChanges) || submit.isPending}>
            {submit.isPending ? 'Sending…' : closed ? 'Report as closed' : 'Send suggestion'}
          </button>
        </div>
      </form>
    </div>
  );
}
