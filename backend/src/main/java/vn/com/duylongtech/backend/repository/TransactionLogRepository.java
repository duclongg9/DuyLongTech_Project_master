package vn.com.duylongtech.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.duylongtech.backend.entity.TransactionLog;
import java.util.List;

public interface TransactionLogRepository extends JpaRepository<TransactionLog, Long> {
    List<TransactionLog> findByWalletIdOrderByCreatedAtDesc(Long walletId);
}
