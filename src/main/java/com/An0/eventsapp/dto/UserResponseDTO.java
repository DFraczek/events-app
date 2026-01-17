package com.An0.eventsapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {
    private Long id;
    private String name;
    private String surname;
    private String email;
    private String role;
    private String description;
    private String location;
    private String image_url;
}
