package vn.com.duylongtech.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.duylongtech.backend.entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
}
