from datetime import date, timedelta
from models.donor import Donor


def test_donor_eligible_never_donated():
    donor = Donor("Alice", 25, "A+", "Chennai")
    assert donor.is_eligible() is True


def test_donor_not_eligible_recent_donation():
    recent = (date.today() - timedelta(days=30)).isoformat()
    donor = Donor("Bob", 30, "B+", "Delhi", recent)
    assert donor.is_eligible() is False


def test_donor_eligible_old_donation():
    old = (date.today() - timedelta(days=100)).isoformat()
    donor = Donor("Carol", 28, "O+", "Mumbai", old)
    assert donor.is_eligible() is True


def test_donor_to_dict_from_dict_roundtrip():
    donor = Donor("Dave", 35, "AB-", "Hyderabad", "2025-01-01")
    restored = Donor.from_dict(donor.to_dict())
    assert restored.donor_id == donor.donor_id
    assert restored.blood_group == "AB-"
    assert restored.city == "hyderabad"
    assert restored.age == 35


def test_donor_blood_group_normalized_to_uppercase():
    donor = Donor("Eve", 22, "a+", "Pune")
    assert donor.blood_group == "A+"


def test_donor_city_normalized_to_lowercase():
    donor = Donor("Frank", 40, "B-", "KOLKATA")
    assert donor.city == "kolkata"


def test_donor_to_dict_none_last_donation_date_serializes_as_empty_string():
    donor = Donor("Grace", 30, "O+", "Pune")
    assert donor.to_dict()["last_donation_date"] == ""


def test_donor_from_dict_empty_string_last_donation_date_becomes_none():
    donor = Donor("Henry", 25, "B+", "Chennai")
    d = donor.to_dict()
    assert d["last_donation_date"] == ""
    restored = Donor.from_dict(d)
    assert restored.last_donation_date is None


from models.blood_inventory import BloodInventory
from models.donation_record import DonationRecord


def test_blood_inventory_expired():
    item = BloodInventory("O+", 10, "2020-01-01")
    assert item.is_expired() is True


def test_blood_inventory_not_expired():
    item = BloodInventory("A+", 5, "2099-01-01")
    assert item.is_expired() is False


def test_blood_inventory_roundtrip():
    item = BloodInventory("B-", 8, "2026-12-31")
    restored = BloodInventory.from_dict(item.to_dict())
    assert restored.blood_group == "B-"
    assert restored.available_units == 8
    assert restored.expiry_date == "2026-12-31"


def test_donation_record_roundtrip():
    rec = DonationRecord("donor123", "2026-06-01", 2, "Patient A, Ward 3")
    restored = DonationRecord.from_dict(rec.to_dict())
    assert restored.donor_id == "donor123"
    assert restored.units_donated == 2
    assert restored.recipient_details == "Patient A, Ward 3"
    assert restored.record_id == rec.record_id
