package com.An0.eventsapp.entity;

import com.An0.eventsapp.enums.ParticipantRole;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "event_participants")
@Data
public class EventParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Enumerated(EnumType.STRING)
    @Column(name = "participant_role")
    private ParticipantRole participantRole;
}