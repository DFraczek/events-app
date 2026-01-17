package com.An0.eventsapp.controller;

import com.An0.eventsapp.entity.Event;
import com.An0.eventsapp.entity.EventParticipant;
import com.An0.eventsapp.entity.User;
import com.An0.eventsapp.enums.EventCategory;
import com.An0.eventsapp.enums.EventStatus;
import com.An0.eventsapp.enums.ParticipantRole;
import com.An0.eventsapp.repository.EventParticipantRepository;
import com.An0.eventsapp.repository.EventRepository;
import com.An0.eventsapp.repository.UserRepository;
import com.An0.eventsapp.service.SupabaseStorageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin
public class EventController {

    private final EventRepository eventRepository;
    private final EventParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final SupabaseStorageService supabaseStorageService;

    @GetMapping
    public List<Event> getAllEvents() {
        User currentUser = getAuthenticatedUser();
        List<Event> events = eventRepository.findAll();

        for (Event event : events) {
            long count = participantRepository.countParticipantsByEventId(event.getId(), ParticipantRole.PARTICIPANT);
            event.setRegisteredCount(count);

            participantRepository.findByEventIdAndUserId(event.getId(), currentUser.getId())
                    .ifPresent(p -> event.setUserRole(p.getParticipantRole()));

            participantRepository.findOrganizerByEventId(event.getId(), ParticipantRole.ORGANIZER)
                    .ifPresent(p -> {
                        User organizer = p.getUser();
                        event.setOrganizerId(p.getUser().getId());
                        event.setOrganizerName(organizer.getName() + " " + organizer.getSurname());
                    });
        }
        return events;
    }

    @GetMapping("/search/category")
    public List<Event> getEventsByCategory(@RequestParam EventCategory category) {
        return eventRepository.findByCategory(category);
    }

    @GetMapping("/search/status")
    public List<Event> getEventsByStatus(@RequestParam EventStatus status) {
        return eventRepository.findByEventStatus(status);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Event> createEvent(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate,
            @RequestParam("location") String location,
            @RequestParam("category") EventCategory category,
            @RequestParam("numberOfParticipants") Integer numberOfParticipants,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        User currentUser = getAuthenticatedUser();

        Event event = new Event();
        event.setName(name);
        event.setDescription(description);
        event.setStartDate(LocalDateTime.parse(startDate));
        event.setEndDate(LocalDateTime.parse(endDate));
        event.setLocation(location);
        event.setCategory(category);
        event.setNumberOfParticipants(numberOfParticipants);
        event.setEventStatus(EventStatus.NADCHODZACE);

        if (image != null && !image.isEmpty()) {
            String imageUrl = supabaseStorageService.uploadFile(image, "event", currentUser.getId(), "events");
            event.setPhoto(imageUrl);
        }

        Event savedEvent = eventRepository.save(event);

        EventParticipant organizer = new EventParticipant();
        organizer.setUser(currentUser);
        organizer.setEvent(savedEvent);
        organizer.setParticipantRole(ParticipantRole.ORGANIZER);
        participantRepository.save(organizer);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedEvent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody Event eventDetails) {
        User currentUser = getAuthenticatedUser();

        EventParticipant participant = participantRepository.findByEventIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono powiązania z wydarzeniem"));

        if (participant.getParticipantRole() != ParticipantRole.ORGANIZER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Tylko organizator może edytować wydarzenie"));
        }

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wydarzenie o podanym ID nie istnieje"));

        event.setName(eventDetails.getName());
        event.setDescription(eventDetails.getDescription());
        event.setLocation(eventDetails.getLocation());
        event.setStartDate(eventDetails.getStartDate());
        event.setEndDate(eventDetails.getEndDate());
        event.setPhoto(eventDetails.getPhoto());
        event.setCategory(eventDetails.getCategory());
        event.setEventStatus(eventDetails.getEventStatus());
        event.setNumberOfParticipants(eventDetails.getNumberOfParticipants());

        Event updatedEvent = eventRepository.save(event);
        return ResponseEntity.ok(updatedEvent);
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinEvent(@PathVariable Long id) {
        User currentUser = getAuthenticatedUser();

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wydarzenie nie istnieje"));

        boolean alreadyJoined = participantRepository.findByEventIdAndUserId(id, currentUser.getId()).isPresent();
        if (alreadyJoined) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Jesteś już przypisany do tego wydarzenia"));
        }

        long currentParticipantsCount = participantRepository.countParticipantsByEventId(id, ParticipantRole.PARTICIPANT);

        if (event.getNumberOfParticipants() != null && currentParticipantsCount >= event.getNumberOfParticipants()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Brak wolnych miejsc na to wydarzenie"));
        }

        EventParticipant participant = new EventParticipant();
        participant.setUser(currentUser);
        participant.setEvent(event);
        participant.setParticipantRole(ParticipantRole.PARTICIPANT);

        participantRepository.save(participant);
        return ResponseEntity.ok(Map.of("message", "Pomyślnie zapisano na wydarzenie"));
    }

    @DeleteMapping("/{id}/leave")
    @Transactional
    public ResponseEntity<?> leaveEvent(@PathVariable Long id) {
        User currentUser = getAuthenticatedUser();

        EventParticipant participant = participantRepository.findByEventIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Nie jesteś uczestnikiem tego wydarzenia"));

        if (participant.getParticipantRole() == ParticipantRole.ORGANIZER) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Organizator nie może wypisać się z wydarzenia."));
        }

        participantRepository.delete(participant);
        return ResponseEntity.ok(Map.of("message", "Pomyślnie wypisano się z wydarzenia"));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        User currentUser = getAuthenticatedUser();

        EventParticipant participant = participantRepository.findByEventIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono uczestnikow wydarzenia"));

        if (participant.getParticipantRole() != ParticipantRole.ORGANIZER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Tylko organizator może usunąć wydarzenie"));
        }

        participantRepository.deleteByEventId(id);
        eventRepository.deleteById(id);

        return ResponseEntity.ok(Map.of("message", "Wydarzenie usunięte"));
    }

