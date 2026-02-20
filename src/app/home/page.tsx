import { Suspense } from "react"
import { FormularioList } from "@/src/components/formulario/FormularioList"
import { Skeleton } from "@/src/components/ui/skeleton";
import { Header } from "@/src/components/navigation/header";

export default function Page() {
    const renderLoadingSkeleton = () => (
        <div className="flex flex-col gap-4 w-full">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-50 w-full" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-4 w-full px-2 md:px-6">
            <Header />
            <Suspense fallback={renderLoadingSkeleton()}>
                <FormularioList />
            </Suspense>
        </div>
    )
}