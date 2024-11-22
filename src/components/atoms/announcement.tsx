import { GET_ANNOUNCEMENT } from "@/lib/queries/announcementQuery";
import { requestSSR } from "@/repositories/repository";

interface IΑnnouncement {
    announcement: {
        data: {
            attributes: {
                text: string
            }
        }
    }
}

async function getAnnouncementData() {
    const data = await requestSSR({
        query: GET_ANNOUNCEMENT
    });

    return data as IΑnnouncement
}


const Αnnouncement = async () => {
    const announcement = await getAnnouncementData()

    if (!announcement.announcement.data)
        return null

    return (
        <h1 className="p-4 bg-blue-100 dark:bg-sky-600 shadow-xl rounded-b-xl">
            {announcement && announcement.announcement.data?.attributes.text}
        </h1>
    )
}

export default Αnnouncement;