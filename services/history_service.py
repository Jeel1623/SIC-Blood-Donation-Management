from typing import List
from models.donation_record import DonationRecord
from data_structures.donation_stack import DonationStack
from file_io.json_handler import save_donation_history, load_donation_history


class HistoryService:
    def __init__(self):
        self._stack = DonationStack()
        self._stack.load_records(load_donation_history())

    def record_donation(self, donor_id: str, donation_date: str,
                        units: int, recipient: str) -> DonationRecord:
        record = DonationRecord(donor_id, donation_date, units, recipient)
        self._stack.push(record)
        self._persist()
        return record

    def recent_donations(self, n: int = 10) -> List[DonationRecord]:
        return self._stack.all_records()[:n]

    def donor_history(self, donor_id: str) -> List[DonationRecord]:
        return [r for r in self._stack.all_records() if r.donor_id == donor_id]

    def monthly_summary(self) -> dict:
        summary: dict[str, int] = {}
        for record in self._stack.all_records():
            month = record.donation_date[:7]
            summary[month] = summary.get(month, 0) + record.units_donated
        return summary

    def all_records(self) -> List[DonationRecord]:
        return self._stack.all_records()

    def _persist(self) -> None:
        save_donation_history(self._stack.all_records())
