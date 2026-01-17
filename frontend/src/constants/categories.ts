export const EVENT_CATEGORIES = [
    { id: 'KULTURA_I_ROZRYWKA', name: 'Kultura i rozrywka' },
    { id: 'EDUKACJA', name: 'Edukacja' },
    { id: 'SPORT', name: 'Sport' },
    { id: 'SPOLECZNE_I_NETWORKING', name: 'Społeczne i networking' },
    { id: 'KREATYWNE_I_HOBBY', name: 'Kreatywne i hobby' },
    { id: 'ZDROWIE_I_LIFESTYLE', name: 'Zdrowie i lifestyle' },
    { id: 'BIZNES_I_PRACA', name: 'Biznes i praca' },
    { id: 'RODZINNE', name: 'Rodzinne' },
    { id: 'INNE', name: 'Inne' },
] as const;

export const getCategoryName = (id: string) => {
    return EVENT_CATEGORIES.find(cat => cat.id === id)?.name || id;
};