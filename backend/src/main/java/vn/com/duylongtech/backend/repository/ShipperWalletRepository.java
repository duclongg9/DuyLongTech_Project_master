package vn.com.duylongtech.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.duylongtech.backend.entity.ShipperWallet;
import java.util.Optional;

public interface ShipperWalletRepository extends JpaRepository<ShipperWallet, Long> {
    Optional<ShipperWallet> findByUserId(Long userId);
}
