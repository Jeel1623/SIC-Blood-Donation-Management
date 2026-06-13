import pytest
import file_io.csv_handler as csv_handler
from models.donor import Donor
import file_io.json_handler as json_handler
from models.blood_inventory import BloodInventory
from models.donation_record import DonationRecord


@pytest.fixture(autouse=True)
def patch_donors_file(tmp_path, monkeypatch):
    monkeypatch.setattr(csv_handler, "DONORS_FILE", str(tmp_path / "donors.csv"))


@pytest.fixture(autouse=True)
def patch_json_files(tmp_path, monkeypatch):
    monkeypatch.setattr(json_handler, "INVENTORY_FILE", str(tmp_path / "inventory.json"))
    monkeypatch.setattr(json_handler, "HISTORY_FILE", str(tmp_path / "donations.json"))


def test_save_and_load_donors():
    donors = [Donor("Alice", 25, "A+", "Chennai"), Donor("Bob", 30, "O-", "Mumbai")]
    csv_handler.save_donors(donors)
    loaded = csv_handler.load_donors()
    assert len(loaded) == 2
    names = {d.name for d in loaded}
    assert "Alice" in names
    assert "Bob" in names


def test_load_donors_returns_empty_when_file_missing():
    result = csv_handler.load_donors()
    assert result == []


def test_save_donor_preserves_all_fields():
    donor = Donor("Carol", 28, "B-", "Delhi", "2026-01-15")
    csv_handler.save_donors([donor])
    loaded = csv_handler.load_donors()
    d = loaded[0]
    assert d.donor_id == donor.donor_id
    assert d.name == "Carol"
    assert d.age == 28
    assert d.blood_group == "B-"
    assert d.city == "delhi"
    assert d.last_donation_date == "2026-01-15"


def test_save_and_load_inventory():
    items = [BloodInventory("A+", 10, "2026-12-31"), BloodInventory("O-", 5, "2027-06-30")]
    json_handler.save_inventory(items)
    loaded = json_handler.load_inventory()
    assert len(loaded) == 2
    groups = {i.blood_group for i in loaded}
    assert "A+" in groups and "O-" in groups


def test_load_inventory_returns_empty_when_file_missing():
    assert json_handler.load_inventory() == []


def test_save_and_load_donation_history():
    records = [DonationRecord("d1", "2026-06-01", 2, "Patient A")]
    json_handler.save_donation_history(records)
    loaded = json_handler.load_donation_history()
    assert len(loaded) == 1
    assert loaded[0].donor_id == "d1"
    assert loaded[0].units_donated == 2


def test_load_donation_history_returns_empty_when_file_missing():
    assert json_handler.load_donation_history() == []
