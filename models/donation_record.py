import uuid


class DonationRecord:
    def __init__(self, donor_id: str, donation_date: str, units_donated: int, recipient_details: str):
        self.record_id = str(uuid.uuid4())[:8]
        self.donor_id = donor_id
        self.donation_date = donation_date  # "YYYY-MM-DD"
        self.units_donated = units_donated
        self.recipient_details = recipient_details

    def to_dict(self) -> dict:
        return {
            "record_id": self.record_id,
            "donor_id": self.donor_id,
            "donation_date": self.donation_date,
            "units_donated": self.units_donated,
            "recipient_details": self.recipient_details,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "DonationRecord":
        rec = cls.__new__(cls)
        rec.record_id = data["record_id"]
        rec.donor_id = data["donor_id"]
        rec.donation_date = data["donation_date"]
        rec.units_donated = int(data["units_donated"])
        rec.recipient_details = data["recipient_details"]
        return rec
