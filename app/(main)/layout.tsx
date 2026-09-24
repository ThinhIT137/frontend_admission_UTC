import Header from "@/components/layout/header";
import { LoadingProvider } from "@/contexts/loadingContext";
import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
    return;
    <>
        <Header />
        <LoadingProvider>{children}</LoadingProvider>
    </>;
};
export default layout;
