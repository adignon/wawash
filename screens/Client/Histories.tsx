import { getHistories } from "@/api/subscription";
import { Header } from "@/components/Header";
import { BasicModal } from "@/components/Modal";
import { Text } from "@/components/Themed";
import { capitalize, clx } from "@/helpler";
import { useStore } from "@/store/store";
import { IOrder } from "@/store/type";
import { theme } from "@/tailwind.config";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, isSameDay, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";
import { router } from "expo-router";
import { t } from "i18next";
import { useColorScheme } from "nativewind";
import React, { useMemo } from "react";
import { RefreshControl, SectionList, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
export function HistoriesPage() {
    const query = useQuery({
        queryKey: ["histories"],
        queryFn: getHistories
    })
    const user = useStore(s => s.user)
    const options = [
        {
            title: t("Commandes planifiées"),
            label: t("Planifiées"),
            id: "PLANNED",
            filter: (data: IOrder[]): IOrder[] => {
                return data.filter(d => !["CANCELED", "REJECTED"].includes(d.status) /*&& addDays(new Date,7) > new Date(d.executionDate)*/)
            }
        },
        {
            title: t("Commandes annulées"),
            label: t("Annulées"),
            id: "CANCELED",
            filter: (data: IOrder[]): IOrder[] => {
                return data.filter(d => d.status == "CANCELED")
            }
        },
        {
            title: t("Commandes rejetées"),
            label: t("Annulées"),
            id: "REJETED",
            filter: (data: IOrder[]): IOrder[] => {
                return data.filter(d => d.status == "REJETED")
            }
        }
    ]
    const [selected, setSelected] = React.useState(options[0].id)
    const filter = useMemo(() => {
        return options.find(o => o.id == selected)
    }, [selected])
    const orders = useMemo(() => {
        if (query.data && query.isSuccess) {
            return filter?.filter(query.data)
        }
        return []
    }, [query.data, filter])
    return (
        <View className="flex-1 bg-light dark:bg-dark-bg">
            <Header
                backButton=""
                title={t("Mes commandes")}
                right={
                    <FilterOptions options={options} state={[selected, setSelected]} />
                }
            />
            <View className="mt-8 flex-1">
                <SectionHistories query={query} user={user} orders={orders} />
            </View>
        </View>
    )
}
interface ISectionHistories {
    query: any,
    user: any,
    orders?: IOrder[]
}
export function SectionHistories({ query, user, orders }: ISectionHistories) {

    const { bottom } = useSafeAreaInsets()
    const sections = useMemo(() => {
        if (!orders?.length) {
            return []
        }
        // Sort table
        const sortedOrders = orders.sort((a, b) => new Date(b.executionDate).getTime() - new Date(a.executionDate).getTime())
        const sections: any = {}
        sortedOrders.forEach((order) => {
            const month = format(order.executionDate, user?.role == "CLEANER" ? "dd MMMM" : "MMMM", {
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
    }, [orders])
    const {height}=useWindowDimensions()
    const {top, bottom:bottomArea}=useSafeAreaInsets()
    return (
        <SectionList
            refreshControl={
                <RefreshControl
                    refreshing={!!orders && query.isFetching}
                    onRefresh={query.refetch}
                />
            }
            className="flex-1"
            sections={sections}
            contentContainerStyle={{
                paddingBottom: bottom + 70
            }}
            renderSectionHeader={({ section }) => {
                return (
                    <View className="px-4 py-2">
                        <Text className="font-jakarta-medium text-[14px] text-dark-400 dark:text-gray-400">{section.title}</Text>
                    </View>
                )
            }}
            ListEmptyComponent={
                query.isSuccess && !orders?.length ? (<View style={{height:height-top-bottomArea-100-70}} className="flex-1 items-center justify-center">
                    <Text className="text-dark-300 font-jakarta text-[14px] text-center dark:text-gray-300">{t("Aucune commande enrégistrée")}</Text>
                </View>) : <></>
            }
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
export const HistoryItem = ({ order }: IHistoryItem) => {
    const { colorScheme } = useColorScheme()
    const user = useStore(s => s.user)
    return (
        <TouchableOpacity className="p-4 " onPress={() => router.push({
            pathname: user?.role == "CLEANER" ? "/nolayout/merchant/order-details" : "/nolayout/client/order",
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
                        <Text className="font-jakarta-semibold text-[16px] text-dark dark:text-gray-100">{user?.role == "CLEANER" ? `#${order.orderId}` : format(order.executionDate, "dd MMMM", {
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

                            <Text className="text-dark-300 font-jakarta-medium dark:text-gray">{
                                user?.role == "CLEANER" ?
                                    `${order.pickingHours[0]}`
                                    :
                                    `${order.orderType == "SUBSCRIPTION" ? t("Abonnement",{
                                        
                                    }) : t("Commande")}/kg`
                            }</Text>
                        </View>
                    </View>
                </View>
                <View className="flex-row gap-x-4 items-center">
                    {
                        (user?.role) == "CLEANER" && ["SHIPPING_FAST", "SHIPPING_PRIORITIZED"].includes(order.deliveryType) && order.status!="DELIVERED" ? (
                            <PrioritShipping contained={false} title={"Urgent~" + order.executionDuration + "h"} />
                        ) : <></>
                    }
                    <StatusItem order={order} />
                    <Svg width="7" height="12" viewBox="0 0 7 12" fill="none" >
                        <Path d="M1 10.9L5.88998 6.82501C6.46748 6.34376 6.46748 5.55626 5.88998 5.07501L1 1" stroke={colorScheme == "light" ? theme.extend.colors.dark[300] : theme.extend.colors.dark[300]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>

                </View>
            </View>
        </TouchableOpacity>
    )
}


export const PrioritShipping = ({ contained, title }: { contained: boolean, title: string }) => {
    const { colorScheme } = useColorScheme()
    return (
        <View className={clx("flex-row items-center gap-x-2 px-1.5 py-1 rounded-[5px] ", !contained ? "bg-red/10 dark:bg-red-500/10" : "bg-red dark:bg-red-dark")}>
            <View>

                <Svg width="14" height="14" viewBox="0 0 31 30" fill="none" >
                    <Path d="M15.3332 17.5H16.5832C17.9582 17.5 19.0832 16.375 19.0832 15V2.5H7.83319C5.95819 2.5 4.3207 3.53748 3.4707 5.06248" stroke={contained ? (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[100]) : colorScheme == "light" ? theme.extend.colors.red.DEFAULT : theme.extend.colors.red[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M2.83325 21.25C2.83325 23.325 4.50825 25 6.58325 25H7.83325C7.83325 23.625 8.95825 22.5 10.3333 22.5C11.7083 22.5 12.8333 23.625 12.8333 25H17.8333C17.8333 23.625 18.9583 22.5 20.3333 22.5C21.7083 22.5 22.8333 23.625 22.8333 25H24.0833C26.1583 25 27.8333 23.325 27.8333 21.25V17.5H24.0833C23.3958 17.5 22.8333 16.9375 22.8333 16.25V12.5C22.8333 11.8125 23.3958 11.25 24.0833 11.25H25.6957L23.5583 7.51251C23.1083 6.73751 22.2833 6.25 21.3833 6.25H19.0833V15C19.0833 16.375 17.9583 17.5 16.5833 17.5H15.3333" stroke={contained ? (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[100]) : colorScheme == "light" ? theme.extend.colors.red.DEFAULT : theme.extend.colors.red[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M10.3333 27.5C11.714 27.5 12.8333 26.3807 12.8333 25C12.8333 23.6193 11.714 22.5 10.3333 22.5C8.95254 22.5 7.83325 23.6193 7.83325 25C7.83325 26.3807 8.95254 27.5 10.3333 27.5Z" stroke={contained ? (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[100]) : colorScheme == "light" ? theme.extend.colors.red.DEFAULT : theme.extend.colors.red[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M20.3333 27.5C21.714 27.5 22.8333 26.3807 22.8333 25C22.8333 23.6193 21.714 22.5 20.3333 22.5C18.9525 22.5 17.8333 23.6193 17.8333 25C17.8333 26.3807 18.9525 27.5 20.3333 27.5Z" stroke={contained ? (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[100]) : colorScheme == "light" ? theme.extend.colors.red.DEFAULT : theme.extend.colors.red[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M27.8333 15V17.5H24.0833C23.3958 17.5 22.8333 16.9375 22.8333 16.25V12.5C22.8333 11.8125 23.3958 11.25 24.0833 11.25H25.6957L27.8333 15Z" stroke={contained ? (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[100]) : colorScheme == "light" ? theme.extend.colors.red.DEFAULT : theme.extend.colors.red[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M2.83325 10H10.3333" stroke={contained ? (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[100]) : colorScheme == "light" ? theme.extend.colors.red.DEFAULT : theme.extend.colors.red[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M2.83325 13.75H7.83325" stroke={contained ? (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[100]) : colorScheme == "light" ? theme.extend.colors.red.DEFAULT : theme.extend.colors.red[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M2.83325 17.5H5.33325" stroke={contained ? (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[100]) : colorScheme == "light" ? theme.extend.colors.red.DEFAULT : theme.extend.colors.red[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>

            </View>
            <View>
                <Text className={clx("text-[12px] font-jakarta-medium ", !contained ? "text-red dark:text-red-500" : "text-white dark:text-gray-200")}>{t(title)}</Text>
            </View>
        </View>

    )
}


export function StatusItem({ order, contained = false }: IHistoryItem) {
    const { colorScheme } = useColorScheme()
    if (["CREATED", "PICKED", "WASHING", "READY"].includes(order.status)) {
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
                title=t("Bientôt")
                // title = capitalize(format(order.executionDate, "dd EEEE", {
                //     locale: fr
                // }))
            }

        } else if (order.status == "CREATED") {
            title = t("Récup. en cours")
        } else if (order.status == "PICKED" || order.status == "WASHING") {
            title = t("Lavage en cours")
        } else if (order.status == "READY") {
            title = t("Livraison")
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
                    <Text className={clx("text-[12px] font-jakarta-medium ", !contained ? "text-green-500 dark:text-green-500" : "text-white dark:text-gray-200")}>{t("Linge livré")}</Text>
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
    } else if (order.status == "NOTEXECUTED") {
        return (
            <View className={clx("flex-row items-center gap-x-2 px-1.5 py-1 rounded-[5px] ", !contained ? "bg-red/10 dark:bg-red-500/10" : "bg-red dark:bg-red-500")}>
                <View>
                    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <Path d="M10.5 3.5L3.5 10.5" stroke={colorScheme == "light" ? theme.extend.colors.red.DEFAULT : theme.extend.colors.red[500]} stroke-linecap="round" stroke-linejoin="round" />
                        <Path d="M3.5 3.5L10.5 10.5" stroke={colorScheme == "light" ? theme.extend.colors.red.DEFAULT : theme.extend.colors.red[500]} stroke-linecap="round" stroke-linejoin="round" />
                    </Svg>

                </View>
                <View>
                    <Text className={clx("text-[12px] font-jakarta-medium ", !contained ? "text-red dark:text-red-500" : "text-white dark:text-gray-200")}>{t("Non traité")}</Text>
                </View>
            </View>
        )
    }
    return (
        <View></View>
    )
}

export const FilterOptions = ({ state, options }: {
    options: {
        title: string;
        label: string;
        id: string;
    }[],
    state: [string, React.Dispatch<React.SetStateAction<string>>]
}) => {
    const [selected, setSelected] = state
    const [open, setOpen] = React.useState(false)
    const { colorScheme } = useColorScheme()
    const option = useMemo(() => {
        return options.find(o => o.id == selected)
    }, [selected])
    return (
        <>
            <TouchableOpacity onPress={() => setOpen(true)} className="bg-white flex-row items-center dark:bg-dark-lighter px-4 rounded-full px-4 gap-x-2 py-2">
                <Text className="font-jakarta text-[12px] text-primary dark:text-gray-200 ">{option?.label}</Text>
                <Svg width="12" height="7" viewBox="0 0 12 7" fill="none" >
                    <Path d="M1.09999 1L5.17499 5.88998C5.65624 6.46748 6.44374 6.46748 6.92499 5.88998L11 1" stroke={colorScheme == "light" ? theme.extend.colors.dark[300] : theme.extend.colors.gray[200]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            </TouchableOpacity>
            <BasicModal show={open} onClose={() => setOpen(false)}>
                <View className="mt-4 gap-y-2">
                    {
                        options.map(o => (
                            <TouchableOpacity onPress={() => setSelected(o.id)} key={o.id} className="py-2 px-2 flex-row items-center gap-x-3">
                                <View className={clx("transition w-5 h-5 rounded-full justify-center items-center", o.id == selected ? "opacity-1" : "opacity-0")}>
                                    <Svg width="15" height="14" viewBox="0 0 8 7" fill="none" >
                                        <Path d="M7 1.5L4.65205 4.31754C3.99647 5.10423 3.66869 5.49758 3.22812 5.51756C2.78755 5.53755 2.42549 5.17549 1.70139 4.45139L1 3.75" stroke={colorScheme == "light" ? theme.extend.colors.primary.DEFAULT : theme.extend.colors.primary[500]} strokeWidth="1" strokeLinecap="round" />
                                    </Svg>
                                </View>
                                <View>
                                    <Text className={clx("font-jakarta-medium text-[15px] ", o.id == selected ? "text-primary dark:text-primary" : "text-dark-400 dark:text-gray-100")}>{o.title}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    }
                </View>
            </BasicModal>
        </>
    )
}