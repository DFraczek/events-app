package com.An0.eventsapp.controller;

import com.An0.eventsapp.dto.UserResponseDTO;
import com.An0.eventsapp.entity.User;
import com.An0.eventsapp.repository.UserRepository;
import com.An0.eventsapp.service.LocalStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {

    private final UserRepository userRepository;
    private final LocalStorageService storageService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(mapToDTO(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateCurrentUser(@RequestBody UserResponseDTO updateData) {
        User user = getAuthenticatedUser();

        user.setName(updateData.getName());
        user.setSurname(updateData.getSurname());
        user.setLocation(updateData.getLocation());
        user.setDescription(updateData.getDescription());
        user.setImageUrl(updateData.getImage_url());

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(mapToDTO(savedUser));
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        User user = getAuthenticatedUser();

        try {
            if (user.getImageUrl() != null && !user.getImageUrl().isEmpty()) {
                storageService.deleteFileByUrl(user.getImageUrl());
            }

            String publicUrl = storageService.uploadFile(file, "avatar", user.getId(), "profile");

            user.setImageUrl(publicUrl);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("url", publicUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Błąd podczas przesyłania pliku: " + e.getMessage());
        }
    }
    @DeleteMapping("/avatar")
    public ResponseEntity<?> removeAvatar() {
        User user = getAuthenticatedUser();
        if (user.getImageUrl() != null) {
            storageService.deleteFileByUrl(user.getImageUrl());
            user.setImageUrl(null);
            userRepository.save(user);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Użytkownik o ID " + id + " nie został znaleziony"));
        return ResponseEntity.ok(mapToDTO(user));
    }

    private User getAuthenticatedUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony w bazie: " + email));
    }

    private UserResponseDTO mapToDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setSurname(user.getSurname());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        dto.setDescription(user.getDescription());
        dto.setLocation(user.getLocation());
        dto.setImage_url(user.getImageUrl());
        return dto;
    }
}