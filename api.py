from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import date

from services.donor_service import DonorService
from services.inventory_service import InventoryService
from services.emergency_service import EmergencyService
from services.history_service import HistoryService

app = FastAPI(title="Blood Donation Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

donor_svc     = DonorService()
inventory_svc = InventoryService()
emergency_svc = EmergencyService(inventory_svc)
history_svc   = HistoryService()


# ── Overview ──────────────────────────────────────────────────────────────────

@app.get("/api/overview")
def overview():
    donors    = donor_svc.all_donors()
    eligible  = [d for d in donors if d.is_eligible()]
    inventory = inventory_svc.get_valid_inventory()
    total_units = sum(i.available_units for i in inventory)
    recent    = history_svc.recent_donations(5)
    monthly   = history_svc.monthly_summary()

    from collections import Counter
    bg_counts = Counter(d.blood_group for d in donors)

    return {
        "total_donors":    len(donors),
        "eligible_donors": len(eligible),
        "total_units":     total_units,
        "emergency_queue": emergency_svc.queue_size(),
        "blood_group_distribution": dict(bg_counts),
        "monthly_summary": monthly,
        "recent_donations": [
            {
                "record_id":       r.record_id,
                "donor_id":        r.donor_id,
                "donation_date":   r.donation_date,
                "units_donated":   r.units_donated,
                "recipient_details": r.recipient_details,
            }
            for r in recent
        ],
    }


# ── Donors ────────────────────────────────────────────────────────────────────

@app.get("/api/donors")
def list_donors():
    donors = donor_svc.all_donors()
    return [_donor_dict(d) for d in donors]


@app.get("/api/donors/search")
def search_donors(blood_group: Optional[str] = None,
                  city: Optional[str] = None,
                  eligible_only: bool = False):
    if eligible_only:
        return [_donor_dict(d) for d in donor_svc.search_eligible_donors(blood_group)]
    if blood_group:
        return [_donor_dict(d) for d in donor_svc.search_by_blood_group(blood_group)]
    if city:
        return [_donor_dict(d) for d in donor_svc.search_by_city(city)]
    return [_donor_dict(d) for d in donor_svc.all_donors()]


class DonorCreate(BaseModel):
    name: str
    age: int
    blood_group: str
    city: str
    last_donation_date: Optional[str] = None


@app.post("/api/donors", status_code=201)
def create_donor(body: DonorCreate):
    donor = donor_svc.register(
        body.name, body.age, body.blood_group, body.city, body.last_donation_date
    )
    return _donor_dict(donor)


def _donor_dict(d):
    return {
        "donor_id":           d.donor_id,
        "name":               d.name,
        "age":                d.age,
        "blood_group":        d.blood_group,
        "city":               d.city,
        "last_donation_date": d.last_donation_date,
        "eligible":           d.is_eligible(),
    }


# ── Inventory ─────────────────────────────────────────────────────────────────

@app.get("/api/inventory")
def list_inventory():
    return [_inv_dict(i) for i in inventory_svc.get_inventory()]


class InventoryAdd(BaseModel):
    blood_group: str
    units: int
    expiry_date: str


@app.post("/api/inventory")
def add_inventory(body: InventoryAdd):
    item = inventory_svc.add_units(body.blood_group, body.units, body.expiry_date)
    return _inv_dict(item)


def _inv_dict(i):
    return {
        "blood_group":     i.blood_group,
        "available_units": i.available_units,
        "expiry_date":     i.expiry_date,
        "expired":         i.is_expired(),
    }


# ── Emergency ─────────────────────────────────────────────────────────────────

@app.get("/api/emergency")
def list_emergency():
    return [
        {
            "request_id":   r.request_id,
            "blood_group":  r.blood_group,
            "units_needed": r.units_needed,
            "hospital":     r.hospital,
            "contact":      r.contact,
            "priority":     r.priority,
        }
        for r in emergency_svc.pending_requests()
    ]


class EmergencyCreate(BaseModel):
    blood_group: str
    units_needed: int
    hospital: str
    contact: str
    priority: int = 2


@app.post("/api/emergency", status_code=201)
def submit_emergency(body: EmergencyCreate):
    req = emergency_svc.submit_request(
        body.blood_group, body.units_needed, body.hospital, body.contact, body.priority
    )
    return {"request_id": req.request_id, "queue_size": emergency_svc.queue_size()}


@app.post("/api/emergency/process")
def process_emergency():
    if emergency_svc.queue_size() == 0:
        raise HTTPException(status_code=400, detail="Queue is empty")
    req, fulfilled = emergency_svc.process_next()
    return {
        "request_id":  req.request_id,
        "blood_group": req.blood_group,
        "hospital":    req.hospital,
        "fulfilled":   fulfilled,
    }


# ── History ───────────────────────────────────────────────────────────────────

@app.get("/api/history")
def list_history(n: int = 20):
    records = history_svc.recent_donations(n)
    return [_record_dict(r) for r in records]


@app.get("/api/history/{donor_id}")
def donor_history(donor_id: str):
    return [_record_dict(r) for r in history_svc.donor_history(donor_id)]


class DonationCreate(BaseModel):
    donor_id: str
    donation_date: str
    units_donated: int
    recipient_details: str


@app.post("/api/history", status_code=201)
def record_donation(body: DonationCreate):
    donor = donor_svc.get_donor(body.donor_id)
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    record = history_svc.record_donation(
        body.donor_id, body.donation_date, body.units_donated, body.recipient_details
    )
    donor_svc.update_last_donation_date(body.donor_id, body.donation_date)
    return _record_dict(record)


def _record_dict(r):
    return {
        "record_id":         r.record_id,
        "donor_id":          r.donor_id,
        "donation_date":     r.donation_date,
        "units_donated":     r.units_donated,
        "recipient_details": r.recipient_details,
    }
