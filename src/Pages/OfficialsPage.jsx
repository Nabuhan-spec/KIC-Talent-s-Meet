
import { useFest } from '../context/festcontext'

function getPhoneNumber(phone) {
  return String(phone || '').replace(/\D/g, '')
}

function getWhatsAppNumber(phone) {
  let number = getPhoneNumber(phone)

  // Add India's country code for 10-digit numbers
  if (number.length === 10) {
    number = '91' + number
  }

  return number
}

export default function OfficialsPage() {
  const { officials = [], loading } = useFest()

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="section-kicker">
          ORGANISING COMMITTEE
        </div>

        <h1>
          Festival <span>Officials.</span>
        </h1>

        <p>
          Meet the faculty coordinators, student convenors,
          and committee leaders behind the festival.
        </p>
      </div>

      {loading ? (
        <div className="empty-state">
          Loading officials...
        </div>
      ) : officials.length === 0 ? (
        <div className="empty-state">
          Organising committee profiles will be published soon.
        </div>
      ) : (
        <div className="officials-grid">
          {officials.map((person) => {
            const phone = getPhoneNumber(person.phone_number)
            const whatsapp = getWhatsAppNumber(person.phone_number)

            return (
              <div className="official-card" key={person.id}>

                {person.photo_url ? (
                  <img
                    src={person.photo_url}
                    alt={person.name}
                    className="official-photo"
                  />
                ) : (
                  <div className="official-avatar">
                    {person.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}

                <span className="badge">
                  {person.designation || 'Committee Member'}
                </span>

                <h3>{person.name}</h3>

                {person.class_name && (
                  <span className="official-dept">
                    {person.class_name}
                  </span>
                )}

                {person.bio && (
                  <p>{person.bio}</p>
                )}

                {phone && (
                  <div className="official-contact">

                    <a
                      href={`tel:${phone}`}
                      className="official-call-btn"
                    >
                      <span>☎</span>
                      Call
                    </a>

                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="official-whatsapp-btn"
                    >
                      <span>◉</span>
                      WhatsApp
                    </a>

                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
