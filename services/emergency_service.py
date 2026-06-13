import uuid
from data_structures.emergency_queue import EmergencyQueue, EmergencyRequest
from services.inventory_service import InventoryService


class EmergencyService:
    def __init__(self, inventory_service: InventoryService):
        self._queue = EmergencyQueue()
        self._inventory = inventory_service

    def submit_request(self, blood_group: str, units_needed: int, hospital: str,
                       contact: str, priority: int = 2) -> EmergencyRequest:
        request = EmergencyRequest(
            priority=priority,
            blood_group=blood_group.upper(),
            units_needed=units_needed,
            hospital=hospital,
            contact=contact,
            request_id=str(uuid.uuid4())[:8],
        )
        self._queue.enqueue(request)
        return request

    def process_next(self) -> tuple[EmergencyRequest, bool]:
        """Dequeue highest-priority request and attempt to fulfil from inventory."""
        request = self._queue.dequeue()
        fulfilled = self._inventory.use_units(request.blood_group, request.units_needed)
        return request, fulfilled

    def pending_requests(self) -> list:
        return self._queue.all_requests()

    def queue_size(self) -> int:
        return self._queue.size()
