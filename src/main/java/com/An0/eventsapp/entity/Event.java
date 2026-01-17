package com.An0.eventsapp.entity;

import com.An0.eventsapp.enums.EventCategory;
import com.An0.eventsapp.enums.EventStatus;
import com.An0.eventsapp.enums.ParticipantRole;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private String location;

    @Column(name = "start_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    private String photo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventCategory category;

    @Column(name = "number_of_participants", nullable = false)
    private Integer numberOfParticipants;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_status")
    private EventStatus eventStatus;

    @Transient
    private long registeredCount;

    @Transient
    private Long organizerId;

    @Transient
    private String organizerName;

    @Transient
    private ParticipantRole userRole;

}
