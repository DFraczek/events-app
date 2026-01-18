import React from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { EVENT_CATEGORIES } from "../constants/categories";

interface EventFiltersModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCategories: string[];
    toggleCategory: (categoryId: string) => void;
    selectedStatuses: string[];
    toggleStatus: (status: string) => void;
    showAvailableOnly: boolean;
    setShowAvailableOnly: (show: boolean) => void;
    activeFiltersCount: number;
    resultsCount: number;
    onClearFilters: () => void;
}

export function EventFiltersModal({
                                      isOpen,
                                      onOpenChange,
                                      selectedCategories,
                                      toggleCategory,
                                      selectedStatuses,
                                      toggleStatus,
                                      showAvailableOnly,
                                      setShowAvailableOnly,
                                      activeFiltersCount,
                                      resultsCount,
                                      onClearFilters,
                                  }: EventFiltersModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 rounded-xl border-zinc-200 hover:bg-zinc-50 transition-colors relative"
                >
                    <SlidersHorizontal className="size-4 text-zinc-500" />
                    <span className="font-semibold text-zinc-700">Filtry</span>
                    {activeFiltersCount > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white text-black text-[11px] font-bold">
                            {activeFiltersCount}
                        </span>
                    )}
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] sm:max-w-2xl lg:max-w-3xl !rounded-[3rem] !p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">

                <div className="p-8 pb-4 flex-1 overflow-y-auto">

                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-3xl font-black tracking-tight text-zinc-900">
                            Filtry
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-8">
                        <section>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.1em] text-zinc-400 mb-4">
                                Kategorie
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {EVENT_CATEGORIES.map((category) => (
                                    <div
                                        key={category.id}
                                        onClick={() => toggleCategory(category.id)}
                                        className={`flex items-center gap-3 p-3 !rounded-2xl border transition-all duration-200 cursor-pointer hover:border-zinc-300 ${
                                            selectedCategories.includes(category.id)
                                                ? 'border-primary/50 bg-primary/[0.03] ring-1 ring-primary/20 '
                                                : 'border-zinc-100 bg-zinc-50/50'
                                        }`}
                                    >
                                        <Checkbox
                                            id={`modal-cat-${category.id}`}
                                            checked={selectedCategories.includes(category.id)}
                                            className="rounded-md border-zinc-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                                        />
                                        <Label
                                            htmlFor={`modal-cat-${category.id}`}
                                            className="text-sm cursor-pointer font-bold text-zinc-700 leading-none pointer-events-none"
                                        >
                                            {category.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="grid grid-cols-1 gap-6 pt-6 border-t border-zinc-100">
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.1em] text-zinc-400 mb-4">
                                    Status i dostępność
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="modal-available-only" className="text-sm font-bold text-zinc-800">
                                                Ukryj wydarzenia bez wolnych miejsc
                                            </Label>
                                        </div>
                                        <Checkbox
                                            id="modal-available-only"
                                            checked={showAvailableOnly}
                                            onCheckedChange={(checked) => setShowAvailableOnly(checked as boolean)}
                                            className="size-5 rounded-lg border-zinc-300"
                                        />
                                    </div>

                                    <section>
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.1em] text-zinc-400 mb-4">
                                            Status wydarzenia
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {['NADCHODZACE', 'ZAKONCZONE'].map((status) => (
                                                <div
                                                    key={status}
                                                    onClick={() => toggleStatus(status)}
                                                    className={`flex items-center gap-3 p-3 !rounded-2xl border transition-all duration-200 cursor-pointer hover:border-zinc-300 ${
                                                        selectedStatuses.includes(status)
                                                            ? 'border-primary/50 bg-primary/[0.03] ring-1 ring-primary/20'
                                                            : 'border-zinc-100 bg-zinc-50/50'
                                                    }`}
                                                >
                                                    <div className="flex-shrink-0 flex items-center">
                                                        <Checkbox
                                                            id={`status-${status}`}
                                                            checked={selectedStatuses.includes(status)}
                                                            className="rounded-md border-zinc-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                                                        />
                                                    </div>
                                                    <Label
                                                        htmlFor={`status-${status}`}
                                                        className="text-sm cursor-pointer font-bold text-zinc-700 leading-none pointer-events-none"
                                                    >
                                                        {status === 'NADCHODZACE' ? 'Nadchodzące' : 'Zakończone'}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="p-6 bg-zinc-50 border-t border-zinc-100 mt-auto space-y-3 z-10">
                    <Button
                        className="w-full rounded-[1.25rem] h-14 font-black text-base shadow-xl shadow-primary/20 transition-transform active:scale-[0.98]"
                        onClick={() => onOpenChange(false)}
                    >
                        Zastosuj filtry ({resultsCount})
                    </Button>

                    {activeFiltersCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={onClearFilters}
                            className="w-full rounded-[1.25rem] h-14 font-black text-base border-2 border-black bg-white text-black hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="size-4" />
                            Wyczyść wszystko
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}