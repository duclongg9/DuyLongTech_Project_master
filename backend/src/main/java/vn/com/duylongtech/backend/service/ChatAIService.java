package vn.com.duylongtech.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vn.com.duylongtech.backend.entity.Product;
import vn.com.duylongtech.backend.repository.ProductRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatAIService {

    private final ProductRepository productRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public ChatAIService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ============================================================
    // 1. AI TƯ VẤN CHỌN MÁY — Prompt chuẩn hóa, format cố định
    // ============================================================
    public Map<String, Object> consultFromSurvey(long budgetMax, String purpose, String gameLevel, String priority) {

        List<Product> available = productRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getInStock()))
                .collect(Collectors.toList());

        // Tạo bảng sản phẩm dạng text rõ ràng cho AI
        StringBuilder inventory = new StringBuilder();
        for (Product p : available) {
            inventory.append(String.format(
                "| ID:%d | %s | %s | %s | RAM %s | GPU: %s | Giá: %s VNĐ | Tình trạng: %s |\n",
                p.getId(), p.getName(), p.getBrand(), p.getCpuModel(), p.getRamAmount(),
                p.getGpuName(), p.getBasePrice(),
                p.getCondition() != null ? p.getCondition() : "N/A"
            ));
        }

        String purposeLabel = switch (purpose) {
            case "gaming" -> "Chơi game (LOL, Valorant, GTA, Cyberpunk)";
            case "design" -> "Đồ họa, thiết kế, dựng phim (Photoshop, Premiere, Blender)";
            default -> "Văn phòng, học tập, lập trình";
        };
        String gameLabel = switch (gameLevel) {
            case "light" -> "Game nhẹ (LOL, Valorant, CS2)";
            case "heavy" -> "Game nặng AAA (GTA V, Cyberpunk 2077)";
            default -> "Không chơi game";
        };
        String priorityLabel = switch (priority) {
            case "performance" -> "Hiệu năng mạnh nhất có thể";
            case "battery" -> "Pin lâu, máy nhẹ";
            case "price" -> "Giá rẻ nhất có thể";
            default -> "Cân bằng giữa hiệu năng và giá";
        };

        String prompt =
            "Bạn là chuyên gia tư vấn laptop tại cửa hàng Máy Tính Duy Long (DuyLongTech). " +
            "Khách hàng đã trả lời khảo sát với thông tin sau:\n\n" +
            "- Ngân sách tối đa: " + String.format("%,d", budgetMax) + " VNĐ\n" +
            "- Mục đích sử dụng: " + purposeLabel + "\n" +
            "- Nhu cầu game: " + gameLabel + "\n" +
            "- Ưu tiên: " + priorityLabel + "\n\n" +
            "Danh sách máy đang có trong kho:\n" + inventory + "\n" +
            "BẮT BUỘC trả lời đúng theo cấu trúc sau (không được thay đổi thứ tự, không thêm mục):\n\n" +
            "## Phân tích nhu cầu\n" +
            "(Viết 2-3 câu phân tích ngắn gọn nhu cầu thực tế của khách, dựa trên mục đích và ngân sách)\n\n" +
            "## Đề xuất của chuyên gia\n" +
            "(Giới thiệu 1-3 máy phù hợp nhất từ danh sách kho, giải thích ngắn tại sao mỗi máy phù hợp. " +
            "Mỗi máy trên 1 dòng, bắt đầu bằng dấu - . Ghi rõ tên máy, CPU, RAM, giá.)\n\n" +
            "## Lưu ý khi mua\n" +
            "(2-3 gạch đầu dòng lời khuyên thực tế: nâng cấp RAM, chọn SSD, kiểm tra kỹ tình trạng...)\n\n" +
            "Dòng cuối cùng BẮT BUỘC ghi: [MATCHED_IDS: x, y, z] " +
            "(thay x, y, z bằng ID sản phẩm đã đề xuất, tối đa 3 ID, chỉ chọn từ danh sách kho trên).\n" +
            "Nếu không có máy phù hợp ngân sách, vẫn ghi [MATCHED_IDS: ] và giải thích lý do.\n" +
            "KHÔNG dùng emoji. KHÔNG dùng markdown bold (**). Viết tiếng Việt tự nhiên, giọng chuyên gia thân thiện.";

        String aiResponse = callGemini(prompt);

        // Parse matched IDs
        List<Long> matchedIds = parseIds(aiResponse);
        List<Product> matchedProducts = matchedIds.stream()
                .map(id -> productRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Cắt bỏ dòng [MATCHED_IDS:...] khỏi nội dung hiển thị
        String cleanAdvice = aiResponse.replaceAll("\\[MATCHED_IDS:.*?\\]", "").trim();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("advice", cleanAdvice);
        result.put("products", matchedProducts.stream().map(this::productToMap).collect(Collectors.toList()));
        result.put("matchedCount", matchedProducts.size());

        return result;
    }

    // ============================================================
    // 2. AI SEO GENERATOR — Prompt ép output HTML chuẩn
    // ============================================================
    public Map<String, String> generateSEO(Long productId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        String conditionVi = switch (p.getCondition() != null ? p.getCondition() : "") {
            case "LIKE_NEW_99" -> "Like New 99%";
            case "GOOD_95" -> "Đẹp 95%";
            case "GOOD_90" -> "Tốt 90%";
            case "NEW" -> "Mới 100%";
            default -> "Like New";
        };

        String prompt =
            "Viết bài viết chuẩn SEO cho sản phẩm laptop bán tại cửa hàng Máy Tính Duy Long (DuyLongTech).\n\n" +
            "THÔNG TIN SẢN PHẨM:\n" +
            "- Tên: " + p.getName() + "\n" +
            "- Thương hiệu: " + p.getBrand() + "\n" +
            "- CPU: " + (p.getCpuFullName() != null ? p.getCpuFullName() : p.getCpuModel()) + "\n" +
            "- RAM: " + p.getRamAmount() + " " + (p.getRamType() != null ? p.getRamType() : "") + "\n" +
            "- Ổ cứng: " + p.getStorageMain() + "\n" +
            "- Màn hình: " + p.getDisplaySize() + " " + (p.getDisplayRes() != null ? p.getDisplayRes() : "") + " " + (p.getDisplayPanel() != null ? p.getDisplayPanel() : "") + "\n" +
            "- GPU: " + (p.getGpuName() != null ? p.getGpuName() : "Intel Integrated") + "\n" +
            "- Tình trạng: " + conditionVi + "\n" +
            "- Giá: " + (Boolean.TRUE.equals(p.getCallForPrice()) ? "Liên hệ" : 
                (p.getBasePrice() != null ? String.format("%,d VNĐ", p.getBasePrice().longValue()) : "Liên hệ")) + "\n\n" +
            "YÊU CẦU OUTPUT (tuân thủ chính xác cấu trúc sau):\n\n" +
            "[META_TITLE]\n" +
            "(Viết Meta Title dưới 60 ký tự, chứa tên sản phẩm + từ khóa 'Like New' hoặc 'Chính hãng' + DuyLongTech)\n\n" +
            "[META_DESC]\n" +
            "(Viết Meta Description 120-155 ký tự, tóm tắt ưu điểm chính: cấu hình, giá, bảo hành)\n\n" +
            "[ARTICLE]\n" +
            "# (Tiêu đề h1 - chứa tên sản phẩm)\n\n" +
            "(Đoạn mở đầu 2-3 câu giới thiệu sản phẩm, nhấn mạnh tình trạng máy)\n\n" +
            "## Thông số kỹ thuật chi tiết\n" +
            "(Liệt kê thông số dạng gạch đầu dòng: CPU, RAM, SSD, Màn hình, GPU, Pin, Cổng kết nối)\n\n" +
            "## Đánh giá hiệu năng thực tế\n" +
            "(2-3 đoạn ngắn phân tích CPU, GPU phù hợp tác vụ gì. Viết thực tế, không phóng đại)\n\n" +
            "## Tại sao nên mua tại DuyLongTech?\n" +
            "(3-4 gạch đầu dòng: kiểm tra kỹ, hỗ trợ kỹ thuật, freeship)\n\n" +
            "## Câu hỏi thường gặp (FAQ)\n" +
            "(3 câu hỏi + trả lời ngắn, mỗi câu bắt đầu bằng 'Hỏi:' và 'Đáp:')\n\n" +
            "QUY TẮC VIẾT:\n" +
            "- Viết tiếng Việt tự nhiên, giọng chuyên gia đáng tin cậy\n" +
            "- KHÔNG dùng emoji\n" +
            "- KHÔNG dùng markdown bold (**text**), chỉ dùng heading (#, ##) và gạch đầu dòng (-)\n" +
            "- Không lặp lại thông số đã có trong phần khác\n" +
            "- Tổng bài viết 400-600 từ";

        String aiResponse = callGemini(prompt);

        // Parse structured response
        Map<String, String> seo = new LinkedHashMap<>();

        String metaTitle = extractSection(aiResponse, "[META_TITLE]", "[META_DESC]");
        String metaDesc = extractSection(aiResponse, "[META_DESC]", "[ARTICLE]");
        String article = extractAfter(aiResponse, "[ARTICLE]");

        // Fallback nếu AI không tuân thủ format
        if (metaTitle.isEmpty()) {
            metaTitle = p.getName() + " " + conditionVi + " - DuyLongTech";
        }
        if (metaDesc.isEmpty()) {
            metaDesc = p.getName() + " " + conditionVi + ", " + p.getCpuModel() + ", " + p.getRamAmount() + ".";
        }
        if (article.isEmpty()) {
            article = aiResponse; // Dùng toàn bộ response nếu không parse được
        }

        // Đếm từ chính xác
        int wordCount = article.trim().split("\\s+").length;

        seo.put("metaTitle", metaTitle.trim());
        seo.put("metaDescription", metaDesc.trim());
        seo.put("article", article.trim());
        seo.put("wordCount", String.valueOf(wordCount));

        return seo;
    }

    // ============================================================
    // 3. PC BUILDER — Chấm điểm cấu hình (prompt JSON nghiêm ngặt)
    // ============================================================
    public Map<String, Object> evaluatePcConfig(Map<String, String> config) {
        String prompt =
            "Bạn là chuyên gia phần cứng PC. Chấm điểm cấu hình build PC sau:\n\n" +
            "- CPU: " + config.get("cpu") + "\n" +
            "- GPU: " + config.get("gpu") + "\n" +
            "- RAM: " + config.get("ram") + "\n" +
            "- SSD: " + config.get("ssd") + "\n\n" +
            "Trả về ĐÚNG JSON sau, KHÔNG có text nào khác, KHÔNG có markdown code block:\n" +
            "{\n" +
            "  \"score\": <điểm tổng 0-100>,\n" +
            "  \"performance\": <điểm CPU 0-100>,\n" +
            "  \"gaming\": <điểm gaming 0-100>,\n" +
            "  \"multitasking\": <điểm đa nhiệm 0-100>,\n" +
            "  \"value\": <điểm giá trị 0-100>,\n" +
            "  \"rank\": \"<Đồng|Bạc|Vàng|Bạch Kim|Kim Cương>\",\n" +
            "  \"comment\": \"<1 câu nhận xét ngắn gọn tiếng Việt, hài hước, kích thích nâng cấp nếu chưa đạt Kim Cương>\"\n" +
            "}\n\n" +
            "Tiêu chí xếp hạng: Đồng (0-30), Bạc (31-50), Vàng (51-70), Bạch Kim (71-85), Kim Cương (86-100).\n" +
            "CHỈ trả về JSON thuần, không có bất kỳ text giải thích nào.";

        try {
            String aiResponse = callGemini(prompt);
            // Dọn dẹp markdown code block nếu AI vẫn sinh ra
            aiResponse = aiResponse.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            // Tìm JSON object trong response
            int jsonStart = aiResponse.indexOf('{');
            int jsonEnd = aiResponse.lastIndexOf('}');
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                aiResponse = aiResponse.substring(jsonStart, jsonEnd + 1);
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = objectMapper.readValue(aiResponse, Map.class);
            return parsed;
        } catch (Exception e) {
            System.err.println("PC Evaluator parse error: " + e.getMessage());
            Map<String, Object> fallback = new LinkedHashMap<>();
            fallback.put("score", 75);
            fallback.put("performance", 70);
            fallback.put("gaming", 80);
            fallback.put("multitasking", 75);
            fallback.put("value", 85);
            fallback.put("rank", "Vàng");
            fallback.put("comment", "AI đang bảo trì. Cấu hình này khá tốt, nâng cấp RAM 32GB sẽ lên Bạch Kim!");
            return fallback;
        }
    }

    // ============================================================
    // GEMINI API CALLER (với retry)
    // ============================================================
    private String callGemini(String prompt) {
        if (apiKey == null || apiKey.equals("YOUR_API_KEY_HERE") || apiKey.startsWith("AIzaSy-placeholder")) {
            return "Hệ thống AI chưa được cấu hình API Key. Vui lòng kiểm tra file application.properties.";
        }

        int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, Object> part = new HashMap<>();
                part.put("text", prompt);

                Map<String, Object> content = new HashMap<>();
                content.put("parts", Collections.singletonList(part));

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("contents", Collections.singletonList(content));

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                String response = restTemplate.postForObject(apiUrl + "?key=" + apiKey, entity, String.class);

                JsonNode root = objectMapper.readTree(response);
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    return candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                }
                return "AI không trả về kết quả. Vui lòng thử lại.";
            } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
                System.err.println("Gemini 429 (attempt " + attempt + "/" + maxRetries + ")");
                if (attempt < maxRetries) {
                    try { Thread.sleep(attempt * 5000L); } catch (InterruptedException ignored) {}
                } else {
                    return "AI đang quá tải. Vui lòng chờ 30 giây rồi thử lại.";
                }
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                System.err.println("Gemini HTTP " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
                return "Lỗi AI (HTTP " + e.getStatusCode().value() + "): " + e.getResponseBodyAsString();
            } catch (Exception e) {
                System.err.println("Gemini Error: " + e.getMessage());
                return "Lỗi kết nối AI: " + e.getMessage();
            }
        }
        return "AI không phản hồi. Vui lòng thử lại sau.";
    }

    // ============================================================
    // HELPERS
    // ============================================================

    /** Parse [MATCHED_IDS: 1, 2, 3] từ text AI */
    private List<Long> parseIds(String text) {
        List<Long> ids = new ArrayList<>();
        try {
            int start = text.indexOf("[MATCHED_IDS:");
            if (start != -1) {
                int end = text.indexOf("]", start);
                String idStr = text.substring(start + 13, end).trim();
                if (!idStr.isEmpty()) {
                    for (String id : idStr.split(",")) {
                        String trimmed = id.trim();
                        if (!trimmed.isEmpty()) {
                            ids.add(Long.parseLong(trimmed));
                        }
                    }
                }
            }
        } catch (Exception ignored) {}
        return ids;
    }

    /** Trích xuất nội dung giữa 2 marker */
    private String extractSection(String text, String startMarker, String endMarker) {
        try {
            int start = text.indexOf(startMarker);
            if (start == -1) return "";
            start += startMarker.length();
            int end = text.indexOf(endMarker, start);
            if (end == -1) return text.substring(start).trim();
            return text.substring(start, end).trim();
        } catch (Exception e) {
            return "";
        }
    }

    /** Trích xuất nội dung sau marker */
    private String extractAfter(String text, String marker) {
        try {
            int start = text.indexOf(marker);
            if (start == -1) return "";
            return text.substring(start + marker.length()).trim();
        } catch (Exception e) {
            return "";
        }
    }

    /** Product entity → Map cho JSON response */
    private Map<String, Object> productToMap(Product p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("name", p.getName());
        m.put("cpu", p.getCpuModel());
        m.put("ram", p.getRamAmount());
        m.put("storage", p.getStorageMain());
        m.put("gpu", p.getGpuName());
        m.put("condition", p.getCondition());
        m.put("price", p.getBasePrice());
        m.put("imageUrl", p.getImageUrl());
        return m;
    }
}
