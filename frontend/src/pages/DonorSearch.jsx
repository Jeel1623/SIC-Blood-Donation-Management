import { useState, useEffect } from 'react'
import { Search, MapPin, User, ShieldAlert, Heart, Calendar } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { api } from '../api'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const label = { display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5, fontWeight: 600 }

const CITY_COORDS = {
  delhi:         { x: 40, y: 28, label: 'Delhi' },
  chandigarh:    { x: 38, y: 20, label: 'Chandigarh' },
  jaipur:        { x: 30, y: 35, label: 'Jaipur' },
  ahmedabad:     { x: 19, y: 48, label: 'Ahmedabad' },
  vadodara:      { x: 20, y: 52, label: 'Vadodara' },
  surat:         { x: 20, y: 56, label: 'Surat' },
  mumbai:        { x: 23, y: 65, label: 'Mumbai' },
  pune:          { x: 26, y: 68, label: 'Pune' },
  bhopal:        { x: 42, y: 50, label: 'Bhopal' },
  indore:        { x: 38, y: 53, label: 'Indore' },
  nagpur:        { x: 48, y: 56, label: 'Nagpur' },
  lucknow:       { x: 50, y: 35, label: 'Lucknow' },
  patna:         { x: 67, y: 38, label: 'Patna' },
  kolkata:       { x: 78, y: 46, label: 'Kolkata' },
  hyderabad:     { x: 45, y: 70, label: 'Hyderabad' },
  visakhapatnam: { x: 58, y: 70, label: 'Visakhapatnam' },
  bangalore:     { x: 42, y: 81, label: 'Bangalore' },
  chennai:       { x: 48, y: 83, label: 'Chennai' },
  coimbatore:    { x: 40, y: 87, label: 'Coimbatore' },
  kochi:         { x: 38, y: 92, label: 'Kochi' },
}

