import { getHistories } from "@/api/subscription";
import { Header } from "@/components/Header";
import { Text } from "@/components/Themed";
import { capitalize, clx } from "@/helpler";
import { IOrder } from "@/store/type";
import { theme } from "@/tailwind.config";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, isSameDay, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";
import { router } from "expo-router";
import { t } from "i18next";
import { useColorScheme } from "nativewind";
import { useMemo } from "react";
import { RefreshControl, SectionList, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
export function HistoriesPage() {
    const { top } = useSafeAreaInsets()
    return (
        <View className="flex-1 bg-light dark:bg-dark-bg">
            <Header
                backButton=""
                title={t("Mes commandes")}
            />
            <View className="mt-8 flex-1">
                <SectionHistories />
            </View>
        </View>
    )
}
interface ISectionHistories {

}
function SectionHistories({ }: ISectionHistories) {
    const query = useQuery({
        queryKey: ["histories"],
        queryFn: getHistories
    })
    const {bottom}=useSafeAreaInsets()
    const sections = useMemo(() => {
        const orders: IOrder[] = query.data as any
        if (!orders?.length) {
            return []
        }
        // Sort table
        const sortedOrders = orders.sort((a, b) => new Date(b.executionDate).getTime() - new Date(a.executionDate).getTime())
        console.log(sortedOrders.map(d => d.executionDate))
        const sections: any = {}
        sortedOrders.forEach((order) => {
            const month = format(order.executionDate, "MMMM", {
                locale: fr
            })
            if (sections[month]) {
                sections[month].data.push(order)
            } else {
                sections[month] = {
                    title: capitalize(month),
                    data: [order]
                }
            }
        })
        return Object.values(sections) as any
    }, [query.data])
    return (
        <SectionList
            refreshControl={
                <RefreshControl
                    refreshing={!!query.data && query.isFetching}
                    onRefresh={query.refetch}
                />
            }
            className="flex-1"
            sections={sections}
            contentContainerStyle={{
                paddingBottom:bottom+70
            }}
            renderSectionHeader={({ section }) => {
                return (
                    <View className="px-4 py-2">
                        <Text className="font-jakarta-medium text-[14px] text-dark-400 dark:text-gray-400">{section.title}</Text>
                    </View>
                )
            }}
            renderItem={({ item }) => {
                return (
                    <View>
                        <HistoryItem order={item} />
                    </View>
                )
            }}
        />
    )
}
interface IHistoryItem {
    order: IOrder,
    contained?: boolean
}
const HistoryItem = ({ order }: IHistoryItem) => {
    const { colorScheme } = useColorScheme()
    return (
        <TouchableOpacity className="p-4 " onPress={() => router.push({
            pathname: "/nolayout/client/order",
            params: {
                id: order.id,
                orderString: JSON.stringify(order)
            }
        })}>
            <View className="p-4 rounded-[20px] bg-white dark:bg-dark-dark-bg flex-row justify-between items-center">
                <View className="flex-row items-center gap-x-4">
                    <View className="items-center justify-center h-[40px] w-[40px] rounded-full bg-primary/20 ">
                        <Svg width="21" height="18" viewBox="0 0 21 18" fill="none" >
                            <Path fillRule="evenodd" clipRule="evenodd" d="M0 0.211678L2.77268 16.1073V18H18.2273V16.1073L21 0.211678L19.782 0L19.4046 2.16341C18.6244 2.69196 17.5716 2.94511 16.5464 2.66271C16.1653 2.55775 15.1177 2.09097 14.4947 1.78006L14.1739 1.61992L13.8754 1.81855C12.9458 2.43713 12.0769 2.99307 10.8183 2.99307C9.56193 2.99307 8.54704 2.35093 7.7654 1.8214L7.40679 1.57846L7.05573 1.83215C6.62063 2.14655 5.42497 2.77581 4.61608 3.01936C4.20099 3.14434 3.53119 3.21835 2.87181 3.21736C2.54795 3.21687 2.24419 3.19824 1.99382 3.16368C1.90397 3.15128 1.82727 3.13763 1.76295 3.12389L1.21805 0L0 0.211678ZM1.98661 4.40614L4.00905 16.0006V16.7659H16.991V16.0006L19.1388 3.68716C18.2593 4.02906 17.2379 4.1334 16.2175 3.85232C15.7846 3.73308 14.8996 3.34389 14.265 3.04125C13.3916 3.61196 12.3138 4.22715 10.8183 4.22715C9.37236 4.22715 8.20731 3.5862 7.41444 3.07126C6.77144 3.46162 5.7481 3.96752 4.97314 4.20086C4.39454 4.37507 3.58926 4.45252 2.86995 4.45143C2.5652 4.45098 2.26323 4.43644 1.98661 4.40614ZM9.27279 11.1067C9.27279 11.7883 8.71925 12.3408 8.03642 12.3408C7.35359 12.3408 6.80005 11.7883 6.80005 11.1067C6.80005 10.4252 7.35359 9.87264 8.03642 9.87264C8.71925 9.87264 9.27279 10.4252 9.27279 11.1067ZM12.9819 12.3408C13.6647 12.3408 14.2183 11.7883 14.2183 11.1067C14.2183 10.4252 13.6647 9.87264 12.9819 9.87264C12.2991 9.87264 11.7455 10.4252 11.7455 11.1067C11.7455 11.7883 12.2991 12.3408 12.9819 12.3408Z" fill={theme.extend.colors.primary.DEFAULT} />
                        </Svg>
                    </View>
                    <View className="">
                        <Text className="font-jakarta-semibold text-[16px] text-dark dark:text-gray-100">{format(order.executionDate, "dd MMMM", {
                            locale: fr
                        })}</Text>
                        <View className="flex-row items-center gap-x-2">
                            {
                                (order.userKg ?? order.capacityKg) ?
                                    <>
                                        <Text className="text-dark-300 font-jakarta-medium dark:text-gray">{`${order.userKg ?? order.capacityKg}/kg`}</Text>
                                        <View className="w-[3px] h-[3px] rounded-full bg-dark-300 dark:bg-gray"></View>
                                    </>
                                    :
                                    <></>

                            }

                            <Text className="text-dark-300 font-jakarta-medium dark:text-gray">{`${order.orderType == "SUBSCRIPTION" ? t("Abonnement") : t("Commande")}/kg`}</Text>
                        </View>
                    </View>
                </View>
                <View className="flex-row gap-x-4 items-center">
                    <StatusItem order={order} />
                    <Svg width="7" height="12" viewBox="0 0 7 12" fill="none" >
                        <Path d="M1 10.9L5.88998 6.82501C6.46748 6.34376 6.46748 5.55626 5.88998 5.07501L1 1" stroke={colorScheme == "light" ? theme.extend.colors.dark[300] : theme.extend.colors.dark[300]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>

                </View>
            </View>
        </TouchableOpacity>
    )
}

export function StatusItem({ order, contained = false }: IHistoryItem) {
    const { colorScheme } = useColorScheme()
    if (["CREATED", "PICKED", "WASHING"].includes(order.status)) {
        let title = t("Prochainement")
        if (order.status == "CREATED" && !order.hasStarted) {
            const date = new Date(order.executionDate)
            const afterTomorrow = addDays(new Date, 2)
            if (isToday(date)) {
                title = t("Aujourd'hui")
            } else if (isTomorrow(date)) {
                title = t("Demain")
            } else if (isSameDay(date, afterTomorrow)) {
                title = t("Après-demain")
            } else {
                title = capitalize(format(order.executionDate, "dd EEEE", {
                    locale: fr
                }))
            }

        } else if (order.status == "CREATED") {
            title = t("Récup. en cours")
        } else if (order.status == "PICKED" || order.status == "WASHING") {
            title = t("Lavage en cours")
        }
        return (
            <View className={clx("flex-row items-center gap-x-2 px-1.5 py-1 rounded-[5px] ", !contained ? "bg-yellow-500/10 dark:bg-yellow-500/20" : "bg-yellow-500 dark:bg-yellow-dark-500")}>
                <View>
                    <Svg width="8" height="12" viewBox="0 0 8 12" fill="none" >
                        <Path d="M5.62002 1H2.38002C0.500019 1 0.355019 2.69 1.37002 3.61L6.63002 8.39C7.64502 9.31 7.50002 11 5.62002 11H2.38002C0.500019 11 0.355019 9.31 1.37002 8.39L6.63002 3.61C7.64502 2.69 7.50002 1 5.62002 1Z" stroke={!contained ? (colorScheme === "light" ? theme.extend.colors.yellow[500] : theme.extend.colors.yellow[500]) : (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[200])} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>

                </View>
                <View>
                    <Text className={clx("text-[12px] font-jakarta-medium ", !contained ? "text-yellow-500 dark:text-yellow-500" : "text-white dark:text-dark-400")}>{title}</Text>
                </View>
            </View>
        )

    } else if (["DELIVERED"].includes(order.status)) {
        return (
            <View className={clx("flex-row items-center gap-x-2 px-1.5 py-1 rounded-[5px] ", !contained ? "bg-green-500/10 dark:bg-green-500/10" : "bg-green-500 dark:bg-green-dark-500")}>
                <View>
                    <Svg width="8" height="7" viewBox="0 0 8 7" fill="none" >
                        <Path d="M7 1.5L4.65205 4.31754C3.99647 5.10423 3.66869 5.49758 3.22812 5.51756C2.78755 5.53755 2.42549 5.17549 1.70139 4.45139L1 3.75" stroke={!contained ? (colorScheme == "light" ? theme.extend.colors.green[500] : theme.extend.colors.green[500]) : (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[200])} strokeWidth="1.5" strokeLinecap="round" />
                    </Svg>


                </View>
                <View>
                    <Text className={clx("text-[12px] font-jakarta-medium ", !contained ? "text-green-500 dark:text-green-500" : "text-white dark:text-gray-200")}>{t("Traité")}</Text>
                </View>
            </View>
        )
    } else if (order.status == "CANCELED") {
        return (
            <View className={clx("flex-row items-center gap-x-2 px-1.5 py-1 rounded-[5px] ", !contained ? "bg-gray-100 dark:bg-dark-400" : "bg-dark-300 dark:bg-dark-border")}>
                <View>
                    <Text className={clx("text-[12px] font-jakarta-medium ", !contained ? "text-dark-400 dark:text-gray-200" : "text-white dark:text-dark-300")}>{t("Annulé")}</Text>
                </View>
            </View>
        )
    }
    return (
        <View></View>
    )
}