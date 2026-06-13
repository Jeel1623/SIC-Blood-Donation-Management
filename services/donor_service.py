from datetime import datetime, date
from typing import List, Optional
from models.donor import Donor
from data_structures.donor_hash_table import DonorHashTable
from file_io.csv_handler import save_donors, load_donors


class DonorService:
    def __init__(self):
        self._table = DonorHashTable()
        self._table.rebuild(load_donors())

    def register(self, name: str, age: int, blood_group: str, city: str,
                 last_donation_date: str = None) -> Donor:
        donor = Donor(name, age, blood_group, city, last_donation_date)
        self._table.insert(donor)
        self._persist()
        return donor

    def search_by_blood_group(self, blood_group: str) -> List[Donor]:
        return self._table.get_by_blood_group(blood_group)

    def search_by_city(self, city: str) -> List[Donor]:
        return self._table.get_by_city(city)

    def search_eligible_donors(self, blood_group: str = None) -> List[Donor]:
        """Return eligible donors sorted by oldest last-donation date first (binary-search-friendly order)."""
        pool = self._table.get_by_blood_group(blood_group) if blood_group else self._table.all_donors()
        eligible = [d for d in pool if d.is_eligible()]
        return self._sort_by_last_donation(eligible)

    def _sort_by_last_donation(self, donors: List[Donor]) -> List[Donor]:
        def _key(d: Donor):
            if d.last_donation_date is None:
                return date.min
            return datetime.strptime(d.last_donation_date, "%Y-%m-%d").date()
        return sorted(donors, key=_key)

    def get_donor(self, donor_id: str) -> Optional[Donor]:
        return self._table.get_by_id(donor_id)

    def all_donors(self) -> List[Donor]:
        return self._table.all_donors()

    def update_last_donation_date(self, donor_id: str, donation_date: str) -> None:
        donor = self._table.get_by_id(donor_id)
        if donor:
            donor.last_donation_date = donation_date
            self._persist()

    def _persist(self) -> None:
        save_donors(self._table.all_donors())
