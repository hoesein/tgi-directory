import { useParams, useSearchParams } from 'react-router-dom';
import ParticipantProfile, { ParticipantState } from '../components/ParticipantProfile';
import { useEventParticipant } from '../api/useDirectory';

/** /events/participants/:participantId?date=YYYY-MM-DD (API mode). */
export default function EventParticipantPage() {
  const { participantId } = useParams();
  const [searchParams] = useSearchParams();
  const { data: participant, isLoading, isError, refetch } = useEventParticipant(
    participantId,
    searchParams.get('date'),
  );

  if (!participant) {
    return <ParticipantState isLoading={isLoading} isError={isError} onRetry={() => void refetch()} />;
  }
  return <ParticipantProfile participant={participant} />;
}
