package vn.com.duylongtech.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.com.duylongtech.backend.entity.*;
import vn.com.duylongtech.backend.repository.*;

import java.math.BigDecimal;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(
            ProductRepository productRepo,
            CategoryRepository categoryRepo,
            UserRepository userRepo,
            DeviceComponentRepository componentRepo,
            ShipperWalletRepository walletRepo,
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepo.count() > 0) { System.out.println("✅ DB đã có dữ liệu, bỏ qua seed."); return; }

            // Users
            userRepo.save(User.builder().username("admin").password(passwordEncoder.encode("admin123"))
                    .fullName("Duy Long - Admin").email("admin@duylongtech.com.vn").phone("0988888888").role("ADMIN").build());
            userRepo.save(User.builder().username("staff").password(passwordEncoder.encode("staff123"))
                    .fullName("Nguyễn Kỹ Thuật").email("kythuat@duylongtech.com.vn").phone("0977777777").role("STAFF").build());
            userRepo.save(User.builder().username("user").password(passwordEncoder.encode("user123"))
                    .fullName("Khách Hàng Demo").email("khach@gmail.com").phone("0912345678").role("CUSTOMER")
                    .isPrimeMember(true).primeExpiry(java.time.LocalDateTime.now().plusYears(1)).build());
            // Shipper
            User shipper = userRepo.save(User.builder().username("shipper").password(passwordEncoder.encode("ship123"))
                    .fullName("Trần Văn Tài Xế").email("shipper@duylongtech.com.vn").phone("0966666666").role("SHIPPER").build());
            walletRepo.save(ShipperWallet.builder().user(shipper)
                    .balance(java.math.BigDecimal.valueOf(350000))
                    .totalCollected(java.math.BigDecimal.valueOf(2500000))
                    .totalSettled(java.math.BigDecimal.valueOf(2150000))
                    .deliveryCount(18).build());

            // Categories
            Category laptop = categoryRepo.save(Category.builder().name("Laptop").description("Máy tính xách tay").build());
            categoryRepo.save(Category.builder().name("Workstation").description("Máy trạm chuyên nghiệp").build());
            Category macbook = categoryRepo.save(Category.builder().name("MacBook").description("Apple MacBook").build());
            Category gaming = categoryRepo.save(Category.builder().name("Gaming").description("Laptop Gaming").build());


            // ===================== PRODUCTS =====================

            // [DELL - Like New 99%]
            productRepo.save(Product.builder()
                    .name("Dell Latitude 7420").brand("Dell").model("7420").sku("DL-LAT7420-001")
                    .condition("LIKE_NEW_99").conditionPct(99).conditionNote("Máy đẹp như mới, pin còn 97%")
                    .cpuBrand("Intel").cpuFamily("Core i5").cpuGeneration("11th Gen").cpuModel("i5-1145G7")
                    .cpuFullName("Intel Core i5-1145G7 (4C/8T, 2.6–4.4GHz, 15W)").cpuCores(4).cpuThreads(8)
                    .cpuBaseClock("2.6GHz").cpuBoostClock("4.4GHz").cpuTdp("15W")
                    .ramAmount("16GB").ramType("DDR4").ramSpeed("3200MHz").ramSlots(false)
                    .storageMain("256GB NVMe SSD").storageType("NVMe_M2").storageSlot(true)
                    .displaySize("14\"").displayRes("FHD 1920×1080").displayPanel("IPS").displayHz("60Hz").displayTouch(false)
                    .gpuType("INTEGRATED").gpuName("Intel Iris Xe Graphics")
                    .ports("2x USB-A 3.2, 1x USB-C/TB4, HDMI 2.0, RJ45, SD Card").battery("65Wh / ~10h").weight("1.36 kg")
                    .os("Windows 11 Pro").keyboard("Đèn nền xanh")
                    .basePrice(new BigDecimal("12500000")).minPrice(new BigDecimal("11800000")).costPrice(new BigDecimal("9000000"))
                    .priceNegotiable(false).callForPrice(false)
                    .inStock(true)
                    .category(laptop).description("Dòng doanh nhân cao cấp. Chuẩn quân sự MIL-STD-810H. Vân tay + IR Camera.")
                    .imageUrl("https://placehold.co/800x500/0A1628/06B6D4?text=Dell+Latitude+7420").build());

            // [DELL - Good 90%]
            productRepo.save(Product.builder()
                    .name("Dell XPS 13 9310").brand("Dell").model("9310").sku("DL-XPS13-001")
                    .condition("GOOD_90").conditionPct(90).conditionNote("Nắp máy xước nhẹ, bàn phím mờ 2-3 phím, pin 89%")
                    .cpuBrand("Intel").cpuFamily("Core i7").cpuGeneration("11th Gen").cpuModel("i7-1185G7")
                    .cpuFullName("Intel Core i7-1185G7 (4C/8T, 3.0–4.8GHz, 28W)").cpuCores(4).cpuThreads(8)
                    .cpuBaseClock("3.0GHz").cpuBoostClock("4.8GHz").cpuTdp("28W")
                    .ramAmount("16GB").ramType("LPDDR4X").ramSpeed("4266MHz").ramSlots(false)
                    .storageMain("512GB NVMe SSD").storageType("NVMe_M2").storageSlot(false)
                    .displaySize("13.4\"").displayRes("FHD+ 1920×1200").displayPanel("IPS").displayHz("60Hz").displayTouch(false)
                    .gpuType("INTEGRATED").gpuName("Intel Iris Xe Graphics")
                    .ports("2x USB-C/TB4").battery("52Wh / ~8h").weight("1.27 kg")
                    .os("Windows 11 Home").keyboard("Đèn nền trắng")
                    .basePrice(new BigDecimal("0")).priceNegotiable(true).callForPrice(true)
                    .priceNote("Giá dao động theo thị trường. Vui lòng liên hệ để có giá tốt nhất.")
                    .inStock(true)
                    .category(laptop).description("Flagship siêu mỏng của Dell. InfinityEdge viền siêu mỏng.")
                    .imageUrl("https://placehold.co/800x500/0A1628/06B6D4?text=Dell+XPS+13").build());

            // [ThinkPad - Like New 99%]
            productRepo.save(Product.builder()
                    .name("ThinkPad X1 Carbon Gen 9").brand("ThinkPad").model("X1C-G9").sku("TP-X1C9-001")
                    .condition("LIKE_NEW_99").conditionPct(99).conditionNote("Hàng công ty thanh lý, còn bảo hành hãng đến 2025")
                    .cpuBrand("Intel").cpuFamily("Core i7").cpuGeneration("11th Gen").cpuModel("i7-1185G7")
                    .cpuFullName("Intel Core i7-1185G7 (4C/8T, 3.0–4.8GHz, 28W)").cpuCores(4).cpuThreads(8)
                    .cpuBaseClock("3.0GHz").cpuBoostClock("4.8GHz").cpuTdp("28W")
                    .ramAmount("16GB").ramType("LPDDR4X").ramSpeed("4266MHz").ramSlots(false)
                    .storageMain("512GB NVMe SSD").storageType("NVMe_M2").storageSlot(false)
                    .displaySize("14\"").displayRes("FHD 1920×1080 IPS Anti-glare").displayPanel("IPS").displayHz("60Hz").displayTouch(false)
                    .gpuType("INTEGRATED").gpuName("Intel Iris Xe Graphics")
                    .ports("2x TB4, 2x USB-A 3.2, HDMI 2.0, 3.5mm").battery("57Wh / ~13h").weight("1.13 kg")
                    .os("Windows 11 Pro").keyboard("Đèn nền, TrackPoint đỏ")
                    .basePrice(new BigDecimal("18900000")).minPrice(new BigDecimal("18000000")).costPrice(new BigDecimal("14000000"))
                    .priceNegotiable(false).callForPrice(false)
                    .inStock(true)
                    .category(laptop).description("Huyền thoại siêu nhẹ chỉ 1.13kg. Bàn phím ThinkPad tốt nhất ngành.")
                    .imageUrl("https://placehold.co/800x500/0A1628/06B6D4?text=ThinkPad+X1+Carbon").build());

            // [HP - AMD]
            productRepo.save(Product.builder()
                    .name("ThinkPad T14s Gen 2 AMD").brand("ThinkPad").model("T14s-G2-AMD").sku("TP-T14S-001")
                    .condition("GOOD_95").conditionPct(95).conditionNote("Máy đẹp, pin 94%, có vài điểm xước nhỏ đáy máy")
                    .cpuBrand("AMD").cpuFamily("Ryzen 7").cpuGeneration("Zen3 (Cezanne)").cpuModel("Ryzen 7 5850U")
                    .cpuFullName("AMD Ryzen 7 5850U (8C/16T, 1.9–4.4GHz, 15W)").cpuCores(8).cpuThreads(16)
                    .cpuBaseClock("1.9GHz").cpuBoostClock("4.4GHz").cpuTdp("15W")
                    .ramAmount("16GB").ramType("DDR4").ramSpeed("3200MHz").ramSlots(false)
                    .storageMain("512GB NVMe SSD").storageType("NVMe_M2").storageSlot(true)
                    .displaySize("14\"").displayRes("FHD 1920×1080").displayPanel("IPS").displayHz("60Hz").displayTouch(false)
                    .gpuType("INTEGRATED").gpuName("AMD Radeon Graphics")
                    .ports("2x USB-A, 2x USB-C, HDMI, RJ45").battery("57Wh / ~11h").weight("1.27 kg")
                    .os("Windows 11 Pro").keyboard("Đèn nền")
                    .basePrice(new BigDecimal("14500000")).minPrice(new BigDecimal("13800000")).costPrice(new BigDecimal("10500000"))
                    .priceNegotiable(false).callForPrice(false)
                    .inStock(true)
                    .category(laptop).description("8 nhân AMD Ryzen mạnh mẽ, pin trâu 11h. Lý tưởng cho lập trình viên.")
                    .imageUrl("https://placehold.co/800x500/0A1628/06B6D4?text=ThinkPad+T14s+AMD").build());

            // [MacBook M2]
            productRepo.save(Product.builder()
                    .name("MacBook Air 13 M2 2022").brand("Apple").model("MacBook Air M2").sku("AP-MBA-M2-001")
                    .condition("LIKE_NEW_99").conditionPct(99).conditionNote("Máy mới 99%, pin còn 98 chu kỳ sạc")
                    .cpuBrand("Apple").cpuFamily("M2").cpuGeneration("M2").cpuModel("Apple M2")
                    .cpuFullName("Apple M2 (8 nhân CPU: 4P+4E, 10 nhân GPU)").cpuCores(8).cpuThreads(8)
                    .cpuBaseClock("N/A").cpuBoostClock("N/A").cpuTdp("10W")
                    .ramAmount("8GB").ramType("LPDDR5").ramSpeed("100GB/s (Unified)").ramSlots(false)
                    .storageMain("256GB NVMe SSD").storageType("NVMe_M2").storageSlot(false)
                    .displaySize("13.6\"").displayRes("2560×1664 Liquid Retina").displayPanel("IPS Liquid Retina").displayHz("60Hz").displayTouch(false)
                    .gpuType("INTEGRATED").gpuName("Apple 10-core GPU")
                    .ports("2x USB-C/TB3, MagSafe 3, 3.5mm").battery("52.6Wh / ~18h").weight("1.24 kg")
                    .os("macOS Ventura").keyboard("Đèn nền, Touch ID")
                    .basePrice(new BigDecimal("23500000")).minPrice(new BigDecimal("22800000")).costPrice(new BigDecimal("18000000"))
                    .priceNegotiable(false).callForPrice(false)
                    .inStock(true)
                    .category(macbook).description("Chip M2 cách mạng, không quạt, không ồn. Pin 18h thực tế.")
                    .imageUrl("https://placehold.co/800x500/0A1628/06B6D4?text=MacBook+Air+M2").build());

            // [Gaming - RTX]
            productRepo.save(Product.builder()
                    .name("Asus ROG Zephyrus G14 2023").brand("Asus").model("ROG G14 2023").sku("AS-ROGG14-001")
                    .condition("GOOD_95").conditionPct(95).conditionNote("Máy đẹp 95%, pin còn 91%, có phụ kiện đầy đủ")
                    .cpuBrand("AMD").cpuFamily("Ryzen 9").cpuGeneration("Zen4 (Phoenix)").cpuModel("Ryzen 9 7940HS")
                    .cpuFullName("AMD Ryzen 9 7940HS (8C/16T, 4.0–5.2GHz, 35W)").cpuCores(8).cpuThreads(16)
                    .cpuBaseClock("4.0GHz").cpuBoostClock("5.2GHz").cpuTdp("35-54W")
                    .ramAmount("16GB").ramType("DDR5").ramSpeed("4800MHz").ramSlots(true)
                    .storageMain("512GB NVMe SSD").storageType("NVMe_M2").storageSlot(true)
                    .displaySize("14\"").displayRes("2560×1600 QHD+").displayPanel("IPS").displayHz("165Hz").displayTouch(false)
                    .gpuType("DEDICATED").gpuName("NVIDIA GeForce RTX 4060 8GB GDDR6")
                    .ports("2x USB-A, 1x USB-C/TB4, HDMI 2.1, SD Card").battery("76Wh / ~8h").weight("1.72 kg")
                    .os("Windows 11 Home").keyboard("RGB Per-key Backlit")
                    .basePrice(new BigDecimal("0")).priceNegotiable(true).callForPrice(true)
                    .priceNote("Giá GPU dao động mạnh. Liên hệ để có báo giá mới nhất trong ngày.")
                    .inStock(true)
                    .category(gaming).description("Gaming laptop RTX 4060, màn QHD 165Hz, nhỏ gọn 1.72kg.")
                    .imageUrl("https://placehold.co/800x500/0A1628/06B6D4?text=ROG+G14+RTX+4060").build());

            // [HP Elitebook - Hỏi giá]
            productRepo.save(Product.builder()
                    .name("HP Elitebook 840 G8").brand("HP").model("840 G8").sku("HP-EB840G8-001")
                    .condition("GOOD_90").conditionPct(90).conditionNote("Đáy máy xước trầy, bàn phím mờ vài phím, pin 85%")
                    .cpuBrand("Intel").cpuFamily("Core i5").cpuGeneration("11th Gen").cpuModel("i5-1135G7")
                    .cpuFullName("Intel Core i5-1135G7 (4C/8T, 2.4–4.2GHz, 15W)").cpuCores(4).cpuThreads(8)
                    .cpuBaseClock("2.4GHz").cpuBoostClock("4.2GHz").cpuTdp("15W")
                    .ramAmount("8GB").ramType("DDR4").ramSpeed("3200MHz").ramSlots(true)
                    .storageMain("256GB NVMe SSD").storageType("NVMe_M2").storageSlot(true)
                    .displaySize("14\"").displayRes("FHD 1920×1080").displayPanel("IPS").displayHz("60Hz").displayTouch(false)
                    .gpuType("INTEGRATED").gpuName("Intel Iris Xe Graphics")
                    .ports("2x USB-A, 1x USB-C, HDMI, RJ45, SD Card").battery("53Wh / ~8h").weight("1.33 kg")
                    .os("Windows 10 Pro").keyboard("Đèn nền")
                    .basePrice(new BigDecimal("9500000")).minPrice(new BigDecimal("9000000")).costPrice(new BigDecimal("6500000"))
                    .priceNegotiable(true).callForPrice(false)
                    .priceNote("Có thể thương lượng khi mua nhiều hoặc combo phụ kiện.")
                    .inStock(true)
                    .category(laptop).description("Doanh nhân cao cấp HP với Sure View privacy screen tích hợp.")
                    .imageUrl("https://placehold.co/800x500/0A1628/06B6D4?text=HP+Elitebook+840").build());

            System.out.println("✅ Seed " + productRepo.count() + " sản phẩm thực tế.");

            // ===================== DEVICE COMPONENTS (Mã Con) =====================
            // Mỗi sản phẩm = 1 Mã Mẹ, bên trong có nhiều Mã Con (linh kiện)
            java.util.List<Product> allProducts = productRepo.findAll();
            for (Product p : allProducts) {
                // MAINBOARD
                componentRepo.save(DeviceComponent.builder().product(p).componentType("MAINBOARD")
                        .name(p.getBrand() + " " + p.getModel() + " System Board")
                        .serialNumber("MB-" + p.getId())
                        .manufacturer(p.getBrand())
                        .specs("Chipset " + (p.getCpuBrand().equals("Intel") ? "Intel PCH" : p.getCpuBrand().equals("AMD") ? "AMD FCH" : "Apple SoC"))
                        .status("OK").build());

                // CPU
                componentRepo.save(DeviceComponent.builder().product(p).componentType("CPU")
                        .name(p.getCpuFullName() != null ? p.getCpuFullName() : p.getCpuModel())
                        .serialNumber("CPU-" + p.getId() + "-" + (int)(Math.random()*9000+1000))
                        .manufacturer(p.getCpuBrand())
                        .specs(p.getCpuCores() + "C/" + p.getCpuThreads() + "T, " + p.getCpuBaseClock() + "-" + p.getCpuBoostClock() + ", TDP " + p.getCpuTdp())
                        .status("OK").build());

                // RAM
                componentRepo.save(DeviceComponent.builder().product(p).componentType("RAM")
                        .name(p.getRamAmount() + " " + p.getRamType() + " " + p.getRamSpeed())
                        .serialNumber("RAM-" + p.getId() + "-" + (int)(Math.random()*9000+1000))
                        .manufacturer(p.getRamType().contains("LP") ? "SK Hynix" : "Samsung")
                        .specs(p.getRamAmount() + " " + p.getRamType() + " @ " + p.getRamSpeed() + (Boolean.TRUE.equals(p.getRamSlots()) ? " (Có slot trống)" : " (Hàn chết)"))
                        .status("OK").build());

                // SSD
                componentRepo.save(DeviceComponent.builder().product(p).componentType("SSD")
                        .name(p.getStorageMain())
                        .serialNumber("SSD-" + p.getId() + "-" + (int)(Math.random()*9000+1000))
                        .manufacturer(p.getStorageMain().contains("256") ? "Western Digital" : "Samsung")
                        .specs(p.getStorageType() + (Boolean.TRUE.equals(p.getStorageSlot()) ? " (Có khe mở rộng)" : " (Không mở rộng)"))
                        .status("OK").build());

                // GPU
                componentRepo.save(DeviceComponent.builder().product(p).componentType("GPU")
                        .name(p.getGpuName())
                        .serialNumber("GPU-" + p.getId() + "-" + (int)(Math.random()*9000+1000))
                        .manufacturer(p.getGpuName().contains("Intel") ? "Intel" : p.getGpuName().contains("NVIDIA") ? "NVIDIA" : p.getGpuName().contains("AMD") ? "AMD" : "Apple")
                        .specs(p.getGpuType().equals("DEDICATED") ? "GPU rời, VRAM riêng" : "Tích hợp trên CPU")
                        .status("OK").build());

                // BATTERY
                componentRepo.save(DeviceComponent.builder().product(p).componentType("BATTERY")
                        .name("Pin " + p.getBattery())
                        .serialNumber("BAT-" + p.getId() + "-" + (int)(Math.random()*9000+1000))
                        .manufacturer(p.getBrand())
                        .specs(p.getBattery())
                        .status("OK")
                        .techNote("Kiểm tra chu kỳ sạc khi nhận BH").build());
            }
            System.out.println("✅ Seed " + componentRepo.count() + " linh kiện (Mã Con).");
        };
    }
}
