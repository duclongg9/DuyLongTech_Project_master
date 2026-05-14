package vn.com.duylongtech.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.com.duylongtech.backend.entity.Product;
import vn.com.duylongtech.backend.repository.ProductRepository;
import vn.com.duylongtech.backend.service.ChatAIService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final ChatAIService chatAIService;

    public ProductController(ProductRepository productRepository, ChatAIService chatAIService) {
        this.productRepository = productRepository;
        this.chatAIService = chatAIService;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // AI Shopping Assistant — Form-based, không chat tự do
    @GetMapping("/ai/consult")
    public ResponseEntity<?> aiConsult(
            @RequestParam long budget,
            @RequestParam(defaultValue = "office") String purpose,
            @RequestParam(defaultValue = "none") String gameLevel,
            @RequestParam(defaultValue = "balanced") String priority) {
        return ResponseEntity.ok(chatAIService.consultFromSurvey(budget, purpose, gameLevel, priority));
    }

    // AI SEO Generator — Cho Admin/Staff
    @GetMapping("/{id}/ai/seo")
    public ResponseEntity<?> generateSEO(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(chatAIService.generateSEO(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
