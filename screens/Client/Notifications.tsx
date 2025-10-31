import { Header } from "@/components/Header"
import { Text } from "@/components/Themed"
import { clx } from "@/helpler"
import { INotification } from "@/store/type"
import { theme } from "@/tailwind.config"
import { compareDesc, format, isToday, isYesterday, parseISO } from "date-fns"
import { fr } from 'date-fns/locale'
import { t } from "i18next"
import { useColorScheme } from "nativewind"
import { useMemo } from "react"
import { SectionList, View } from "react-native"
import Svg, { Path } from "react-native-svg"

export function Notification() {
    const data = [
        {
            title: 'Nouvel abonnement activé',
            description: "Votre nouvel abonnement a bien été activé avec succès , veuillez consulter  la page d’abonnement pour connaitre la prochaine date de collecte de vos linges",
            readAt: null,
            createdAt: "2025-10-26 07:09:00",
            userId: 3,
        },
        {
            title: 'Paiement confirmé',
            description: "Nous avons bien reçu vos paiements de 5000f pour l’abonnement à nos service",
            readAt: "2025-10-26 11:09:00",
            createdAt: "2025-10-26 10:09:00",
            userId: 3,
        },
        {
            title: 'Commande enrégistrée',
            description: "Votre nouvel commende pour un lavage unique a bien été enrégistrer. Nos livreurs passeront à la date convenue pour collecter vos linge",
            readAt: "2025-10-25 07:09:00",
            createdAt: "2025-10-25 10:09:00",
            userId: 3,
        }
    ]
    const isLoading = false

    const notications = useMemo(() => {
        if (!data?.length) return [];

        const getSectionTitle = (dateString: string) => {
            const date = parseISO(dateString);

            if (isToday(date)) return 'Auj';
            if (isYesterday(date)) return 'Hier';

            // Format example: "26 oct"
            return format(date, 'd MMM', { locale: fr });
        };

        // Group by title (day)
        const grouped = data.reduce((acc: any, notif) => {
            const title = getSectionTitle(notif.createdAt);
            if (!acc[title]) acc[title] = [];
            acc[title].push(notif);
            return acc;
        }, {});
        const sections = Object.entries(grouped).map(([title, data]: any) => {
            const sortedData = [...data].sort((a, b) =>
                compareDesc(parseISO(a.createdAt), parseISO(b.createdAt))
            );
            const isTitleActive = sortedData.some((n) => !n.readAt);
            return {
                title,
                data: sortedData,
                isTitleActive,
            };
        });
        return sections.sort((a, b) =>
            compareDesc(parseISO(a.data[0].createdAt), parseISO(b.data[0].createdAt))
        );
    }, [data]);
    return (
        <View className="bg-light dark:bg-dark-bg flex-1">
            <Header title={t("Notifications")} />
            <SectionList
                contentContainerClassName="p-4"
                sections={isLoading ? new Array(6).fill({ data: [1] }) : notications}
                renderItem={({ item }) => {
                    if (isLoading) {
                        return <NotificationSkeleton />
                    } else {
                        return <NotificationItem notification={item} />
                    }
                }}
                stickySectionHeadersEnabled
                renderSectionHeader={({ section: { title, isTitleActive } }) => {
                    return (
                        <View className="flex-row relative">
                            <View className={clx("p-2 py-1 absolute  rounded-[5px] ", isTitleActive ? "bg-primary/10" : "bg-gray-100 dark:bg-dark/30")}>
                                <Text className={clx("font-jakarta-medium text-[12px]", isTitleActive ? "text-primary dark:text-primary" : "text-dark-300 dark:text-dark-400")}>{title}</Text>
                            </View>
                        </View>
                    )
                }}
            />
        </View>
    )
}

const NotificationItem = ({ notification }: {
    notification: INotification
}) => {
    const {colorScheme}=useColorScheme()
    return (
        <View className="mb-8 flex-row ">
            <View className="w-[60px]"></View>
            <View className="relative flex-1">
                <View className="absolute " style={{ left: -15 }}>
                    <Svg width="30" height="29" viewBox="0 0 17 15" fill="none">
                        <Path d="M0.480397 3.89455C-0.597139 2.62857 0.25055 0.676964 1.91125 0.600356L14.8776 0.00223147C16.356 -0.0659654 17.3938 1.43945 16.8042 2.7969L12.251 13.2795C11.6613 14.6369 9.85278 14.906 8.89353 13.779L0.480397 3.89455Z" fill={colorScheme=="light"? "white":theme.extend.colors.dark.lighter} />
                    </Svg>
                </View>
                <View className="rounded-[20px] p-4 pt-3 bg-white dark:bg-dark-lighter">
                    <View className="flex-row items-center justify-between">
                        <View><Text className={clx("font-jakarta-semibold text-[16px]", !notification.readAt ? "text-primary dark:text-primary" : "text-dark dark:text-gray-100")}>{notification.title}</Text></View>
                        <View className="flex-row items-center gap-x-3">
                            {
                                !notification.readAt ? (
                                    <View className="w-[5px] h-[5px] rounded-full bg-primary"></View>
                                ) : <></>
                            }
                            <Text className="font-jakarta-medium text-[12px] text-dark-300">{format(notification.createdAt, "HH:ii")}</Text>
                        </View>
                    </View>
                    <View className="mt-2">
                        <Text className="text-[14px] font-jakarta text-dark-300">{notification.description}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

const NotificationSkeleton = () => {
    const {colorScheme}=useColorScheme()
    return (
        <View className="mb-4  pl-5">
            <View className="relative rounded-[20px] bg-white dark:bg-dark-lighter">
                <View className="absolute " style={{ left: -15 }}>
                    <Svg width="30" height="29" viewBox="0 0 17 15" fill="none">
                        <Path d="M0.480397 3.89455C-0.597139 2.62857 0.25055 0.676964 1.91125 0.600356L14.8776 0.00223147C16.356 -0.0659654 17.3938 1.43945 16.8042 2.7969L12.251 13.2795C11.6613 14.6369 9.85278 14.906 8.89353 13.779L0.480397 3.89455Z" fill={colorScheme=="light"? "white":theme.extend.colors.dark.lighter} />
                    </Svg>
                </View>
                <View className="p-5">
                    <View className="flex-row items-center justify-between">
                        <View className="w-8/12 h-[20px] rounded-full bg-gray-300 dark:bg-dark-lighter  "></View>
                        <View className="w-2/12 h-[10px] rounded-full bg-gray-200"></View>
                    </View>
                    <View className=" gap-y-2 mt-4">
                        <View className=" h-[10px] rounded-full bg-gray-200"></View>
                        <View className=" h-[10px] rounded-full bg-gray-200"></View>
                        <View className="w-10/12 h-[10px] rounded-full bg-gray-200"></View>
                    </View>
                </View>
            </View>
        </View>
    )
}