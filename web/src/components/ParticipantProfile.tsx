import BackButton from './BackButton';
import { EventCardSkeleton } from './Skeleton';
import { formatMyanmarDate, toMyanmarDigits } from '../lib/myanmar';
import type { ParticipantAppearanceView, ParticipantProfileView } from '../types';

const BACK_LABEL = 'ပွဲစာရင်းသို့ ပြန်သွားရန်';

/** Appearances (already newest first) grouped by year, newest year first. */
function groupByYear(appearances: ParticipantAppearanceView[]): [string, ParticipantAppearanceView[]][] {
  const groups = new Map<string, ParticipantAppearanceView[]>();
  for (const item of appearances) {
    const year = item.date.slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), item]);
  }
  return [...groups.entries()];
}

/** Event participant profile; same layout for static and API data. */
export default function ParticipantProfile({ participant }: { participant: ParticipantProfileView }) {
  const milestones = participant.milestones.filter((milestone) => milestone.achieve);

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

      {participant.about && (
        <article className="tazaungdaing-participant-page">
          <section style={{ marginTop: '0px' }}>
            <h2>သမိုင်းကြောင်း</h2>
            <p>{participant.about}</p>
          </section>
        </article>
      )}

      {participant.appearances.length > 0 && (
        <article className="tazaungdaing-participant-page">
          <section style={{ marginTop: '0' }}>
            <h2>ပွဲဝင်မှတ်တမ်း</h2>
            {groupByYear(participant.appearances).map(([year, items]) => (
              <div className="appearance-year" key={year}>
                <h3>{toMyanmarDigits(year)}</h3>
                <ul className="appearance-list">
                  {items.map((item) => (
                    <li key={item.key}>
                      <time dateTime={item.date}>{formatMyanmarDate(item.date)}</time>
                      <span className="appearance-event">
                        {item.dayTitle ?? item.eventName}
                        {item.dayTitle && item.eventName ? ` · ${item.eventName}` : ''}
                      </span>
                      {item.role && <span className="appearance-role">{item.role}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
