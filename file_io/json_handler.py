import json
import os
from typing import List
from models.blood_inventory import BloodInventory
from models.donation_record import DonationRecord

INVENTORY_FILE = "data/inventory.json"
HISTORY_FILE = "data/donations.json"


def save_inventory(inventory: List[BloodInventory]) -> None:
    os.makedirs(os.path.dirname(INVENTORY_FILE), exist_ok=True)
    with open(INVENTORY_FILE, "w", encoding="utf-8") as f:
        json.dump([item.to_dict() for item in inventory], f, indent=2)


def load_inventory() -> List[BloodInventory]:
    if not os.path.exists(INVENTORY_FILE):
        return []
    with open(INVENTORY_FILE, "r", encoding="utf-8") as f:
        return [BloodInventory.from_dict(d) for d in json.load(f)]


def save_donation_history(records: List[DonationRecord]) -> None:
    os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump([r.to_dict() for r in records], f, indent=2)


def load_donation_history() -> List[DonationRecord]:
    if not os.path.exists(HISTORY_FILE):
        return []
    with open(HISTORY_FILE, "r", encoding="utf-8") as f:
        return [DonationRecord.from_dict(d) for d in json.load(f)]
