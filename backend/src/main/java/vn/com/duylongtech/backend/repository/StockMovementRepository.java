package vn.com.duylongtech.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.com.duylongtech.backend.entity.StockMovement;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    // Tồn kho thực tế (Available) của 1 sản phẩm tại 1 kho
    @Query("SELECT COALESCE(SUM(sm.quantityChange), 0) FROM StockMovement sm " +
           "WHERE sm.product.id = :productId AND sm.warehouse.id = :warehouseId AND sm.itemStatus = :status")
    int getStockByProductAndWarehouseAndStatus(
            @Param("productId") Long productId,
            @Param("warehouseId") Long warehouseId,
            @Param("status") String status);

    // Tồn kho tổng (tất cả kho) của 1 sản phẩm theo trạng thái
    @Query("SELECT COALESCE(SUM(sm.quantityChange), 0) FROM StockMovement sm " +
           "WHERE sm.product.id = :productId AND sm.itemStatus = :status")
    int getTotalStockByProductAndStatus(
            @Param("productId") Long productId,
            @Param("status") String status);

    // Lịch sử biến động của 1 sản phẩm
    List<StockMovement> findByProductIdOrderByMovementDateDesc(Long productId);

    // Lịch sử theo reference (đơn hàng, ticket)
    List<StockMovement> findByReferenceId(String referenceId);
}
