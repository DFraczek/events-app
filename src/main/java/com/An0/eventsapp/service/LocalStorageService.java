
package com.An0.eventsapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalStorageService {

    private final Path storageLocation;

    public LocalStorageService(
            @Value("${app.storage.location:/app/uploads}") String storageLocation) {
        this.storageLocation = Paths.get(storageLocation)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Nie można utworzyć katalogu na pliki", e);
        }
    }

    public String uploadFile(
            MultipartFile file, String prefix, Long id, String bucketType)
            throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Plik jest pusty");
        }

        String originalName = file.getOriginalFilename();
        String extension = "";

        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(
                    originalName.lastIndexOf(".")).toLowerCase();
        }

        String fileName = prefix + "-" + id + "-"
                + UUID.randomUUID() + extension;

        Path target = storageLocation.resolve(fileName).normalize();

        if (!target.getParent().equals(storageLocation)) {
            throw new IllegalArgumentException("Nieprawidłowa nazwa pliku");
        }

        file.transferTo(target);

        return "/uploads/" + fileName;
    }

    public void deleteFileByUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        String fileName = fileUrl.substring(
                fileUrl.lastIndexOf("/") + 1);

        if (fileName.isBlank() || fileName.contains("..")) {
            return;
        }

        Path target = storageLocation.resolve(fileName).normalize();

        if (!target.getParent().equals(storageLocation)) {
            return;
        }

        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Nie udało się usunąć pliku", e);
        }
    }
}
