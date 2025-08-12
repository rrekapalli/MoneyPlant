package com.moneyplant.trading.storage.api;

import com.moneyplant.trading.storage.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
@Slf4j
public class StorageController {

    private final StorageService storageService;

    @PostMapping("/write")
    public ResponseEntity<String> writeData(@RequestBody String data) {
        log.info("Writing data to storage");
        // TODO: implement
        return ResponseEntity.ok("Data written successfully");
    }

    @GetMapping("/read")
    public ResponseEntity<String> readData(@RequestParam String query) {
        log.info("Reading data from storage with query: {}", query);
        // TODO: implement
        return ResponseEntity.ok("Data read successfully");
    }

    @PostMapping("/hudi/write")
    public ResponseEntity<String> writeHudiData(@RequestBody String data) {
        log.info("Writing data to Hudi storage");
        // TODO: implement
        return ResponseEntity.ok("Hudi data written successfully");
    }

    @PostMapping("/iceberg/write")
    public ResponseEntity<String> writeIcebergData(@RequestBody String data) {
        log.info("Writing data to Iceberg storage");
        // TODO: implement
        return ResponseEntity.ok("Iceberg data written successfully");
    }
}
