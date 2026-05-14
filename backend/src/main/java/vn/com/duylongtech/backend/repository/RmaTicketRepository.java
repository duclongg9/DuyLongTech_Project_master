package vn.com.duylongtech.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.com.duylongtech.backend.entity.RmaTicket;
import java.util.List;

public interface RmaTicketRepository extends JpaRepository<RmaTicket, Long> {
    List<RmaTicket> findByStatusOrderByReceivedAtDesc(String status);

    List<RmaTicket> findBySerialNumber(String serialNumber);

    @Query("SELECT r FROM RmaTicket r WHERE r.vendorActualReturnDate IS NULL AND r.vendorSentDate IS NOT NULL ORDER BY r.vendorSentDate ASC")
    List<RmaTicket> findPendingVendorReturn();

    @Query("SELECT r FROM RmaTicket r WHERE r.status NOT IN ('CLOSED', 'REJECTED') ORDER BY r.receivedAt DESC")
    List<RmaTicket> findAllActive();
}
