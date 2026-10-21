import { useState } from 'react';
import BackButton from './BackButton';
import PhotoViewer from './PhotoViewer';
import { EventCardSkeleton } from './Skeleton';
import type { ParticipantProfileView } from '../types';

const BACK_LABEL = 'ပွဲစာရင်းသို့ ပြန်သွားရန်';

/** Event participant profile; same layout for static and API data. */
export default function ParticipantProfile({ participant }: { participant: ParticipantProfileView }) {
  const milestones = participant.milestones.filter((milestone) => milestone.achieve);
  // Index of the photo open in the popup; null when closed.
  const [viewing, setViewing] = useState<number | null>(null);

  return (
    <div>
      <div className="page-head">
        <BackButton label={BACK_LABEL} />
        <h1>{participant.name}</h1>
        <span className="page-head-spacer" />
      </div>
      <article className="tazaungdaing-participant-info">
        <dl>
          <div>
            <dt>အမျိုးအစား</dt>
            <dd>{participant.role}</dd>
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
            <dt>စတင်ယှဥ်ပြိုင်သည့်နှစ်</dt>
            <dd>{participant.initialYear}</dd>
          </div>
          <div className="participant-milestones">
            <dt>မှတ်တမ်းများ</dt>
            <dd>
              {milestones.length > 0 ? (
                <ul>
                  {milestones.map((milestone) => (
                    <li key={`${milestone.year}-${milestone.achieve}`}>
                      <span className="milestone-year">{milestone.year}</span>
                      <span className="milestone-text">{milestone.achieve}</span>
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

      {participant.about && (
        <article className="tazaungdaing-participant-page">
          <section style={{ marginTop: '0px' }}>
            <h2>သမိုင်းကြောင်း</h2>
            <p>{participant.about}</p>
          </section>
        </article>
      )}

      {participant.photos.length > 0 && (
        <article className="tazaungdaing-participant-page">
          <section style={{ marginTop: '0' }}>
            <h2>ဓာတ်ပုံများ</h2>
            <ul className="participant-photos">
              {participant.photos.map((src, index) => (
                <li key={src}>
                  <button
                    className="participant-photo"
                    onClick={() => setViewing(index)}
                    aria-label={`ဓာတ်ပုံ ${index + 1} ကို ကြည့်ရန်`}
                    type="button"
                  >
                    <img src={src} alt="" loading="lazy" decoding="async" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </article>
      )}

      {participant.social.length > 0 && (
        <article className="tazaungdaing-participant-page">
          <section style={{ marginTop: '0' }}>
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

      {viewing !== null && (
        <PhotoViewer
          photos={participant.photos}
          startIndex={viewing}
          title={participant.name}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}

export function ParticipantState({
  isLoading,
  isError,
  onRetry,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isLoading) return <EventCardSkeleton rows={4} />;
  if (isError) {
    return (
      <div className="centered">
        <p role="alert">ပွဲအချက်အလက်များကို ရယူ၍ မရပါ။</p>
        <button className="link-btn" onClick={onRetry} type="button">
          ပြန်ကြိုးစားရန်
        </button>
      </div>
    );
  }
  return (
    <div className="centered">
      <p>ပွဲအချက်အလက် မတွေ့ပါ။</p>
      <BackButton label={BACK_LABEL} />
    </div>
  );
}
