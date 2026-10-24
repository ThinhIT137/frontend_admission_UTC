"use client";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";
interface LoadingState {
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
    beginLoading: () => () => void;
}
const idle: LoadingState = {
    loading: false,
    setLoading: () => {},
    beginLoading: () => () => {},
};
const LoadingContext = createContext<LoadingState>(idle);
export function LoadingProvider({ children }: { children: ReactNode }) {
    const [legacyLoading, setLoading] = useState(false);
    const [pending, setPending] = useState(0);
    // Mỗi tác vụ giữ một vé riêng; hoàn tất một tác vụ không tắt tác vụ còn lại.
    const beginLoading = useCallback(() => {
        let released = false;
        setPending((value) => value + 1);
        return () => {
            if (!released) {
                released = true;
                setPending((value) => Math.max(0, value - 1));
            }
        };
    }, []);
    const loading = legacyLoading || pending > 0;
    const value = useMemo(
        () => ({ loading, setLoading, beginLoading }),
        [loading, beginLoading],
    );
    return (
        <MotionConfig reducedMotion="user">
            <LoadingContext.Provider value={value}>
                {children}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="pointer-events-none fixed bottom-5 left-1/2 z-[100] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2"
                        >
                            <LoadingSpinner size="sm" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </LoadingContext.Provider>
        </MotionConfig>
    );
}
export const useLoading = () => useContext(LoadingContext);
