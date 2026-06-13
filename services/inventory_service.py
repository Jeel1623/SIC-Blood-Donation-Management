from typing import List, Optional
from models.blood_inventory import BloodInventory
from file_io.json_handler import save_inventory, load_inventory


class InventoryService:
    def __init__(self):
        self._inventory: dict[str, BloodInventory] = {}
        for item in load_inventory():
            self._inventory[item.blood_group] = item

    def add_units(self, blood_group: str, units: int, expiry_date: str) -> BloodInventory:
        bg = blood_group.upper()
        if bg in self._inventory:
            self._inventory[bg].available_units += units
            self._inventory[bg].expiry_date = expiry_date
        else:
            self._inventory[bg] = BloodInventory(bg, units, expiry_date)
        self._persist()
        return self._inventory[bg]

    def use_units(self, blood_group: str, units: int) -> bool:
        bg = blood_group.upper()
        if bg not in self._inventory or self._inventory[bg].available_units < units:
            return False
        self._inventory[bg].available_units -= units
        self._persist()
        return True

    def get_inventory(self, blood_group: str = None) -> List[BloodInventory]:
        if blood_group:
            item = self._inventory.get(blood_group.upper())
            return [item] if item else []
        return list(self._inventory.values())

    def get_valid_inventory(self) -> List[BloodInventory]:
        return [item for item in self._inventory.values() if not item.is_expired()]

    def _persist(self) -> None:
        save_inventory(list(self._inventory.values()))
