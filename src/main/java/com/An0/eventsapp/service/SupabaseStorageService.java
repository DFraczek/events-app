package com.An0.eventsapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket.profile}")
    private String profileBucket;

    @Value("${supabase.bucket.events}")
    private String eventsBucket;

    public String uploadFile(MultipartFile file, String prefix, Long id, String bucketType) throws IOException {
        String targetBucket = "profile".equalsIgnoreCase(bucketType) ? profileBucket : eventsBucket;

        String fileExtension = getFileExtension(file.getOriginalFilename());
        String fileName = prefix + "-" + id + "-" + System.currentTimeMillis() + "." + fileExtension;

        String uploadUrl = supabaseUrl + "/storage/v1/object/" + targetBucket + "/" + fileName;

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseKey);
        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.setContentType(MediaType.valueOf(file.getContentType()));

        HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                return supabaseUrl + "/storage/v1/object/public/" + targetBucket + "/" + fileName;
            }
        } catch (Exception e) {
            throw new RuntimeException("Błąd Supabase (" + targetBucket + "): " + e.getMessage());
        }
        throw new RuntimeException("Nieoczekiwany błąd podczas uploadu");
    }

    public void deleteFileByUrl(String fileUrl) {
        if (fileUrl == null) return;

        String targetBucket = fileUrl.contains(eventsBucket) ? eventsBucket : profileBucket;

        try {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            String deleteUrl = supabaseUrl + "/storage/v1/object/" + targetBucket + "/" + fileName;

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseKey);
            headers.set("Authorization", "Bearer " + supabaseKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, entity, String.class);
        } catch (Exception e) {
            System.err.println("Nie udało się usunąć pliku: " + e.getMessage());
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "jpg";
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
}