import uuid
from datetime import date, datetime


class Donor:
    def __init__(self, name: str, age: int, blood_group: str, city: str, last_donation_date: str = None):
        self.donor_id = str(uuid.uuid4())[:8]
        self.name = name
        self.age = age
        self.blood_group = blood_group.upper()
        self.city = city.lower()
        self.last_donation_date = last_donation_date  # "YYYY-MM-DD" or None

    def is_eligible(self) -> bool:
        if self.last_donation_date is None:
            return True
        try:
            last = datetime.strptime(self.last_donation_date, "%Y-%m-%d").date()
            return (date.today() - last).days >= 90
        except ValueError:
            return False

    def to_dict(self) -> dict:
        return {
            "donor_id": self.donor_id,
            "name": self.name,
            "age": self.age,
            "blood_group": self.blood_group,
            "city": self.city,
            "last_donation_date": self.last_donation_date or "",
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Donor":
        donor = cls.__new__(cls)
        donor.donor_id = data["donor_id"]
        donor.name = data["name"]
        donor.age = int(data["age"])
        donor.blood_group = data["blood_group"].upper()
        donor.city = data["city"].lower()
        donor.last_donation_date = data["last_donation_date"] or None
        return donor
