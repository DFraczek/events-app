
package com.An0.eventsapp.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
public class LocalStorageServiceController {

    private final Path storageLocation;

    public LocalStorageServiceController(
            @Value("${app.storage.location:/app/uploads}") String storageLocation) {
        this.storageLocation = Paths.get(storageLocation)
                .toAbsolutePath()
                .normalize();
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> getFile(
            @PathVariable String fileName) throws IOException {

        Path filePath = storageLocation.resolve(fileName).normalize();

        if (!filePath.getParent().equals(storageLocation)) {
            return ResponseEntity.badRequest().build();
        }

        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = java.nio.file.Files.probeContentType(filePath);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;

        if (contentType != null) {
            try {
                mediaType = MediaType.parseMediaType(contentType);
            } catch (IllegalArgumentException ignored) {
                // Keep the default content type.
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header("X-Content-Type-Options", "nosniff")
                .body(resource);
    }
}