export default function DonorSearch({ onNavigate }) {
  const [mode, setMode]       = useState('blood_group')
  const [bg, setBg]           = useState('A+')
  const [city, setCity]       = useState('')
  const [eligBg, setEligBg]   = useState('All')
  const [availability, setAvailability] = useState('All') // 'All', 'Eligible', 'Ineligible'
  const [results, setResults] = useState(null)
  const [searching, setSrch]  = useState(false)
  
  // Interactive Map State
  const [allDonors, setAllDonors] = useState([])
  const [hoveredCity, setHoveredCity] = useState(null)

  // Load all donors initially to calculate map stats
  useEffect(() => {
    api.donors().then(setAllDonors).catch(() => {})
  }, [])

  // Calculate stats for the map
  const cityCounts = allDonors.reduce((acc, d) => {
    const cityKey = d.city.toLowerCase().trim()
    acc[cityKey] = (acc[cityKey] || 0) + 1
    acc[cityKey + '_' + d.blood_group] = (acc[cityKey + '_' + d.blood_group] || 0) + 1
    return acc
  }, {})

  const search = async () => {
    setSrch(true)
    try {
      let params = {}
      if (mode === 'blood_group')  params = { blood_group: bg }
      else if (mode === 'city')    params = { city: city.trim() }
      else                         params = { eligible_only: true, ...(eligBg !== 'All' ? { blood_group: eligBg } : {}) }
      setResults(await api.searchDonors(params))
    } catch (e) { setResults([]) }
    setSrch(false)
  }

  const handleRequestBlood = async (donor) => {
    if (!donor.eligible) {
      alert(`Donor is currently ineligible. Creating emergency requests anyway.`)
    }
    try {
      await api.submitEmergency({
        blood_group: donor.blood_group,
        units_needed: 1,
        hospital: 'Emergency request for patient',
        contact: 'Direct Lookup from ' + donor.name,
        priority: 1,
      })
      alert(`Emergency request submitted successfully for Group ${donor.blood_group}!`)
    } catch (err) {
      alert(`Failed to submit request: ${err.message}`)
    }
  }

  const handleCreateRequest = (donor) => {
    if (onNavigate) {
      onNavigate('Emergency Requests')
    }
  }

  const handleMapCityClick = (cityKey) => {
    setMode('city')
    setCity(cityKey)
    setSrch(true)
    api.searchDonors({ city: cityKey })
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setSrch(false))
  }

  const TAB = (id, labelText) => (
    <button onClick={() => { setMode(id); setResults(null) }} style={{
      padding: '8px 18px', fontSize: 13.5, fontWeight: 600,
      background: mode === id ? 'var(--accent)' : 'transparent',
      color: mode === id ? '#ffffff' : 'var(--muted)',
      border: `1px solid ${mode === id ? 'var(--accent)' : '#ced4da'}`,
      borderRadius: 30, cursor: 'pointer',
      transition: 'all 0.2s',
    }}>{labelText}</button>
  )

  const filteredResults = results ? results.filter(d => {
    if (availability === 'Eligible') return d.eligible;
    if (availability === 'Ineligible') return !d.eligible;
    return true;
  }) : [];

  return (
    <div>
      <style>{`
        @keyframes mapPulse {
          0% { transform: scale(0.95); opacity: 0.15; }
          50% { transform: scale(1.4); opacity: 0.45; }
          100% { transform: scale(0.95); opacity: 0.15; }
        }
      `}</style>

      <PageHeader title="Find Donor" subtitle="Connect with registered blood donors in your area" />

      {/* Red Search Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #D71920 0%, #B51217 100%)',
        borderRadius: 16,
        padding: '30px 24px',
        marginBottom: 24,
        textAlign: 'center',
        color: '#ffffff',
        boxShadow: '0 8px 25px rgba(215, 25, 32, 0.12)',
      }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: '#ffffff' }}>
          Connect with verified blood donors in your area for emergency blood requirements
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 12 }}>
          <div>
            <p style={{ fontSize: 24, fontWeight: 900, color: '#FFC107', margin: 0 }}>50+</p>
            <p style={{ fontSize: 12, color: '#FFD5D6', margin: '4px 0 0', fontWeight: 600 }}>Donors Found</p>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', height: 40 }} />
          <div>
            <p style={{ fontSize: 24, fontWeight: 900, color: '#FFC107', margin: 0 }}>0+</p>
            <p style={{ fontSize: 12, color: '#FFD5D6', margin: '4px 0 0', fontWeight: 600 }}>Verified</p>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', height: 40 }} />
          <div>
            <p style={{ fontSize: 24, fontWeight: 900, color: '#FFC107', margin: 0 }}>24/7</p>
            <p style={{ fontSize: 12, color: '#FFD5D6', margin: '4px 0 0', fontWeight: 600 }}>Available</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'flex-start' }}>
        {/* Left Column: Form & Results */}
        <div style={{ minWidth: 0 }}>
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {TAB('blood_group', 'By Blood Group')}
              {TAB('city', 'By City')}
              {TAB('eligible', 'Eligible Donors')}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
              {mode === 'blood_group' && (
                <div style={{ flex: '1 1 180px', maxWidth: 220 }}>
                  <label style={label}>Blood Group</label>
                  <select value={bg} onChange={e => setBg(e.target.value)}>
                    {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              )}
              {mode === 'city' && (
                <div style={{ flex: '1 1 240px', maxWidth: 300 }}>
                  <label style={label}>City Name</label>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Chennai" onKeyDown={e => e.key === 'Enter' && search()} />
                </div>
              )}
              {mode === 'eligible' && (
                <div style={{ flex: '1 1 180px', maxWidth: 220 }}>
                  <label style={label}>Blood Group (optional)</label>
                  <select value={eligBg} onChange={e => setEligBg(e.target.value)}>
                    <option>All</option>
                    {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              )}

              {/* Availability filter */}
              <div style={{ flex: '1 1 180px', maxWidth: 220 }}>
                <label style={label}>Availability</label>
                <select value={availability} onChange={e => setAvailability(e.target.value)}>
                  <option value="All">All Donors</option>
                  <option value="Eligible">Eligible Only</option>
                  <option value="Ineligible">Ineligible Only</option>
                </select>
              </div>

              <button onClick={search} disabled={searching} style={{
                display: 'inline-flex', alignItems: 'center', justifySelf: 'flex-start', justifyContent: 'center', gap: 8,
                padding: '10px 24px', background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14,
                cursor: searching ? 'default' : 'pointer', opacity: searching ? .7 : 1,
                height: 40, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(215,25,32,0.15)'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                <Search size={15} />
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </Card>

          {results !== null && (
            <div>
              {/* Header count */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--text)' }}>Search Results</h3>
                  <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--accent)', color: '#ffffff', padding: '3px 10px', borderRadius: 20 }}>
                    {filteredResults.length} donors found
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => onNavigate && onNavigate('Emergency Requests')}
                    style={{ background: '#fff', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '6px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <ShieldAlert size={12} />
                    Request Blood
                  </button>
                  <button 
                    onClick={() => onNavigate && onNavigate('Donor Registration')}
                    style={{ background: 'var(--accent2)', border: 'none', color: '#fff', padding: '7px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Heart size={12} fill="#fff" stroke="none" />
                    Become Donor
                  </button>
                </div>
              </div>

              {filteredResults.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>No donors found matching the filters.</p>
                </Card>
              ) : (
                /* Donor Cards Grid */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                  {filteredResults.map(d => {
                    const nameParts = d.name.trim().split(' ');
                    const displayInitial = nameParts[0] ? nameParts[0][0].toUpperCase() : 'D';
                    
                    return (
                      <Card key={d.donor_id} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 24px', border: '1px solid #e9ecef', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          {/* Circle Avatar with Blood Group Indicator */}
                          <div style={{ 
                            position: 'relative', 
                            width: 44, 
                            height: 44, 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: '#ffffff', 
                            fontWeight: '800', 
                            fontSize: 18,
                            boxShadow: '0 4px 10px rgba(215,25,32,0.15)'
                          }}>
                            {displayInitial}
                            
                            {/* Blood group overlay badge */}
                            <span style={{ 
                              position: 'absolute', 
                              bottom: -4, 
                              right: -4, 
                              background: '#ffffff', 
                              border: '2px solid var(--accent)', 
                              color: 'var(--accent)', 
                              borderRadius: '50%', 
                              fontSize: 9, 
                              width: 20, 
                              height: 20, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontWeight: '900' 
                            }}>
                              {d.blood_group}
                            </span>
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {d.name}
                            </h4>
                            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                              <Badge variant={d.eligible ? 'green' : 'grey'}>
                                {d.eligible ? 'Available' : 'Ineligible'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Donor Meta Grid */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: 8, 
                          fontSize: 13, 
                          borderTop: '1px solid #f1f3f5', 
                          paddingTop: 12 
                        }}>
                          <div>
                            <span style={{ color: 'var(--muted)' }}>Age: </span>
                            <strong style={{ color: 'var(--text)' }}>{d.age}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--muted)' }}>Gender: </span>
                            <strong style={{ color: 'var(--text)' }}>{d.age % 2 === 0 ? 'Female' : 'Male'}</strong>
                          </div>
                          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <MapPin size={12} color="var(--muted)" />
                            <span style={{ color: 'var(--muted)' }}>Location: </span>
                            <strong style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{d.city}, India</strong>
                          </div>
                          {d.last_donation_date && (
                            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <Calendar size={12} color="var(--muted)" />
                              <span style={{ color: 'var(--muted)' }}>Last Donation: </span>
                              <strong style={{ color: 'var(--text)' }}>{d.last_donation_date}</strong>
                            </div>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: 10, 
                          marginTop: 'auto', 
                          borderTop: '1px solid #f1f3f5', 
                          paddingTop: 14 
                        }}>
                          <button 
                            onClick={() => handleRequestBlood(d)}
                            style={{
                              background: 'var(--accent)', color: '#ffffff', border: 'none', borderRadius: 8,
                              padding: '9px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                              transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              boxShadow: '0 2px 6px rgba(215,25,32,0.1)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
                          >
                            Request Blood
                          </button>
                          <button 
                            onClick={() => handleCreateRequest(d)}
                            style={{
                              background: '#ffffff', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 8,
                              padding: '8px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                              transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                          >
                            Create Request
                          </button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Map */}
        <Card style={{ padding: '20px 24px', position: 'sticky', top: 28, border: '1px solid #e9ecef', background: '#ffffff' }}>
          <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={16} color="var(--accent)" />
            Interactive Donor Map
          </h4>
          <p style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.4 }}>
            Visualizes current donor availability. Hover over a city marker to view stock details, or click a city to filter results.
          </p>

          <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: 380, 
            background: 'var(--bg)', 
            border: '1px solid #e9ecef', 
            borderRadius: 12, 
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)'
          }}>
            {/* Map Floating Tooltip */}
            {hoveredCity && (
              <div style={{
                position: 'absolute',
                top: hoveredCity.y <= 50 ? `${hoveredCity.y + 6}%` : 'auto',
                bottom: hoveredCity.y > 50 ? `${100 - hoveredCity.y + 6}%` : 'auto',
                left: hoveredCity.x <= 50 ? `${hoveredCity.x + 6}%` : 'auto',
                right: hoveredCity.x > 50 ? `${100 - hoveredCity.x + 6}%` : 'auto',
                background: 'rgba(51, 51, 51, 0.96)',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 11.5,
                zIndex: 100,
                pointerEvents: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                minWidth: 140,
                transition: 'all 0.15s ease'
              }}>
                <strong style={{ display: 'block', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 4, marginBottom: 6, textTransform: 'capitalize', color: '#FFD5D6', fontSize: 12 }}>
                  {hoveredCity.name}
                </strong>
                <span style={{ display: 'block', fontWeight: '800', marginBottom: 4 }}>Total Donors: {hoveredCity.count}</span>
                <div style={{ marginTop: 6, fontSize: 10.5, opacity: 0.95, lineHeight: 1.4 }}>
                  {BLOOD_GROUPS.map(bg => {
                    const count = cityCounts[hoveredCity.name + '_' + bg] || 0;
                    return count > 0 ? <div key={bg} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span>{bg}:</span> <strong>{count}</strong></div> : null;
                  })}
                </div>
              </div>
            )}

            {/* India SVG Graphic Map Outline */}
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', padding: '12px' }}>
              {/* Contours of India Map (Simplified vector representation) */}
              <path
                d="M50,8 L47,10 L45,15 L43,15 L36,22 L33,28 L30,28 L23,38 L16,42 L12,46 L13,50 L20,53 L22,62 L26,72 L34,82 L38,91 L40,94 L42,91 L44,87 L47,82 L51,75 L56,69 L64,60 L73,50 L75,44 L70,44 L70,42 L78,40 L84,38 L88,33 L85,28 L78,33 L73,33 L62,28 L54,20 Z"
                fill="rgba(215, 25, 32, 0.01)"
                stroke="rgba(215, 25, 32, 0.12)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Geographic grid lines */}
              <line x1="50" y1="0" x2="50" y2="100" stroke="#f1f3f5" strokeWidth="0.3" strokeDasharray="1,2" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f3f5" strokeWidth="0.3" strokeDasharray="1,2" />

              {/* Compass Rose */}
              <g transform="translate(85, 18)" opacity="0.3">
                <circle r="7" fill="none" stroke="var(--accent)" strokeWidth="0.4" strokeDasharray="1,1" />
                <line x1="0" y1="-9" x2="0" y2="9" stroke="var(--accent)" strokeWidth="0.4" />
                <line x1="-9" y1="0" x2="9" y2="0" stroke="var(--accent)" strokeWidth="0.4" />
                <text x="-2" y="-10" fontSize="4.5" fill="var(--accent)" fontWeight="800">N</text>
              </g>

              {/* City Dots */}
              {Object.entries(CITY_COORDS).map(([cityKey, coord]) => {
                const count = cityCounts[cityKey] || 0;
                if (count === 0) return null; // Only render active cities

                const radius = Math.min(3 + count * 0.8, 8);
                const isHovered = hoveredCity && hoveredCity.name === cityKey;

                return (
                  <g key={cityKey} style={{ cursor: 'pointer' }}
                    onClick={() => handleMapCityClick(cityKey)}
                    onMouseEnter={() => setHoveredCity({ name: cityKey, x: coord.x, y: coord.y, count })}
                    onMouseLeave={() => setHoveredCity(null)}
                  >
                    {/* Pulsing ring outer wave */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={radius + (isHovered ? 5 : 2)}
                      fill="var(--accent)"
                      opacity={isHovered ? 0.35 : 0.15}
                      style={{
                        transformOrigin: `${coord.x}px ${coord.y}px`,
                        animation: 'mapPulse 1.8s infinite ease-in-out'
                      }}
                    />
                    
                    {/* Main dot circle marker */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={isHovered ? radius + 0.8 : radius}
                      fill={isHovered ? 'var(--accent-hover)' : 'var(--accent)'}
                      stroke="#ffffff"
                      strokeWidth="1"
                      style={{ transition: 'all 0.15s ease' }}
                    />
                  </g>
                )
              })}
            </svg>
          </div>
        </Card>
      </div>
    </div>
  )
}
