import streamlit as st
from datetime import date
from collections import Counter
from streamlit_option_menu import option_menu

from services.donor_service import DonorService
from services.inventory_service import InventoryService
from services.emergency_service import EmergencyService
from services.history_service import HistoryService
from analytics.dashboard import (
    blood_group_distribution_chart,
    inventory_status_chart,
    monthly_donations_chart,
)

st.set_page_config(
    page_title="SIC Blood Donation Management",
    page_icon="assets/icon.png" if False else None,
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ────────────────────────────────────────────────────────────────

st.markdown("""
<style>
/* ── Sidebar base ── */
[data-testid="stSidebar"] {
    background: #ffffff;
    border-right: 1px solid #e9ecef;
}
[data-testid="stSidebar"] * { color: #333333 !important; }
[data-testid="stSidebar"] hr { border-color: #e9ecef; }

/* ── option_menu overrides ── */
.nav-link         { color: #495057 !important; border-radius: 8px !important; }
.nav-link:hover   { background: #fff5f5 !important; color: #D71920 !important; }
.nav-link.active  { background: #D71920 !important; color: #fff !important; }
.nav-link-label   { font-size: 14px; font-weight: 600; }
.nav-link .icon   { font-size: 18px; }

/* ── Metric cards ── */
[data-testid="stMetric"] {
    background: #ffffff;
    border: 1px solid #e9ecef;
    border-top: 4px solid #D71920;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}
[data-testid="stMetricValue"] { color: #D71920; font-weight: 800; }
[data-testid="stMetricLabel"] { color: #6c757d; font-size: 13px; font-weight: 600; }

/* ── Primary buttons ── */
.stButton > button {
    background: #D71920;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    padding: 10px 24px;
    transition: background 0.2s;
    box-shadow: 0 4px 12px rgba(215,25,32,0.15);
}
.stButton > button:hover { background: #B51217; color: white; }

/* ── Form submit buttons ── */
[data-testid="stFormSubmitButton"] > button {
    background: #D71920;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(215,25,32,0.15);
}
[data-testid="stFormSubmitButton"] > button:hover { background: #B51217; }

/* ── Page title accent ── */
h1 { border-bottom: 3px solid #D71920; padding-bottom: 8px; color: #333333; font-weight: 800; }

/* ── Card container ── */
.info-card {
    background: #ffffff;
    border: 1px solid #e9ecef;
    border-top: 3px solid #D71920;
    border-radius: 12px;
    padding: 18px 22px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
</style>
""", unsafe_allow_html=True)


# ── Services ──────────────────────────────────────────────────────────────────

def _init_services():
    if "donor_svc" not in st.session_state:
        st.session_state.donor_svc = DonorService()
    if "inventory_svc" not in st.session_state:
        st.session_state.inventory_svc = InventoryService()
    if "emergency_svc" not in st.session_state:
        st.session_state.emergency_svc = EmergencyService(st.session_state.inventory_svc)
    if "history_svc" not in st.session_state:
        st.session_state.history_svc = HistoryService()


_init_services()

donor_svc: DonorService         = st.session_state.donor_svc
inventory_svc: InventoryService = st.session_state.inventory_svc
emergency_svc: EmergencyService = st.session_state.emergency_svc
history_svc: HistoryService     = st.session_state.history_svc


# ── Sidebar navigation ────────────────────────────────────────────────────────

with st.sidebar:
    st.markdown(
        "<h2 style='text-align:center; color:#D71920; margin-bottom:4px; font-weight:800; font-size:22px;'>"
        "Blood Donation</h2>"
        "<p style='text-align:center; color:#333333; font-size:12px; margin-top:0; font-weight:700;'>"
        "Management System</p>",
        unsafe_allow_html=True,
    )
    st.markdown("---")

    page = option_menu(
        menu_title=None,
        options=[
            "Home",
            "Donor Registration",
            "Find Donor",
            "Blood Inventory",
            "Emergency Requests",
            "Donation History",
            "Analytics",
        ],
        icons=[
            "grid-1x2",
            "person-plus",
            "search",
            "droplet-fill",
            "exclamation-triangle",
            "clock-history",
            "bar-chart-line",
        ],
        default_index=0,
        styles={
            "container":    {"background-color": "transparent", "padding": "0"},
            "icon":         {"color": "#6c757d", "font-size": "16px"},
            "nav-link":     {
                "color": "#495057",
                "font-size": "13.5px",
                "font-weight": "600",
                "border-radius": "8px",
                "--hover-color": "#fff5f5",
            },
            "nav-link-selected": {
                "background-color": "#D71920",
                "color": "#ffffff",
                "font-weight": "600",
            },
        },
    )

    st.markdown("---")

    # Live stats
    all_donors   = donor_svc.all_donors()
    eligible_cnt = sum(1 for d in all_donors if d.is_eligible())
    total_units  = sum(i.available_units for i in inventory_svc.get_valid_inventory())
    queue_cnt    = emergency_svc.queue_size()

    st.markdown(f"""
<div style="font-size:13px; color:#6c757d; line-height:2.2; padding: 0 8px;">
  <b style="color:#333333; font-size:14px; display:block; margin-bottom:6px;">System Status</b>
  Total Donors &nbsp;&nbsp;&nbsp; <b style="color:#D71920; font-size:14px;">{len(all_donors)}</b><br>
  Eligible Now &nbsp;&nbsp;&nbsp; <b style="color:#198754; font-size:14px;">{eligible_cnt}</b><br>
  Blood Units &nbsp;&nbsp;&nbsp;&nbsp; <b style="color:#333333; font-size:14px;">{total_units}</b><br>
  Queue &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b style="color:{'#D71920' if queue_cnt else '#333333'}; font-size:14px;">{queue_cnt}</b>
</div>
""", unsafe_allow_html=True)

    st.markdown("---")
    st.markdown(
        "<p style='text-align:center; color:#999999; font-size:11px;'>"
        "SIC Hackathon 2026</p>",
        unsafe_allow_html=True,
    )


# ── Helpers ───────────────────────────────────────────────────────────────────

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

def _eligibility_badge(eligible: bool) -> str:
    return "Eligible" if eligible else "Ineligible"

def _priority_label(p: int) -> str:
    return {1: "Critical", 2: "Urgent", 3: "Normal"}.get(p, str(p))


# ── Page: Overview ────────────────────────────────────────────────────────────

def _page_overview():
    st.title("Overview")
    st.markdown("Real-time summary of the blood bank system.")

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Donors",          len(all_donors))
    c2.metric("Eligible to Donate",    eligible_cnt)
    c3.metric("Blood Units Available", total_units)
    c4.metric("Emergency Queue",       queue_cnt,
              delta="Action needed" if queue_cnt else "All clear",
              delta_color="inverse" if queue_cnt else "off")

    st.markdown("---")

    col_left, col_right = st.columns(2)

    with col_left:
        st.subheader("Donor Blood Group Breakdown")
        counts = Counter(d.blood_group for d in all_donors)
        for bg in BLOOD_GROUPS:
            cnt = counts.get(bg, 0)
            col_a, col_b, col_c = st.columns([1, 1, 4])
            col_a.markdown(f"**{bg}**")
            col_b.markdown(str(cnt))
            col_c.progress(cnt / max(counts.values(), default=1))

    with col_right:
        st.subheader("Inventory Quick View")
        inventory = inventory_svc.get_inventory()
        max_units = max((i.available_units for i in inventory), default=1)
        for item in sorted(inventory, key=lambda x: x.available_units):
            status = "Expired" if item.is_expired() else ("Low" if item.available_units < 10 else "OK")
            label  = f"{item.blood_group}  [{status}]"
            col_a, col_b, col_c = st.columns([1, 1, 4])
            col_a.markdown(f"**{label}**")
            col_b.markdown(f"{item.available_units} u")
            col_c.progress(item.available_units / max_units)

    st.markdown("---")
    st.subheader("Recent Donations")
    recent = history_svc.recent_donations(5)
    if recent:
        st.dataframe(
            [{"Date": r.donation_date, "Donor": r.donor_id,
              "Units": r.units_donated, "Recipient": r.recipient_details}
             for r in recent],
            use_container_width=True,
            column_config={
                "Units": st.column_config.NumberColumn("Units", format="%d units"),
                "Date":  st.column_config.DateColumn("Date", format="DD MMM YYYY"),
            },
        )
    else:
        st.info("No donations recorded yet.")


# ── Page: Donor Registration ──────────────────────────────────────────────────

def _page_donor_registration():
    st.title("Register Donor")

    with st.form("register_donor"):
        col1, col2 = st.columns(2)
        name          = col1.text_input("Full Name")
        age           = col2.number_input("Age", min_value=18, max_value=65, value=25, step=1)
        blood_group   = col1.selectbox("Blood Group", BLOOD_GROUPS)
        city          = col2.text_input("City")
        last_donation = col1.date_input("Last Donation Date (leave blank if first-time)", value=None)
        submitted     = st.form_submit_button("Register Donor")

    if submitted:
        if not name.strip() or not city.strip():
            st.error("Name and City are required.")
        else:
            last_str = last_donation.isoformat() if last_donation else None
            donor = donor_svc.register(name.strip(), int(age), blood_group, city.strip(), last_str)
            st.success(f"Registered {donor.name} successfully. Donor ID: {donor.donor_id}")

    st.divider()
    st.subheader("All Registered Donors")
    donors = donor_svc.all_donors()
    if donors:
        rows = [{
            "ID":            d.donor_id,
            "Name":          d.name,
            "Age":           d.age,
            "Blood Group":   d.blood_group,
            "City":          d.city.title(),
            "Last Donation": d.last_donation_date or "—",
            "Eligible":      _eligibility_badge(d.is_eligible()),
        } for d in donors]
        st.dataframe(
            rows,
            use_container_width=True,
            column_config={"Age": st.column_config.NumberColumn("Age", format="%d yrs")},
        )
        st.caption(f"{len(donors)} donor(s) registered")
    else:
        st.info("No donors registered yet.")


# ── Page: Donor Search ────────────────────────────────────────────────────────

# ── Page: Donor Search ────────────────────────────────────────────────────────

def _page_donor_search():
    import streamlit.components.v1 as components
    import json
    st.title("Find Donors")
    st.markdown("Connect with registered blood donors in your area.")

    # Red Search Header Banner
    st.markdown("""
    <div style="background: linear-gradient(135deg, #D71920 0%, #B51217 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center; color: white; box-shadow: 0 8px 25px rgba(215, 25, 32, 0.12);">
        <h3 style="font-size: 20px; font-weight: 850; margin-bottom: 12px; color: white; border: none; padding: 0;">
            Connect with verified blood donors in your area for emergency blood requirements
        </h3>
        <div style="display: flex; justify-content: center; gap: 40px; margin-top: 12px;">
            <div>
                <p style="font-size: 24px; font-weight: 900; color: #FFC107; margin: 0;">50+</p>
                <p style="font-size: 12px; color: #FFD5D6; margin: 4px 0 0; font-weight: 600;">Donors Found</p>
            </div>
            <div style="border-left: 1px solid rgba(255,255,255,0.2); height: 40px;"></div>
            <div>
                <p style="font-size: 24px; font-weight: 900; color: #FFC107; margin: 0;">100%</p>
                <p style="font-size: 12px; color: #FFD5D6; margin: 4px 0 0; font-weight: 600;">Verified</p>
            </div>
            <div style="border-left: 1px solid rgba(255,255,255,0.2); height: 40px;"></div>
            <div>
                <p style="font-size: 24px; font-weight: 900; color: #FFC107; margin: 0;">24/7</p>
                <p style="font-size: 12px; color: #FFD5D6; margin: 4px 0 0; font-weight: 600;">Available</p>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    col_left, col_right = st.columns([5, 4])

    with col_left:
        search_mode = st.radio("Search by", ["Blood Group", "City", "Eligible Donors"], horizontal=True)

        results = []
        if search_mode == "Blood Group":
            bg = st.selectbox("Blood Group", BLOOD_GROUPS)
            results = donor_svc.search_by_blood_group(bg)

        elif search_mode == "City":
            city = st.text_input("City name")
            results = donor_svc.search_by_city(city) if city.strip() else []

        else:
            col1, col2 = st.columns([1, 2])
            bg_filter = col1.selectbox("Blood Group (optional)", ["All"] + BLOOD_GROUPS)
            blood_group_arg = None if bg_filter == "All" else bg_filter
            results = donor_svc.search_eligible_donors(blood_group_arg)
            col2.caption("Donors who last donated 90+ days ago, sorted oldest-donation first.")

        if results:
            rows = [{
                "ID":            d.donor_id,
                "Name":          d.name,
                "Age":           d.age,
                "Blood Group":   d.blood_group,
                "City":          d.city.title(),
                "Last Donation": d.last_donation_date or "Never",
                "Status":        _eligibility_badge(d.is_eligible()),
            } for d in results]
            st.dataframe(
                rows,
                use_container_width=True,
                column_config={"Age": st.column_config.NumberColumn("Age", format="%d yrs")},
            )
            st.caption(f"{len(results)} donor(s) found.")
        else:
            st.info("No donors found for the given criteria.")

    with col_right:
        st.markdown("""
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-top: 3px solid #D71920; border-radius: 12px; padding: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <h4 style="font-size: 15px; font-weight: 800; color: #333333; margin: 0 0 4px 0; display: flex; align-items: center; gap: 6px;">
                📍 Interactive Donor Map
            </h4>
            <p style="font-size: 11.5px; color: #6c757d; margin: 0 0 16px 0; line-height: 1.4;">
                Visualizes current donor availability. Hover over a city marker to view stock details.
            </p>
        </div>
        """, unsafe_allow_html=True)

        # Calculate map data from python
        all_donors = donor_svc.all_donors()
        city_counts = {}
        city_bg_counts = {}
        for d in all_donors:
            ck = d.city.lower().strip()
            city_counts[ck] = city_counts.get(ck, 0) + 1
            bg_key = f"{ck}_{d.blood_group}"
            city_bg_counts[bg_key] = city_bg_counts.get(bg_key, 0) + 1

        CITY_COORDS = {
            "delhi":         {"x": 40, "y": 28, "label": "Delhi"},
            "chandigarh":    {"x": 38, "y": 20, "label": "Chandigarh"},
            "jaipur":        {"x": 30, "y": 35, "label": "Jaipur"},
            "ahmedabad":     {"x": 19, "y": 48, "label": "Ahmedabad"},
            "vadodara":      {"x": 20, "y": 52, "label": "Vadodara"},
            "surat":         {"x": 20, "y": 56, "label": "Surat"},
            "mumbai":        {"x": 23, "y": 65, "label": "Mumbai"},
            "pune":          {"x": 26, "y": 68, "label": "Pune"},
            "bhopal":        {"x": 42, "y": 50, "label": "Bhopal"},
            "indore":        {"x": 38, "y": 53, "label": "Indore"},
            "nagpur":        {"x": 48, "y": 56, "label": "Nagpur"},
            "lucknow":       {"x": 50, "y": 35, "label": "Lucknow"},
            "patna":         {"x": 67, "y": 38, "label": "Patna"},
            "kolkata":       {"x": 78, "y": 46, "label": "Kolkata"},
            "hyderabad":     {"x": 45, "y": 70, "label": "Hyderabad"},
            "visakhapatnam": {"x": 58, "y": 70, "label": "Visakhapatnam"},
            "bangalore":     {"x": 42, "y": 81, "label": "Bangalore"},
            "chennai":       {"x": 48, "y": 83, "label": "Chennai"},
            "coimbatore":    {"x": 40, "y": 87, "label": "Coimbatore"},
            "kochi":         {"x": 38, "y": 92, "label": "Kochi"},
        }

        # Build list of active cities with coordinates and stats
        active_cities_js = []
        for city_key, coords in CITY_COORDS.items():
            cnt = city_counts.get(city_key, 0)
            if cnt > 0:
                # Get breakdown of blood groups
                breakdown = []
                for bg in BLOOD_GROUPS:
                    bg_cnt = city_bg_counts.get(f"{city_key}_{bg}", 0)
                    if bg_cnt > 0:
                        breakdown.append(f"{bg}: {bg_cnt}")
                breakdown_str = ", ".join(breakdown)
                active_cities_js.append({
                    "name": coords["label"],
                    "key": city_key,
                    "x": coords["x"],
                    "y": coords["y"],
                    "count": cnt,
                    "breakdown": breakdown_str
                })

        # Inject HTML string into st.components
        html_code = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    margin: 0;
                    padding: 0;
                    background-color: #f8f9fa;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    overflow: hidden;
                }}
                .map-container {{
                    position: relative;
                    width: 100%;
                    height: 380px;
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 12px;
                    overflow: hidden;
                    box-sizing: border-box;
                }}
                @keyframes mapPulse {{
                    0% {{ transform: scale(0.95); opacity: 0.15; }}
                    50% {{ transform: scale(1.4); opacity: 0.45; }}
                    100% {{ transform: scale(0.95); opacity: 0.15; }}
                }}
                .pulsing-ring {{
                    animation: mapPulse 1.8s infinite ease-in-out;
                }}
                .city-group {{
                    cursor: pointer;
                }}
                /* Tooltip styles */
                .tooltip {{
                    position: absolute;
                    background: rgba(51, 51, 51, 0.96);
                    color: #ffffff;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 11px;
                    z-index: 100;
                    pointer-events: none;
                    display: none;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
                    min-width: 130px;
                }}
                .tooltip strong {{
                    display: block;
                    border-bottom: 1px solid rgba(255,255,255,0.2);
                    padding-bottom: 4px;
                    margin-bottom: 6px;
                    color: #FFD5D6;
                    font-size: 12px;
                    text-transform: capitalize;
                }}
            </style>
        </head>
        <body>
            <div class="map-container">
                <div id="tooltip" class="tooltip"></div>
                <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; padding: 12px; box-sizing: border-box;">
                    <!-- Contours of India Map -->
                    <path
                        d="M50,8 L47,10 L45,15 L43,15 L36,22 L33,28 L30,28 L23,38 L16,42 L12,46 L13,50 L20,53 L22,62 L26,72 L34,82 L38,91 L40,94 L42,91 L44,87 L47,82 L51,75 L56,69 L64,60 L73,50 L75,44 L70,44 L70,42 L78,40 L84,38 L88,33 L85,28 L78,33 L73,33 L62,28 L54,20 Z"
                        fill="rgba(215, 25, 32, 0.01)"
                        stroke="rgba(215, 25, 32, 0.15)"
                        stroke-width="0.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />

                    <!-- Compass -->
                    <g transform="translate(85, 18)" opacity="0.3">
                        <circle r="7" fill="none" stroke="#D71920" stroke-width="0.3" stroke-dasharray="1,1" />
                        <line x1="0" y1="-9" x2="0" y2="9" stroke="#D71920" stroke-width="0.3" />
                        <line x1="-9" y1="0" x2="9" y2="0" stroke="#D71920" stroke-width="0.3" />
                        <text x="-2" y="-10" font-size="4" fill="#D71920" font-weight="800">N</text>
                    </g>
                    
                    <!-- Grid Lines -->
                    <line x1="50" y1="0" x2="50" y2="100" stroke="#e9ecef" stroke-width="0.2" stroke-dasharray="1,2" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#e9ecef" stroke-width="0.2" stroke-dasharray="1,2" />

                    <!-- Render active city markers -->
                    <g id="markers-group"></g>
                </svg>
            </div>

            <script>
                const cities = {json.dumps(active_cities_js)};
                const markersGroup = document.getElementById('markers-group');
                const tooltip = document.getElementById('tooltip');
                const container = document.querySelector('.map-container');

                cities.forEach(city => {{
                    const radius = Math.min(3 + city.count * 0.8, 8);

                    // Create group
                    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    g.setAttribute('class', 'city-group');

                    // Pulsing circle
                    const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    pulse.setAttribute('cx', city.x);
                    pulse.setAttribute('cy', city.y);
                    pulse.setAttribute('r', radius + 3);
                    pulse.setAttribute('fill', '#D71920');
                    pulse.setAttribute('opacity', '0.15');
                    pulse.setAttribute('class', 'pulsing-ring');
                    pulse.style.transformOrigin = city.x + 'px ' + city.y + 'px';
                    g.appendChild(pulse);

                    // Main dot
                    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    dot.setAttribute('cx', city.x);
                    dot.setAttribute('cy', city.y);
                    dot.setAttribute('r', radius);
                    dot.setAttribute('fill', '#D71920');
                    dot.setAttribute('stroke', '#ffffff');
                    dot.setAttribute('stroke-width', '0.8');
                    g.appendChild(dot);

                    // Hover events
                    g.addEventListener('mouseenter', (e) => {{
                        tooltip.style.display = 'block';
                        tooltip.innerHTML = `<strong>${{city.name}}</strong>` +
                                            `<div>Donors: ${{city.count}}</div>` +
                                            `<div style="font-size:9.5px; opacity:0.85; margin-top:4px;">${{city.breakdown}}</div>`;
                        
                        // Position tooltip relative to container
                        const rect = container.getBoundingClientRect();
                        const xPos = (city.x / 100) * rect.width;
                        const yPos = (city.y / 100) * rect.height;

                        if (city.x > 50) {{
                            tooltip.style.left = 'auto';
                            tooltip.style.right = (rect.width - xPos + 10) + 'px';
                        }} else {{
                            tooltip.style.right = 'auto';
                            tooltip.style.left = (xPos + 10) + 'px';
                        }}

                        if (city.y > 50) {{
                            tooltip.style.top = 'auto';
                            tooltip.style.bottom = (rect.height - yPos + 10) + 'px';
                        }} else {{
                            tooltip.style.bottom = 'auto';
                            tooltip.style.top = (yPos + 10) + 'px';
                        }}
                    }});

                    g.addEventListener('mouseleave', () => {{
                        tooltip.style.display = 'none';
                    }});

                    g.addEventListener('click', () => {{
                        // Alert user/hint click action
                        alert('Selected ' + city.name + '. Please enter this in the "City Name" search box to filter results!');
                    }});

                    markersGroup.appendChild(g);
                }});
            </script>
        </body>
        </html>
        """
        components.html(html_code, height=400)


# ── Page: Blood Inventory ─────────────────────────────────────────────────────

def _page_inventory():
    st.title("Blood Inventory")

    col_form, col_status = st.columns(2)

    with col_form:
        st.subheader("Add / Update Units")
        with st.form("add_inventory"):
            bg     = st.selectbox("Blood Group", BLOOD_GROUPS, key="inv_bg")
            units  = st.number_input("Units to Add", min_value=1, value=10, step=1)
            expiry = st.date_input("Expiry Date",
                                   value=date.today().replace(year=date.today().year + 1))
            add_submitted = st.form_submit_button("Add Units")

        if add_submitted:
            item = inventory_svc.add_units(bg, int(units), expiry.isoformat())
            st.success(f"{bg}: {item.available_units} units available. Expires {item.expiry_date}.")

    with col_status:
        st.subheader("Stock Level Overview")
        all_items = inventory_svc.get_inventory()
        if all_items:
            max_u = max(i.available_units for i in all_items)
            for item in sorted(all_items, key=lambda x: x.available_units, reverse=True):
                expired = item.is_expired()
                low     = item.available_units < 10
                tag     = " [EXPIRED]" if expired else (" [LOW]" if low else "")
                st.markdown(f"**{item.blood_group}**{tag} — {item.available_units} units")
                st.progress(item.available_units / max(max_u, 1))
        else:
            st.info("No inventory yet.")

    st.divider()
    st.subheader("Full Inventory Table")
    all_items = inventory_svc.get_inventory()
    if all_items:
        rows = []
        for item in sorted(all_items, key=lambda x: x.blood_group):
            expired = item.is_expired()
            low     = item.available_units < 10
            status  = "Expired" if expired else ("Low Stock" if low else "OK")
            rows.append({
                "Blood Group":     item.blood_group,
                "Available Units": item.available_units,
                "Expiry Date":     item.expiry_date,
                "Status":          status,
            })
        st.dataframe(
            rows,
            use_container_width=True,
            column_config={
                "Available Units": st.column_config.ProgressColumn(
                    "Available Units",
                    min_value=0,
                    max_value=max(i.available_units for i in all_items),
                    format="%d units",
                ),
                "Expiry Date": st.column_config.DateColumn("Expiry Date", format="DD MMM YYYY"),
            },
        )


# ── Page: Emergency Requests ──────────────────────────────────────────────────

def _page_emergency():
    st.title("Emergency Blood Requests")

    col_form, col_queue = st.columns(2)

    with col_form:
        st.subheader("Submit Request")
        with st.form("emergency_form"):
            bg             = st.selectbox("Blood Group Needed", BLOOD_GROUPS, key="emg_bg")
            units          = st.number_input("Units Needed", min_value=1, value=2, step=1)
            hospital       = st.text_input("Hospital Name")
            contact        = st.text_input("Contact Number")
            priority_label = st.selectbox("Priority", ["1 - Critical", "2 - Urgent", "3 - Normal"])
            submit_req     = st.form_submit_button("Submit Emergency Request")

        if submit_req:
            if not hospital.strip() or not contact.strip():
                st.error("Hospital and contact are required.")
            else:
                priority_num = int(priority_label.split(" - ")[0])
                req = emergency_svc.submit_request(
                    bg, int(units), hospital.strip(), contact.strip(), priority_num
                )
                st.success(f"Request queued. ID: {req.request_id}  |  Queue size: {emergency_svc.queue_size()}")

    with col_queue:
        st.subheader(f"Queue ({emergency_svc.queue_size()} pending)")
        if st.button("Process Next Request", use_container_width=True):
            if emergency_svc.queue_size() == 0:
                st.warning("No pending requests.")
            else:
                req, fulfilled = emergency_svc.process_next()
                if fulfilled:
                    st.success(
                        f"Fulfilled: {req.hospital} received {req.units_needed} units of {req.blood_group}."
                    )
                else:
                    st.error(
                        f"Insufficient stock. {req.hospital} requested {req.units_needed} units of {req.blood_group}."
                    )

        pending = emergency_svc.pending_requests()
        if pending:
            rows = [{
                "Priority":    _priority_label(r.priority),
                "Blood Group": r.blood_group,
                "Units":       r.units_needed,
                "Hospital":    r.hospital,
                "Contact":     r.contact,
                "ID":          r.request_id,
            } for r in pending]
            st.dataframe(
                rows,
                use_container_width=True,
                column_config={"Units": st.column_config.NumberColumn("Units", format="%d units")},
            )
        else:
            st.info("Queue is empty.")


# ── Page: Donation History ────────────────────────────────────────────────────

def _page_history():
    st.title("Donation History")

    col_form, col_search = st.columns(2)

    with col_form:
        st.subheader("Record a Donation")
        with st.form("record_donation"):
            donor_id      = st.text_input("Donor ID")
            units         = st.number_input("Units Donated", min_value=1, value=1, step=1)
            recipient     = st.text_input("Recipient Details (name / ward)")
            donation_date = st.date_input("Donation Date", value=date.today())
            record_submitted = st.form_submit_button("Record Donation")

        if record_submitted:
            donor = donor_svc.get_donor(donor_id.strip())
            if not donor:
                st.error(f"Donor ID '{donor_id}' not found.")
            else:
                history_svc.record_donation(
                    donor.donor_id, donation_date.isoformat(), int(units), recipient
                )
                donor_svc.update_last_donation_date(donor.donor_id, donation_date.isoformat())
                st.success(f"Donation by {donor.name} recorded.")

    with col_search:
        st.subheader("Donor History Lookup")
        search_id = st.text_input("Enter Donor ID")
        if search_id.strip():
            donor_records = history_svc.donor_history(search_id.strip())
            if donor_records:
                st.dataframe(
                    [{"Date": r.donation_date, "Units": r.units_donated, "Recipient": r.recipient_details}
                     for r in donor_records],
                    use_container_width=True,
                    column_config={
                        "Units": st.column_config.NumberColumn("Units", format="%d units"),
                        "Date":  st.column_config.DateColumn("Date", format="DD MMM YYYY"),
                    },
                )
            else:
                st.info("No history found for this donor.")

    st.divider()
    st.subheader("Recent Donations")
    n = st.slider("Show last N records", 5, 50, 10)
    records = history_svc.recent_donations(n)
    if records:
        st.dataframe(
            [{"Date": r.donation_date, "Donor ID": r.donor_id,
              "Units": r.units_donated, "Recipient": r.recipient_details,
              "Record ID": r.record_id}
             for r in records],
            use_container_width=True,
            column_config={
                "Units": st.column_config.NumberColumn("Units", format="%d units"),
                "Date":  st.column_config.DateColumn("Date", format="DD MMM YYYY"),
            },
        )
    else:
        st.info("No donation records found.")


# ── Page: Analytics ───────────────────────────────────────────────────────────

def _page_analytics():
    st.title("Analytics Dashboard")

    tab1, tab2, tab3 = st.tabs(
        ["Blood Group Distribution", "Inventory Status", "Monthly Donations"]
    )

    with tab1:
        donors = donor_svc.all_donors()
        col_chart, col_table = st.columns([2, 1])
        with col_chart:
            st.subheader("Donor Distribution by Blood Group")
            st.pyplot(blood_group_distribution_chart(donors))
        with col_table:
            st.subheader("Breakdown")
            if donors:
                counts = Counter(d.blood_group for d in donors)
                total  = len(donors)
                st.dataframe(
                    [{"Blood Group": bg,
                      "Count": counts.get(bg, 0),
                      "Share %": round(counts.get(bg, 0) / total * 100, 1)}
                     for bg in BLOOD_GROUPS],
                    use_container_width=True,
                    column_config={
                        "Share %": st.column_config.ProgressColumn(
                            "Share %", min_value=0, max_value=100, format="%.1f%%"
                        )
                    },
                )

    with tab2:
        inventory = inventory_svc.get_inventory()
        col_chart, col_table = st.columns([2, 1])
        with col_chart:
            st.subheader("Blood Inventory Status")
            st.pyplot(inventory_status_chart(inventory))
        with col_table:
            st.subheader("Units by Group")
            if inventory:
                max_u = max(i.available_units for i in inventory)
                st.dataframe(
                    [{"Group": i.blood_group,
                      "Units": i.available_units,
                      "Expires": i.expiry_date,
                      "Status": "Expired" if i.is_expired() else "OK"}
                     for i in sorted(inventory, key=lambda x: x.available_units, reverse=True)],
                    use_container_width=True,
                    column_config={
                        "Units": st.column_config.ProgressColumn(
                            "Units", min_value=0, max_value=max_u, format="%d"
                        )
                    },
                )

    with tab3:
        summary = history_svc.monthly_summary()
        col_chart, col_table = st.columns([2, 1])
        with col_chart:
            st.subheader("Monthly Donation Trends")
            st.pyplot(monthly_donations_chart(summary))
        with col_table:
            st.subheader("Monthly Totals")
            if summary:
                st.dataframe(
                    [{"Month": m, "Total Units": u}
                     for m, u in sorted(summary.items(), reverse=True)],
                    use_container_width=True,
                )


# ── Router ────────────────────────────────────────────────────────────────────

if page == "Home":
    _page_overview()
elif page == "Donor Registration":
    _page_donor_registration()
elif page == "Find Donor":
    _page_donor_search()
elif page == "Blood Inventory":
    _page_inventory()
elif page == "Emergency Requests":
    _page_emergency()
elif page == "Donation History":
    _page_history()
elif page == "Analytics":
    _page_analytics()
