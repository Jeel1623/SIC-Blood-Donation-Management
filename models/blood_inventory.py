from datetime import date, datetime


class BloodInventory:
    def __init__(self, blood_group: str, available_units: int, expiry_date: str):
        self.blood_group = blood_group.upper()
        self.available_units = available_units
        self.expiry_date = expiry_date  # "YYYY-MM-DD"

    def is_expired(self) -> bool:
        expiry = datetime.strptime(self.expiry_date, "%Y-%m-%d").date()
        return date.today() > expiry

    def to_dict(self) -> dict:
        return {
            "blood_group": self.blood_group,
            "available_units": self.available_units,
            "expiry_date": self.expiry_date,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "BloodInventory":
        return cls(data["blood_group"], int(data["available_units"]), data["expiry_date"])