    @GetMapping("/my-organized")
    public List<Event> getMyOrganizedEvents() {
        User currentUser = getAuthenticatedUser();
        String currentUserName = currentUser.getName() + " " + currentUser.getSurname();

        List<EventParticipant> participations = participantRepository.findByUserIdAndParticipantRole(currentUser.getId(), ParticipantRole.ORGANIZER);

        return participations.stream()
                .map(p -> {
                    Event event = p.getEvent();
                    long count = participantRepository.countParticipantsByEventId(event.getId(), ParticipantRole.PARTICIPANT);
                    event.setRegisteredCount(count);
                    event.setOrganizerId(currentUser.getId());
                    event.setOrganizerName(currentUserName);
                    return event;
                })
                .toList();
    }

    @GetMapping("/organized/count")
    public ResponseEntity<Long> getOrganizedCount() {
        User currentUser = getAuthenticatedUser();
        long count = participantRepository.countByUserIdAndParticipantRole(
                currentUser.getId(),
                ParticipantRole.ORGANIZER
        );
        return ResponseEntity.ok(count);
    }

    @GetMapping("/registered/count")
    public ResponseEntity<Long> getRegisteredCount() {
        User currentUser = getAuthenticatedUser();
        long count = participantRepository.countByUserIdAndParticipantRole(
                currentUser.getId(),
                ParticipantRole.PARTICIPANT
        );
        return ResponseEntity.ok(count);
    }

    @GetMapping("/my-joined")
    public List<Event> getMyJoinedEvents() {
        User currentUser = getAuthenticatedUser();

        List<EventParticipant> participations = participantRepository
                .findByUserIdAndParticipantRole(currentUser.getId(), ParticipantRole.PARTICIPANT);

        return participations.stream()
                .map(p -> {
                    Event event = p.getEvent();

                    long count = participantRepository.countParticipantsByEventId(
                            event.getId(),
                            ParticipantRole.PARTICIPANT
                    );
                    event.setRegisteredCount(count);

                    event.setUserRole(p.getParticipantRole());

                    participantRepository.findOrganizerByEventId(event.getId(), ParticipantRole.ORGANIZER)
                            .ifPresent(org -> {
                                event.setOrganizerId(org.getUser().getId());
                                event.setOrganizerName(org.getUser().getName() + " " + org.getUser().getSurname());
                            });

                    return event;
                })
                .toList();
    }
    @PostMapping("/{id}/upload-photo")
    public ResponseEntity<?> uploadEventPhoto(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        User currentUser = getAuthenticatedUser();

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wydarzenie nie istnieje"));

        EventParticipant participant = participantRepository.findByEventIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Nie masz uprawnień do tego wydarzenia"));

        if (participant.getParticipantRole() != ParticipantRole.ORGANIZER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Tylko organizator może zmieniać zdjęcie"));
        }

        try {
            if (event.getPhoto() != null && !event.getPhoto().isEmpty()) {
                supabaseStorageService.deleteFileByUrl(event.getPhoto());
            }
            String publicUrl = supabaseStorageService.uploadFile(file, "event", event.getId(), "events");

            event.setPhoto(publicUrl);
            eventRepository.save(event);

            return ResponseEntity.ok(Map.of("url", publicUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Błąd podczas przesyłania pliku: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/photo")
    public ResponseEntity<?> removeEventPhoto(@PathVariable Long id) {
        User currentUser = getAuthenticatedUser();

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wydarzenie nie istnieje"));

        EventParticipant participant = participantRepository.findByEventIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Brak uprawnień"));

        if (participant.getParticipantRole() != ParticipantRole.ORGANIZER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (event.getPhoto() != null) {
            supabaseStorageService.deleteFileByUrl(event.getPhoto());
            event.setPhoto(null);
            eventRepository.save(event);
        }

        return ResponseEntity.ok(Map.of("message", "Zdjęcie usunięte"));
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));
    }
}