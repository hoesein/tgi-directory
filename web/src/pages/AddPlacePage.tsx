import { useState } from 'react';
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
import { useDirectoryCategories } from '../api/useDirectory';
import { useSubmitSuggestion, useTownships } from '../api/useSuggestions';
import { canSuggest, suggestionErrorMessage } from '../services/suggestions';
import { useAuthStore } from '../store/authStore';
import { toEntityCode } from '../services/directory';
import { categoryPath } from '../lib/routes';
import type { SuggestionChanges } from '../types';

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

/** "Add a missing place" in a category (TGI-24). */
export default function AddPlacePage() {
  const { categoryId = '' } = useParams();
  const entity = toEntityCode(categoryId);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore((state) => state.ready);
  const { data: categories } = useDirectoryCategories();
  const { data: townships } = useTownships(!!user);
  const submit = useSubmitSuggestion();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlaceFormValues>({ resolver: zodResolver(placeFormSchema), defaultValues: EMPTY });
  const latitude = watch('latitude');
  const longitude = watch('longitude');

  const category = categories?.find((item) => item.id === entity);
  const typeOptions = (category?.types ?? []).map((type) => ({ value: type.code, label: type.name }));
  const townshipOptions = (townships ?? []).map((township) => ({ value: township.id, label: township.name }));

  if (!canSuggest()) return <Navigate to={categoryPath(categoryId)} replace />;
  if (ready && !user) {
    return <Navigate to={`/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const send = (form: PlaceFormValues) => {
    setFormError(null);
    const changes: SuggestionChanges = {
      name: form.name.trim(),
      type_code: form.typeCode,
      township_id: form.townshipId,
    };
    if (form.phone.trim()) changes.phone = form.phone.trim();
    if (form.address.trim()) changes.address = form.address.trim();
    if (form.description.trim()) changes.description = form.description.trim();
    if (form.latitude !== null && form.longitude !== null) {
      changes.latitude = form.latitude;
      changes.longitude = form.longitude;
    }
    submit.mutate(
      { kind: 'new_place', entity, changes, note: form.note.trim() || undefined },
      {
        onSuccess: () =>
          navigate('/profile/suggestions', {
            replace: true,
            state: { toast: 'Thanks! An admin will review your suggestion.' },
          }),
        onError: (error) => setFormError(suggestionErrorMessage(error)),
      },
    );
  };

  return (
    <div className="suggest-page">
      <div className="page-head">
        <BackButton onBack={() => navigate(categoryPath(categoryId), { replace: true })} />
        <h1>Add a missing place</h1>
        <span style={{ width: 24 }} />
      </div>

      <form className="suggest-form" onSubmit={handleSubmit(send)} noValidate>
        <p className="suggest-intro">
          Know a place that isn&apos;t listed in <strong>{category?.title ?? 'this category'}</strong>? An admin
          checks it before it appears.
        </p>

        <PlaceFormFields
          register={register}
          errors={errors}
          typeOptions={typeOptions}
          townshipOptions={townshipOptions}
        />
        <LocationField
          latitude={latitude}
          longitude={longitude}
          onChange={(lat, lng) => {
            setValue('latitude', lat);
            setValue('longitude', lng);
          }}
        />

        <FormSection title="Note for the admin">
          <div className="field">
            <label htmlFor="add-note" className="visually-hidden">
              Note (optional)
            </label>
            <textarea id="add-note" rows={3} placeholder="Optional" {...register('note')} />
            {errors.note && <p className="field-error">{errors.note.message}</p>}
          </div>
        </FormSection>

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <div className="form-submit-bar">
          <button className="btn-primary" type="submit" disabled={submit.isPending}>
            {submit.isPending ? 'Sending…' : 'Send suggestion'}
          </button>
        </div>
      </form>
    </div>
  );
}
