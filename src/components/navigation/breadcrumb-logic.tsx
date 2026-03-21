import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb"
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

type BreadcrumbItem = {
    label: string;
    href?: string;
};

export function BreadcrumbLogic({ items }: Readonly<{ items: BreadcrumbItem[] }>) {
    return (
        <div className="w-full overflow-x-auto">
            <Breadcrumb className="max-w-screen">
                <BreadcrumbList>
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;
                        return (
                            <Fragment key={index}>
                                <BreadcrumbItem>
                                    {isLast || !item.href ? (
                                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {!isLast && (
                                    <BreadcrumbSeparator>
                                        <ChevronRight />
                                    </BreadcrumbSeparator>
                                )}
                            </Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}
