import { create, useStore } from 'zustand';
import { temporal, type TemporalState } from 'zundo';

import './App.css';

// Define the type of your store state (typescript)
interface StoreState {
    bears: number;
    increasePopulation: () => void;
    removeAllBears: () => void;
}

// Use `temporal` middleware to create a store with undo/redo capabilities
const useStoreWithUndo = create<StoreState>()(
    temporal(set => ({
        bears: 0,
        increasePopulation: () => set(state => ({ bears: state.bears + 1 })),
        removeAllBears: () => set({ bears: 0 })
    }))
);

const useTemporalStore = <T,>(
    selector: (state: TemporalState<StoreState>) => T,
    equality?: (a: T, b: T) => boolean
) => useStore(useStoreWithUndo.temporal, selector, equality);

function App() {
    const { bears, increasePopulation, removeAllBears } = useStoreWithUndo();
    // changes to pastStates and futureStates will now trigger a reactive component rerender
    const { undo, redo, clear, pastStates, futureStates } = useTemporalStore(
        state => state
    );

    return (
        <>
            <h1>Vid Pad Wizard</h1>
            <div className="card">
                <p> bears: {bears}</p>
                <p> pastStates: {JSON.stringify(pastStates)}</p>
                <p> futureStates: {JSON.stringify(futureStates)}</p>
                <button type="button" onClick={() => increasePopulation()}>
                    increase
                </button>
                <button type="button" onClick={() => removeAllBears()}>
                    remove
                </button>
                <button type="button" onClick={() => undo()}>
                    undo
                </button>
                <button type="button" onClick={() => redo()}>
                    redo
                </button>
                <button type="button" onClick={() => clear()}>
                    clear
                </button>
            </div>
        </>
    );
}

export default App;
