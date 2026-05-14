package vn.com.duylongtech.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.duylongtech.backend.entity.SiteSetting;

public interface SiteSettingRepository extends JpaRepository<SiteSetting, String> {
}
