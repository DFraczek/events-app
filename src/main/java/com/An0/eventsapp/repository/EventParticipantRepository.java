package com.An0.eventsapp.repository;

import com.An0.eventsapp.entity.EventParticipant;
import com.An0.eventsapp.enums.ParticipantRole;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {
    Optional<EventParticipant> findByEventIdAndUserId(Long eventId, Long userId);

    List<EventParticipant> findByUserIdAndParticipantRole(Long userId, ParticipantRole role);

    long countByUserIdAndParticipantRole(Long userId, ParticipantRole role);

    @Query("SELECT COUNT(p) FROM EventParticipant p WHERE p.event.id = :eventId AND p.participantRole = :role")
    long countParticipantsByEventId(@Param("eventId") Long eventId, @Param("role") ParticipantRole role);

    @Query("SELECT p FROM EventParticipant p WHERE p.event.id = :eventId AND p.participantRole = :role")
    Optional<EventParticipant> findOrganizerByEventId(@Param("eventId") Long eventId, @Param("role") ParticipantRole role);

    @Transactional
    void deleteByEventId(Long eventId);
}