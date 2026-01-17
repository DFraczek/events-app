package com.An0.eventsapp.enums;

public enum EventCategory {

    KULTURA_I_ROZRYWKA("Kultura i rozrywka"),
    EDUKACJA("Edukacja"),
    SPORT("Sport"),
    SPOLECZNE_I_NETWORKING("Społeczne i networking"),
    KREATYWNE_I_HOBBY("Kreatywne i hobby"),
    ZDROWIE_I_LIFESTYLE("Zdrowie i lifestyle"),
    BIZNES_I_PRACA("Biznes i praca"),
    RODZINNE("Rodzinne"),
    INNE("Inne");

    private final String displayName;

    EventCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}