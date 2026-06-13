import pytest
from datetime import date, timedelta
import file_io.csv_handler as csv_handler
from services.donor_service import DonorService


@pytest.fixture
def svc(tmp_path, monkeypatch):
    monkeypatch.setattr(csv_handler, "DONORS_FILE", str(tmp_path / "donors.csv"))
    return DonorService()


def test_register_creates_donor_with_id(svc):
    donor = svc.register("Alice", 25, "A+", "Chennai")
    assert donor.donor_id is not None
    assert len(svc.all_donors()) == 1


def test_register_persists_to_file(svc, tmp_path, monkeypatch):
    monkeypatch.setattr(csv_handler, "DONORS_FILE", str(tmp_path / "donors.csv"))
    svc.register("Alice", 25, "A+", "Chennai")
    svc2 = DonorService()
    assert len(svc2.all_donors()) == 1


def test_search_by_blood_group(svc):
    svc.register("Alice", 25, "A+", "Chennai")
    svc.register("Bob", 30, "B+", "Delhi")
    results = svc.search_by_blood_group("A+")
    assert len(results) == 1
    assert results[0].name == "Alice"


def test_search_by_city(svc):
    svc.register("Alice", 25, "A+", "Chennai")
    svc.register("Bob", 30, "B+", "Delhi")
    results = svc.search_by_city("Chennai")
    assert len(results) == 1


def test_search_eligible_donors_excludes_recent(svc):
    svc.register("Alice", 25, "O+", "Chennai")
    recent = (date.today() - timedelta(days=30)).isoformat()
    svc.register("Bob", 30, "O+", "Chennai", recent)
    eligible = svc.search_eligible_donors("O+")
    assert len(eligible) == 1
    assert eligible[0].name == "Alice"


def test_search_eligible_sorted_by_oldest_donation_first(svc):
    old = (date.today() - timedelta(days=200)).isoformat()
    less_old = (date.today() - timedelta(days=100)).isoformat()
    svc.register("A", 25, "B+", "City", old)
    svc.register("B", 25, "B+", "City", less_old)
    eligible = svc.search_eligible_donors("B+")
    assert eligible[0].last_donation_date == old


def test_get_donor_by_id(svc):
    donor = svc.register("Carol", 28, "B-", "Mumbai")
    found = svc.get_donor(donor.donor_id)
    assert found is not None
    assert found.name == "Carol"


def test_update_last_donation_date(svc):
    donor = svc.register("Dave", 35, "AB+", "Hyderabad")
    svc.update_last_donation_date(donor.donor_id, "2026-06-13")
    updated = svc.get_donor(donor.donor_id)
    assert updated.last_donation_date == "2026-06-13"


import file_io.json_handler as json_handler
from services.inventory_service import InventoryService


@pytest.fixture
def inv_svc(tmp_path, monkeypatch):
    monkeypatch.setattr(json_handler, "INVENTORY_FILE", str(tmp_path / "inventory.json"))
    return InventoryService()


def test_add_units_creates_new_entry(inv_svc):
    item = inv_svc.add_units("A+", 10, "2099-01-01")
    assert item.available_units == 10


def test_add_units_accumulates_on_existing(inv_svc):
    inv_svc.add_units("B+", 5, "2099-01-01")
    inv_svc.add_units("B+", 3, "2099-06-01")
    assert inv_svc.get_inventory("B+")[0].available_units == 8


def test_use_units_reduces_stock(inv_svc):
    inv_svc.add_units("O+", 10, "2099-01-01")
    result = inv_svc.use_units("O+", 4)
    assert result is True
    assert inv_svc.get_inventory("O+")[0].available_units == 6


def test_use_units_returns_false_when_insufficient(inv_svc):
    inv_svc.add_units("AB-", 2, "2099-01-01")
    result = inv_svc.use_units("AB-", 5)
    assert result is False
    assert inv_svc.get_inventory("AB-")[0].available_units == 2


