from typing import List
from models.donation_record import DonationRecord


class DonationStack:
    """LIFO stack. all_records() returns items most-recent first (top of stack first)."""

    def __init__(self):
        self._stack: List[DonationRecord] = []

    def push(self, record: DonationRecord) -> None:
        self._stack.append(record)

    def pop(self) -> DonationRecord:
        if self.is_empty():
            raise IndexError("Donation stack is empty")
        return self._stack.pop()

    def peek(self) -> DonationRecord:
        if self.is_empty():
            raise IndexError("Donation stack is empty")
        return self._stack[-1]

    def is_empty(self) -> bool:
        return len(self._stack) == 0

    def size(self) -> int:
        return len(self._stack)

    def all_records(self) -> List[DonationRecord]:
        return list(reversed(self._stack))

    def load_records(self, records: List[DonationRecord]) -> None:
        self._stack = list(records)
