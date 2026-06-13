from typing import List, Optional
from models.donor import Donor


class DonorHashTable:
    """
    Hash table providing O(1) average lookup by blood_group or city.
    Keys are normalized (blood_group uppercase, city lowercase) at insert time.
    """

    def __init__(self):
        self._by_blood_group: dict[str, List[Donor]] = {}
        self._by_city: dict[str, List[Donor]] = {}
        self._all: dict[str, Donor] = {}

    def insert(self, donor: Donor) -> None:
        self._all[donor.donor_id] = donor
        self._by_blood_group.setdefault(donor.blood_group, []).append(donor)
        self._by_city.setdefault(donor.city, []).append(donor)

    def remove(self, donor_id: str) -> None:
        if donor_id not in self._all:
            return
        donor = self._all.pop(donor_id)
        self._by_blood_group[donor.blood_group] = [
            d for d in self._by_blood_group[donor.blood_group] if d.donor_id != donor_id
        ]
        self._by_city[donor.city] = [
            d for d in self._by_city[donor.city] if d.donor_id != donor_id
        ]

    def get_by_blood_group(self, blood_group: str) -> List[Donor]:
        return self._by_blood_group.get(blood_group.upper(), [])

    def get_by_city(self, city: str) -> List[Donor]:
        return self._by_city.get(city.lower(), [])

    def get_by_id(self, donor_id: str) -> Optional[Donor]:
        return self._all.get(donor_id)

    def all_donors(self) -> List[Donor]:
        return list(self._all.values())

    def rebuild(self, donors: List[Donor]) -> None:
        self._by_blood_group = {}
        self._by_city = {}
        self._all = {}
        for donor in donors:
            self.insert(donor)
