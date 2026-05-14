package vn.com.duylongtech.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.com.duylongtech.backend.service.ChatAIService;

import java.util.Map;

@RestController
@RequestMapping("/api/pc-builder")
public class PcBuilderController {

    private final ChatAIService chatAIService;

    public PcBuilderController(ChatAIService chatAIService) {
        this.chatAIService = chatAIService;
    }

    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateConfig(@RequestBody Map<String, String> config) {
        Map<String, Object> result = chatAIService.evaluatePcConfig(config);
        return ResponseEntity.ok(result);
    }
}
