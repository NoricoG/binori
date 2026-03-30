import { Change, ChangeReason } from "@puzzle/change";
import { Puzzle } from "@puzzle/puzzle";

export class History {
    private undoStack: Change[][] = [];
    private redoStack: Change[][] = [];

    private puzzle: Puzzle;

    constructor(puzzle: Puzzle) {
        this.puzzle = puzzle;
    }

    recordChange(change: Change): void {
        // if it involves the same cell, update the previous undo instead of adding a new one
        const previousChanges = this.undoStack[this.undoStack.length - 1];
        if (previousChanges && previousChanges.length === 1) {
            const previousChange = previousChanges[0];
            if (previousChange.x === change.x && previousChange.y === change.y && previousChange.reason === change.reason) {
                if (previousChange.oldValue === change.newValue) {
                    this.undoStack.pop();
                } else {
                    previousChange.newValue = change.newValue;
                }
                this.redoStack = [];
                return;
            }
        }

        this.recordChangeSet([change]);
    }

    recordChangeSet(changes: Change[]): void {
        if (changes.length === 0) return;
        this.undoStack.push(changes);
        this.redoStack = [];
    }

    undo(): boolean {
        if (!this.canUndo()) {
            return false;
        }

        const changeSet = this.undoStack.pop();
        if (changeSet) {
            for (let i = changeSet.length - 1; i >= 0; i--) {
                const change = changeSet[i];
                this.puzzle.setValueAt(change.x, change.y, change.oldValue);
            }
            this.redoStack.push(changeSet);
            return true;
        }

        return false;
    }

    redo(): boolean {
        if (!this.canRedo()) {
            return false;
        }

        const changeSet = this.redoStack.pop();
        if (changeSet) {
            for (const change of changeSet) {
                this.puzzle.setValueAt(change.x, change.y, change.newValue);
            }
            this.undoStack.push(changeSet);
            return true;
        }

        return false;
    }

    canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    clear(): void {
        this.undoStack = [];
        this.redoStack = [];
    }
}
