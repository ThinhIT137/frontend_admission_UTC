"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { createContext, useContext, ReactNode, useState } from "react";

const LoadingContext = createContext<any>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {loading && <LoadingSpinner />}
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        return { loading: false, setLoading: () => {} };
    }
    return context;
};