def test_get_valid_inventory_excludes_expired(inv_svc):
    inv_svc.add_units("A+", 5, "2020-01-01")
    inv_svc.add_units("B+", 5, "2099-01-01")
    valid = inv_svc.get_valid_inventory()
    groups = {i.blood_group for i in valid}
    assert "A+" not in groups
    assert "B+" in groups


from services.emergency_service import EmergencyService


@pytest.fixture
def emergency_svc(tmp_path, monkeypatch):
    monkeypatch.setattr(json_handler, "INVENTORY_FILE", str(tmp_path / "inventory.json"))
    inv = InventoryService()
    inv.add_units("O-", 10, "2099-01-01")
    return EmergencyService(inv)


def test_submit_request_adds_to_queue(emergency_svc):
    emergency_svc.submit_request("O-", 2, "City Hospital", "9999", priority=1)
    assert emergency_svc.queue_size() == 1


def test_process_next_fulfills_request(emergency_svc):
    emergency_svc.submit_request("O-", 3, "City Hospital", "9999", priority=1)
    req, fulfilled = emergency_svc.process_next()
    assert fulfilled is True
    assert req.blood_group == "O-"


def test_process_next_fails_when_insufficient(tmp_path, monkeypatch):
    monkeypatch.setattr(json_handler, "INVENTORY_FILE", str(tmp_path / "inventory2.json"))
    inv = InventoryService()
    inv.add_units("B+", 1, "2099-01-01")
    svc = EmergencyService(inv)
    svc.submit_request("B+", 5, "Hospital", "000", priority=1)
    _, fulfilled = svc.process_next()
    assert fulfilled is False


def test_process_next_respects_priority_order(tmp_path, monkeypatch):
    monkeypatch.setattr(json_handler, "INVENTORY_FILE", str(tmp_path / "inventory3.json"))
    inv = InventoryService()
    inv.add_units("A+", 20, "2099-01-01")
    svc = EmergencyService(inv)
    svc.submit_request("A+", 1, "Low", "000", priority=3)
    svc.submit_request("A+", 1, "Critical", "111", priority=1)
    req, _ = svc.process_next()
    assert req.hospital == "Critical"


from services.history_service import HistoryService


@pytest.fixture
def hist_svc(tmp_path, monkeypatch):
    monkeypatch.setattr(json_handler, "HISTORY_FILE", str(tmp_path / "donations.json"))
    return HistoryService()


def test_record_donation_stores_record(hist_svc):
    rec = hist_svc.record_donation("d1", "2026-06-01", 2, "Patient A")
    assert rec.record_id is not None
    assert hist_svc.recent_donations(10)[0].donor_id == "d1"


def test_recent_donations_most_recent_first(hist_svc):
    hist_svc.record_donation("d1", "2026-01-01", 1, "P1")
    hist_svc.record_donation("d2", "2026-06-01", 2, "P2")
    recent = hist_svc.recent_donations(10)
    assert recent[0].donation_date == "2026-06-01"


def test_donor_history_filters_by_donor_id(hist_svc):
    hist_svc.record_donation("d1", "2026-06-01", 1, "P1")
    hist_svc.record_donation("d2", "2026-06-02", 2, "P2")
    hist_svc.record_donation("d1", "2026-06-03", 1, "P3")
    d1_history = hist_svc.donor_history("d1")
    assert len(d1_history) == 2
    assert all(r.donor_id == "d1" for r in d1_history)


def test_monthly_summary_aggregates_units(hist_svc):
    hist_svc.record_donation("d1", "2026-06-01", 2, "P1")
    hist_svc.record_donation("d2", "2026-06-15", 3, "P2")
    hist_svc.record_donation("d3", "2026-05-20", 1, "P3")
    summary = hist_svc.monthly_summary()
    assert summary["2026-06"] == 5
    assert summary["2026-05"] == 1
