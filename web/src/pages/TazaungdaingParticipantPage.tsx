import { useParams } from 'react-router-dom';
import ParticipantProfile, { ParticipantState } from '../components/ParticipantProfile';
import { useTazaungdaingEvents } from '../api/useDirectory';
import { isTazaungdaingParticipantDetails } from '../types';

/** Old link format: /events/tazaungdaing/:eventDate/:participantIndex (bundled JSON). */
export default function TazaungdaingParticipantPage() {
  const { eventDate = '', participantIndex: participantIndexParam = '' } = useParams();
  const participantIndex = Number(participantIndexParam);
  const { data: events, isLoading, isError, refetch } = useTazaungdaingEvents();
  const event = events?.find((item) => item.event_date === eventDate);
  const participant =
    Number.isInteger(participantIndex) && participantIndex >= 0
      ? event?.participants[participantIndex]
      : undefined;

  if (!participant || !isTazaungdaingParticipantDetails(participant)) {
    return <ParticipantState isLoading={isLoading} isError={isError} onRetry={() => void refetch()} />;
  }

  return (
    <ParticipantProfile
      participant={{
        name: participant.name,
        role: participant.type,
        ward: participant.ward,
        leader: participant.leader,
        initialYear: participant.initial_year,
        milestones: participant.milestones,
        about: participant.about,
        social: participant.social ?? [],
      }}
    />
  );
}
