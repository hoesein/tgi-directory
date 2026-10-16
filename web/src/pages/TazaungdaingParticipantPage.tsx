import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useTazaungdaingEvents } from '../api/useDirectory';
import { isTazaungdaingParticipantDetails } from '../types';

export default function TazaungdaingParticipantPage() {
  const { eventDate = '', participantIndex: participantIndexParam = '' } = useParams();
  const participantIndex = Number(participantIndexParam);
  const {
    data: events,
    isLoading,
    isError,
    refetch,
  } = useTazaungdaingEvents();
  const event = events?.find((item) => item.event_date === eventDate);
  const participant =
    Number.isInteger(participantIndex) && participantIndex >= 0
      ? event?.participants[participantIndex]
      : undefined;

  if (isLoading) {
    return <p className="centered">ပွဲအချက်အလက်များ ရယူနေသည်…</p>;
  }

  if (isError) {
    return (
      <div className="centered">
        <p role="alert">တန်ဆောင်တိုင်ပွဲ အချက်အလက်များကို ရယူ၍ မရပါ။</p>
        <button className="link-btn" onClick={() => void refetch()} type="button">
          ပြန်ကြိုးစားရန်
        </button>
      </div>
    );
  }

  if (!event || !participant || !isTazaungdaingParticipantDetails(participant)) {
    return (
      <div className="centered">
        <p>ပွဲအချက်အလက် မတွေ့ပါ။</p>
        <BackButton label="ပွဲစာရင်းသို့ ပြန်သွားရန်" />
      </div>
    );
  }

  const milestones = participant.milestones.filter((milestone) => milestone.achieve);

  return (
    <div>
      <div className="page-head">
        <BackButton label="ပွဲစာရင်းသို့ ပြန်သွားရန်" />
        <h1>{participant.name}</h1>
        <span className="page-head-spacer" />
      </div>
      <article
        className="tazaungdaing-participant-info"
      >
        {/* <p className="tazaungdaing-participant-subtitle">{event.name}</p>
        <time dateTime={event.event_date}>{event.event_date}</time> */}
        <dl>
          <div>
            <dt>အမျိုးအစား</dt>
            <dd>{participant.type}</dd>
          </div>
          <div>
            <dt>ကိုယ်စားပြုရပ်ကွက်</dt>
            <dd>{participant.ward}</dd>
          </div>
          <div>
            <dt>မီးဆရာ</dt>
            <dd>{participant.leader}</dd>
          </div>
          <div>
            <dt>စတင်ယှဥ်ပြိုင်သည့်နှစ်</dt>
            <dd>{participant.initial_year}</dd>
          </div>
          <div>
            <dt>မှတ်တမ်းများ</dt>
            <dd>
              {milestones.length > 0 ? (
                <ul>
                  {milestones.map((milestone) => (
                    <li key={`${milestone.year}-${milestone.achieve}`}>
                      {milestone.year}: {milestone.achieve}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>မှတ်တမ်းများ မရှိသေးပါ။</p>
              )}
            </dd>
          </div>
        </dl>
      </article>

      <article className="tazaungdaing-participant-page">
        {participant.about && (
          <section style={{ marginTop: "0px" }}>
            <h2>သမိုင်းကြောင်း</h2>
            <p>{participant.about}</p>
          </section>
        )}
      </article>

      {/* Social Info */}
      {participant.social && (
        <article className="tazaungdaing-participant-page">
          <section style={{ marginTop: "0" }}>
            <h2>လူမှုကွန်ရက်</h2>
            <ul>
              {participant.social.map((social) => (
                <li key={social.platform}>
                  <a href={social.url} target="_blank" rel="noopener noreferrer">
                    {social.platform}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </article>
      )}
    </div>
  );
}
