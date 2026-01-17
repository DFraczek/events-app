import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    eventName: string;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, eventName }: ConfirmDeleteModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm rounded-[2rem] p-6">
                <DialogHeader className="flex flex-col items-center text-center">
                    <div className="size-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                        <AlertTriangle className="size-10" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-zinc-900">Usuń wydarzenie</DialogTitle>
                    <DialogDescription className="text-zinc-500 mt-2">
                        Czy na pewno chcesz usunąć wydarzenie <strong>{eventName}</strong>?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 rounded-xl h-11 font-semibold"
                    >
                        Anuluj
                    </Button>
                    <Button
                        variant="default"
                        onClick={onConfirm}
                        className="flex-1 rounded-xl h-11 font-semibold !bg-black !text-white hover:!bg-zinc-800 border-none"
                    >
                        Usuń
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}