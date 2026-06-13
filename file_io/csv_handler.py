import csv
import os
from typing import List
from models.donor import Donor

DONORS_FILE = "data/donors.csv"
_FIELDNAMES = ["donor_id", "name", "age", "blood_group", "city", "last_donation_date"]


def save_donors(donors: List[Donor]) -> None:
    os.makedirs(os.path.dirname(DONORS_FILE), exist_ok=True)
    with open(DONORS_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=_FIELDNAMES)
        writer.writeheader()
        for donor in donors:
            writer.writerow(donor.to_dict())


def load_donors() -> List[Donor]:
    if not os.path.exists(DONORS_FILE):
        return []
    with open(DONORS_FILE, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [Donor.from_dict(row) for row in reader]
