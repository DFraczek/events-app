package com.An0.eventsapp.entity;

import com.An0.eventsapp.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String surname;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    private String password;

    private String description;

    private String location;

    @Column(name = "image_url")
    private String imageUrl;

}
