import React from 'react';
import SectionWrapper from './SectionWrapper';

const CITIES_BY_COUNTRY = {
  'Australia':            ['Adelaide', 'Brisbane', 'Canberra', 'Darwin', 'Gold Coast', 'Hobart', 'Melbourne', 'Newcastle', 'Perth', 'Sunshine Coast', 'Sydney', 'Wollongong'],
  'Austria':              ['Graz', 'Innsbruck', 'Linz', 'Salzburg', 'Vienna'],
  'Belgium':              ['Antwerp', 'Bruges', 'Brussels', 'Ghent', 'Liege'],
  'Brazil':               ['Belo Horizonte', 'Brasilia', 'Curitiba', 'Fortaleza', 'Manaus', 'Porto Alegre', 'Recife', 'Rio de Janeiro', 'Salvador', 'Sao Paulo'],
  'Canada':               ['Calgary', 'Edmonton', 'Halifax', 'Montreal', 'Ottawa', 'Quebec City', 'Toronto', 'Vancouver', 'Winnipeg'],
  'Chile':                ['Concepcion', 'Santiago', 'Valparaiso'],
  'China':                ['Beijing', 'Chengdu', 'Guangzhou', 'Hangzhou', 'Nanjing', 'Shanghai', 'Shenzhen', 'Wuhan', "Xi'an"],
  'Colombia':             ['Bogota', 'Cali', 'Medellin'],
  'Czech Republic':       ['Brno', 'Ostrava', 'Prague'],
  'Denmark':              ['Aarhus', 'Copenhagen', 'Odense'],
  'Egypt':                ['Alexandria', 'Cairo', 'Giza'],
  'Finland':              ['Espoo', 'Helsinki', 'Tampere', 'Turku'],
  'France':               ['Bordeaux', 'Lille', 'Lyon', 'Marseille', 'Nice', 'Paris', 'Strasbourg', 'Toulouse'],
  'Germany':              ['Berlin', 'Cologne', 'Dusseldorf', 'Frankfurt', 'Hamburg', 'Munich', 'Stuttgart'],
  'Greece':               ['Athens', 'Thessaloniki'],
  'Hong Kong':            ['Hong Kong'],
  'Hungary':              ['Budapest', 'Debrecen'],
  'India':                ['Ahmedabad', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Mumbai', 'New Delhi', 'Pune'],
  'Indonesia':            ['Bandung', 'Jakarta', 'Medan', 'Surabaya'],
  'Ireland':              ['Cork', 'Dublin', 'Galway', 'Limerick'],
  'Israel':               ['Haifa', 'Jerusalem', 'Tel Aviv'],
  'Italy':                ['Bologna', 'Florence', 'Milan', 'Naples', 'Rome', 'Turin', 'Venice'],
  'Japan':                ['Fukuoka', 'Kyoto', 'Nagoya', 'Osaka', 'Sapporo', 'Tokyo', 'Yokohama'],
  'Kenya':                ['Mombasa', 'Nairobi'],
  'Malaysia':             ['Johor Bahru', 'Kuala Lumpur', 'Penang'],
  'Mexico':               ['Guadalajara', 'Mexico City', 'Monterrey', 'Puebla'],
  'Netherlands':          ['Amsterdam', 'Eindhoven', 'Rotterdam', 'The Hague', 'Utrecht'],
  'New Zealand':          ['Auckland', 'Christchurch', 'Dunedin', 'Wellington'],
  'Nigeria':              ['Abuja', 'Ibadan', 'Lagos', 'Port Harcourt'],
  'Norway':               ['Bergen', 'Oslo', 'Stavanger', 'Trondheim'],
  'Philippines':          ['Cebu City', 'Davao', 'Manila', 'Quezon City'],
  'Poland':               ['Gdansk', 'Krakow', 'Lodz', 'Poznan', 'Warsaw', 'Wroclaw'],
  'Portugal':             ['Lisbon', 'Porto'],
  'Romania':              ['Bucharest', 'Cluj-Napoca', 'Timisoara'],
  'Russia':               ['Moscow', 'Novosibirsk', 'Saint Petersburg'],
  'Saudi Arabia':         ['Jeddah', 'Mecca', 'Medina', 'Riyadh'],
  'Singapore':            ['Singapore'],
  'South Africa':         ['Cape Town', 'Durban', 'Johannesburg', 'Pretoria'],
  'South Korea':          ['Busan', 'Incheon', 'Seoul'],
  'Spain':                ['Barcelona', 'Madrid', 'Malaga', 'Seville', 'Valencia'],
  'Sweden':               ['Gothenburg', 'Malmo', 'Stockholm', 'Uppsala'],
  'Switzerland':          ['Basel', 'Bern', 'Geneva', 'Lausanne', 'Zurich'],
  'Taiwan':               ['Kaohsiung', 'Taichung', 'Taipei'],
  'Thailand':             ['Bangkok', 'Chiang Mai', 'Phuket'],
  'Turkey':               ['Ankara', 'Istanbul', 'Izmir'],
  'United Arab Emirates': ['Abu Dhabi', 'Dubai', 'Sharjah'],
  'United Kingdom':       ['Birmingham', 'Bristol', 'Edinburgh', 'Glasgow', 'Leeds', 'Liverpool', 'London', 'Manchester', 'Newcastle'],
  'United States':        ['Atlanta', 'Austin', 'Boston', 'Chicago', 'Dallas', 'Denver', 'Houston', 'Las Vegas', 'Los Angeles', 'Miami', 'Minneapolis', 'Nashville', 'New York', 'Phoenix', 'Portland', 'San Francisco', 'Seattle', 'Washington DC'],
  'Vietnam':              ['Da Nang', 'Hanoi', 'Ho Chi Minh City'],
};

const ALL_COUNTRIES = Object.keys(CITIES_BY_COUNTRY).sort();

export default function BasicInfoSection({ form, onChange }) {
  const selectedCountry = form.location || '';
  const citySuggestions = CITIES_BY_COUNTRY[selectedCountry] || [];

  function handleCountryChange(country) {
    onChange('location', country);
    // Clear city when country changes so stale values don't linger
    const validCities = CITIES_BY_COUNTRY[country] || [];
    if (form.city && !validCities.includes(form.city)) {
      onChange('city', '');
    }
  }

  return (
    <SectionWrapper title="Basic Info" icon="" defaultOpen={true}>

      {/* Name */}
      <div className="form-row">
        <div className="form-group">
          <label>First Name</label>
          <input
            value={form.first_name || ''}
            onChange={e => onChange('first_name', e.target.value)}
            placeholder="Jane"
          />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input
            value={form.last_name || ''}
            onChange={e => onChange('last_name', e.target.value)}
            placeholder="Smith"
          />
        </div>
      </div>

      {/* Job + Company */}
      <div className="form-row">
        <div className="form-group">
          <label>Job Title</label>
          <input
            value={form.job_title || ''}
            onChange={e => onChange('job_title', e.target.value)}
            placeholder="e.g. Sales Manager"
          />
        </div>
        <div className="form-group">
          <label>Company Name</label>
          <input
            value={form.company_name || ''}
            onChange={e => onChange('company_name', e.target.value)}
            placeholder="e.g. Kimberly-Clark"
          />
        </div>
      </div>

      {/* Contact */}
      <div className="form-row">
        <div className="form-group">
          <label>Email (shown on portfolio)</label>
          <input
            type="email"
            value={form.email || ''}
            onChange={e => onChange('email', e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            value={form.phone || ''}
            onChange={e => onChange('phone', e.target.value)}
            placeholder="+61 400 000 000"
          />
        </div>
      </div>

      {/* Country first, then City — city list is filtered by selected country */}
      <div className="form-row">
        <div className="form-group">
          <label>Country</label>
          <input
            value={selectedCountry}
            onChange={e => handleCountryChange(e.target.value)}
            placeholder="e.g. Australia"
            list="country-suggestions"
            autoComplete="off"
          />
          <datalist id="country-suggestions">
            {ALL_COUNTRIES.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div className="form-group">
          <label>City</label>
          <input
            value={form.city || ''}
            onChange={e => onChange('city', e.target.value)}
            placeholder={selectedCountry ? 'Select a city' : 'Choose a country first'}
            list="city-suggestions"
            autoComplete="off"
            disabled={!selectedCountry}
          />
          <datalist id="city-suggestions">
            {citySuggestions.map(c => <option key={c} value={c} />)}
          </datalist>
          {selectedCountry && citySuggestions.length === 0 && (
            <p className="field-help">Type your city name — no suggestions for this country yet.</p>
          )}
        </div>
      </div>

      {/* University */}
      <div className="form-group">
        <label>University / Education</label>
        <input
          value={form.university || ''}
          onChange={e => onChange('university', e.target.value)}
          placeholder="University of Sydney"
        />
      </div>

      {/* Slug */}
      <div className="form-group">
        <label>Your public portfolio URL</label>
        <div className="slug-input-wrapper">
          <span className="slug-prefix">/p/</span>
          <input
            value={form.slug || ''}
            onChange={e => onChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="jane-smith"
          />
        </div>
        <p className="field-help">
          Lowercase letters, numbers, and hyphens only. This becomes your shareable link.
        </p>
      </div>

      {/* Published toggle */}
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.published ?? true}
            onChange={e => onChange('published', e.target.checked)}
          />
          Portfolio is public — visible to anyone with the link
        </label>
      </div>

    </SectionWrapper>
  );
}
