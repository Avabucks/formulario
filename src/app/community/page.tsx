import { CtaCommunity } from "@/src/components/community/cta-community";
import { Header } from "@/src/components/navigation/header";

export default function Community() {

    return (
        <>
            <Header />
            <div className="flex flex-col gap-4 w-full px-2 pt-16 pb-10 md:px-6">
                <div className="rounded-xl overflow-hidden">
                    <CtaCommunity />
                </div>
                {/* TODO */}
            </div>
        </>
    )
}