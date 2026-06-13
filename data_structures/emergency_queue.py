import heapq
from dataclasses import dataclass, field


@dataclass(order=True)
class EmergencyRequest:
    priority: int               # 1=Critical, 2=Urgent, 3=Normal
    blood_group: str = field(compare=False)
    units_needed: int = field(compare=False)
    hospital: str = field(compare=False)
    contact: str = field(compare=False)
    request_id: str = field(compare=False)


class EmergencyQueue:
    """Min-heap priority queue. Lower priority number = higher urgency."""

    def __init__(self):
        self._heap: list = []
        self._counter = 0

    def enqueue(self, request: EmergencyRequest) -> None:
        heapq.heappush(self._heap, (request.priority, self._counter, request))
        self._counter += 1

    def dequeue(self) -> EmergencyRequest:
        if self.is_empty():
            raise IndexError("Emergency queue is empty")
        _, _, request = heapq.heappop(self._heap)
        return request

    def peek(self) -> EmergencyRequest:
        if self.is_empty():
            raise IndexError("Emergency queue is empty")
        return self._heap[0][2]

    def is_empty(self) -> bool:
        return len(self._heap) == 0

    def size(self) -> int:
        return len(self._heap)

    def all_requests(self) -> list:
        return [item[2] for item in sorted(self._heap)]
