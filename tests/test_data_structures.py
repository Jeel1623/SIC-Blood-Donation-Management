import pytest
from models.donor import Donor
from data_structures.donor_hash_table import DonorHashTable


def _make_donor(name, blood_group, city, last_date=None):
    return Donor(name, 25, blood_group, city, last_date)


def test_insert_and_get_by_blood_group():
    ht = DonorHashTable()
    d = _make_donor("Alice", "A+", "Chennai")
    ht.insert(d)
    results = ht.get_by_blood_group("A+")
    assert len(results) == 1
    assert results[0].name == "Alice"


def test_get_by_blood_group_case_insensitive():
    ht = DonorHashTable()
    ht.insert(_make_donor("Bob", "b+", "Delhi"))
    assert len(ht.get_by_blood_group("B+")) == 1


def test_get_by_city():
    ht = DonorHashTable()
    ht.insert(_make_donor("Carol", "O-", "Mumbai"))
    results = ht.get_by_city("Mumbai")
    assert len(results) == 1
    assert results[0].name == "Carol"


def test_get_by_city_case_insensitive():
    ht = DonorHashTable()
    ht.insert(_make_donor("Dave", "AB+", "KOLKATA"))
    assert len(ht.get_by_city("kolkata")) == 1


def test_remove_donor():
    ht = DonorHashTable()
    d = _make_donor("Eve", "O+", "Pune")
    ht.insert(d)
    ht.remove(d.donor_id)
    assert ht.get_by_id(d.donor_id) is None
    assert len(ht.get_by_blood_group("O+")) == 0
    assert len(ht.get_by_city("pune")) == 0


def test_get_by_id():
    ht = DonorHashTable()
    d = _make_donor("Frank", "B-", "Bangalore")
    ht.insert(d)
    found = ht.get_by_id(d.donor_id)
    assert found is not None
    assert found.name == "Frank"


def test_rebuild_replaces_all_data():
    ht = DonorHashTable()
    ht.insert(_make_donor("Old", "A+", "OldCity"))
    new_donors = [_make_donor("New1", "B+", "NewCity"), _make_donor("New2", "O+", "NewCity")]
    ht.rebuild(new_donors)
    assert len(ht.all_donors()) == 2
    assert len(ht.get_by_blood_group("A+")) == 0


def test_multiple_donors_same_blood_group():
    ht = DonorHashTable()
    ht.insert(_make_donor("G", "O+", "CityA"))
    ht.insert(_make_donor("H", "O+", "CityB"))
    assert len(ht.get_by_blood_group("O+")) == 2


from data_structures.emergency_queue import EmergencyQueue, EmergencyRequest


def _make_request(priority, blood_group="A+", units=1, hospital="H", contact="000", req_id="r1"):
    return EmergencyRequest(priority=priority, blood_group=blood_group,
                            units_needed=units, hospital=hospital,
                            contact=contact, request_id=req_id)


def test_queue_dequeues_highest_priority_first():
    q = EmergencyQueue()
    q.enqueue(_make_request(3, req_id="r3"))
    q.enqueue(_make_request(1, req_id="r1"))
    q.enqueue(_make_request(2, req_id="r2"))
    assert q.dequeue().priority == 1
    assert q.dequeue().priority == 2
    assert q.dequeue().priority == 3


def test_queue_peek_does_not_remove():
    q = EmergencyQueue()
    q.enqueue(_make_request(1))
    q.peek()
    assert q.size() == 1


def test_queue_is_empty():
    q = EmergencyQueue()
    assert q.is_empty() is True
    q.enqueue(_make_request(1))
    assert q.is_empty() is False


def test_queue_dequeue_empty_raises():
    q = EmergencyQueue()
    with pytest.raises(IndexError):
        q.dequeue()


def test_queue_all_requests_sorted_by_priority():
    q = EmergencyQueue()
    q.enqueue(_make_request(3, req_id="r3"))
    q.enqueue(_make_request(1, req_id="r1"))
    all_reqs = q.all_requests()
    assert all_reqs[0].priority == 1


from models.donation_record import DonationRecord
from data_structures.donation_stack import DonationStack


def _make_record(donor_id, date_str, units=1):
    return DonationRecord(donor_id, date_str, units, "Patient X")


def test_stack_push_pop_lifo():
    stack = DonationStack()
    r1 = _make_record("d1", "2026-01-01")
    r2 = _make_record("d2", "2026-06-01")
    stack.push(r1)
    stack.push(r2)
    assert stack.pop().donation_date == "2026-06-01"
    assert stack.pop().donation_date == "2026-01-01"


def test_stack_pop_empty_raises():
    stack = DonationStack()
    with pytest.raises(IndexError):
        stack.pop()


def test_stack_all_records_most_recent_first():
    stack = DonationStack()
    stack.push(_make_record("d1", "2026-01-01"))
    stack.push(_make_record("d2", "2026-06-01"))
    records = stack.all_records()
    assert records[0].donation_date == "2026-06-01"
    assert records[1].donation_date == "2026-01-01"


def test_stack_size_and_is_empty():
    stack = DonationStack()
    assert stack.is_empty() is True
    stack.push(_make_record("d1", "2026-01-01"))
    assert stack.size() == 1
    assert stack.is_empty() is False


def test_stack_load_records():
    stack = DonationStack()
    records = [_make_record("d1", "2026-01-01"), _make_record("d2", "2026-03-01")]
    stack.load_records(records)
    assert stack.size() == 2
