import { createContext, useContext, useState } from "react";

export interface ActiveMix {
    url: string;
    event: string;
    date: string;
    artists: string;
    roomLabel: string;
}

const AudioContext = createContext({
    activeMix: null as ActiveMix | null,
    handleNewMix: (_mix: ActiveMix) => {},
    error: null as string | null,
});

export const AudioProvider = ({ children }: {children: React.ReactNode}) => {
    const [activeMix, setActiveMix] = useState<ActiveMix | null>(null);
    const [error, _setError] = useState<string | null>(null);


    const handleNewMix = (mix: ActiveMix) => {
        console.log(`Attempting to set new mix URL: ${mix.url}`);
        setActiveMix(mix);
    }

    return (
        <AudioContext.Provider value={{ activeMix, handleNewMix, error }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    return useContext(AudioContext);
};