package com.An0.eventsapp.repository;

import com.An0.eventsapp.entity.Event;
import com.An0.eventsapp.enums.EventCategory;
import com.An0.eventsapp.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByCategory(EventCategory category);
    List<Event> findByEventStatus(EventStatus eventStatus);
}