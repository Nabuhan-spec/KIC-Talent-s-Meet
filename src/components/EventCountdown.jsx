
import { useEffect, useState } from "react";

export default function EventCountdown({ startAt, endAt }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const start = new Date(startAt).getTime();
  const end = endAt ? new Date(endAt).getTime() : null;

  if (!Number.isFinite(start)) {
    return <p>Event time unavailable</p>;
  }

  if (now >= start && end && now >= end) {
    return <div className="event-timer completed">EVENT COMPLETED</div>;
  }

  if (now >= start) {
    return <div className="event-timer ongoing">EVENT STARTED</div>;
  }

  const difference = start - now;

  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);
  const seconds = Math.floor((difference % 60000) / 1000);

  const units = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Minutes", value: minutes },
    { label: "Seconds", value: seconds },
  ];

  return (
    <div className="event-timer">
      <div className="event-timer-label">EVENT STARTS IN</div>

      <div className="event-timer-units">
        {units.map((unit) => (
          <div className="event-timer-unit" key={unit.label}>
            <strong>{String(unit.value).padStart(2, "0")}</strong>
            <span>{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
