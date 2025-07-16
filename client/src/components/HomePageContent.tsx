import { getHomePage } from "@/data/loaders";
import { notFound } from "next/navigation";
import { BlockRenderer } from "./blocks/BlockRenderer";

const loader = async () => {

    const data = await getHomePage()
    if (!data) notFound()

    return { ...data.data };
}

export default async function HomePageContent() {
    const data = await loader();
    const blocks = data?.blocks || [];


    return (
        <BlockRenderer blocks={blocks} />
    );
}
