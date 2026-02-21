import { command as commandApi, getPackagesAddons, subscribe } from "@/api/subscription";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Checkbox } from "@/components/Input";
import { Text } from "@/components/Themed";
import { capitalize, clx, fnPart } from "@/helpler";
import { country } from "@/storage/config";
import { PACKAGES } from "@/storage/PackagesConfig";
import { useStore } from "@/store/store";
import { ICommand, IOrder, IServiceMeta } from "@/store/type";
import { theme } from "@/tailwind.config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addDays, addSeconds, format, intervalToDuration, parse } from "date-fns";
import Decimal from "decimal.js";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { t } from "i18next";
import LottieView from "lottie-react-native";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";

const days = [{ id: 1, name: t("Lundi") }, { id: 2, name: t("Mardi") }, { id: 3, name: t("Mercredi") }, { id: 4, name: t("Jeudi") }, { id: 5, name: t("Vendredi") }, { id: 6, name: t("Samedi") }, { id: 7, name: t("Dimanche") }]
const hours = [{ value: ["07:00", "09:00"], name: t("Matinal") }, { value: ["12:00", "15:00"], name: t("Apres-midi") }, { value: ["17:00", "19:00"], name: t("Soirée") }]
const handleFormat = (value: string[] | null | undefined) => {
    return value ? value[0] + value[1] : null
}
function formatTimeRange(times: [string, string]) {
    const [start, end] = times;

    const startDate = parse(start, "HH:mm", new Date());
    const endDate = parse(end, "HH:mm", new Date());

    const startHour = format(startDate, "H"); // "7" instead of "07"
    const endHour = format(endDate, "H");

    return `${startHour}h-${endHour}h`;
}
export function SubscriptionForm() {
    const { colorScheme } = useColorScheme()
    const defaultDaysValues = [[days[4].id, hours[2].value]]
    const params: any = useLocalSearchParams()
    const [form, setForm] = React.useState({
        weekDayPicking: defaultDaysValues,
        prefereredShipping: "SHIPPING_DEFAULT",
        dryingAddon: false,
        weeks: [1, 2, 3, 4 ],
        autoRenew: false,
        dateSelected: format(addDays(new Date, 1), "yyyy-MM-dd")
    })

    const [allowSelect, setAllowSelect] = React.useState(false)
    const [activeDay, setActiveDay] = React.useState(defaultDaysValues[0][0])
    const query = useQuery({
        queryKey: ['addons'],
        queryFn: getPackagesAddons
    })


    const NUMBER_OF_WEEK = params.unique ? 1 : form.weeks.length
    const [command, setCommand] = React.useState<ICommand | null>(null)
    const commandSavedData = React.useRef<ICommand | null>(null)
    const { totalToPay, dryingPrice, shippingPrice } = useMemo(() => {
        if (params.amount) {
            const additionalDays = form.weekDayPicking.length - Number(params.paidMultiplePickMin) > 0 ? form.weekDayPicking.length - Number(params.paidMultiplePickMin) : 0
            let initialPrice = Decimal(params.amount).mul(NUMBER_OF_WEEK)
            let pickingPrice = '0', shippingPrice = '0', dryingPrice = '0'
            if (query.data?.pickingMultiple.price && additionalDays) {
                pickingPrice = Decimal(query.data?.pickingMultiple.price).mul(additionalDays).mul(NUMBER_OF_WEEK).toString()
            }
            if (form.prefereredShipping != "SHIPPING_DEFAULT" && query.data?.shippings[form.prefereredShipping.toLowerCase()].price) {
                shippingPrice = Decimal(query.data?.shippings[form.prefereredShipping.toLowerCase()].price).mul(params.kg).mul(NUMBER_OF_WEEK).toString()
            }
            if (form.dryingAddon && query.data?.drying.price) {
                dryingPrice = Decimal(query.data?.drying.price).mul(params.kg).mul(NUMBER_OF_WEEK).toString()
            }
            return {
                totalToPay: fnPart(Decimal(initialPrice).add(pickingPrice).add(shippingPrice).add(dryingPrice).toString(), country).main,
                shippingPrice,
                dryingPrice
            }
        }
        return {}

    }, [form])
    const { bottom } = useSafeAreaInsets()
    const PackageDetail = useMemo(() => {
        if (params.code) {
            return PACKAGES[params.code as keyof typeof PACKAGES]
        }
    }, [params?.code])

    const { mutilplePickingPrice, total, totalUnit } = useMemo(() => {
        let price = 0
        if (query.data) {
            price = Number((query.data?.pickingMultiple?.price) ?? 0)
        } else {
            price = price
        }
        const paidDays = form.weekDayPicking.length - Number(params.paidMultiplePickMin) > 0 ? form.weekDayPicking.length - Number(params.paidMultiplePickMin) : 0
        const total = Decimal(price).mul(paidDays).toString()
        return { mutilplePickingPrice: price, totalUnit: total, total: Decimal(total).mul(NUMBER_OF_WEEK).toString() }
    }, [query.data, form.weekDayPicking])

    const handleChangeDay = (x: number) => {
        const isNewDayAlreadySelected = !!form.weekDayPicking.find((v) => v[0] == x as any)
        if (allowSelect) {
            if (isNewDayAlreadySelected) {
                if (x == activeDay) {
                    const remaining = form.weekDayPicking.filter((v) => v[0] !== x as any)
                    if (remaining.length >= 1) {
                        setForm((prev) => ({
                            ...prev,
                            weekDayPicking: remaining
                        }))
                        setActiveDay(remaining[0][0] as any)
                    } else {
                        Alert.alert(t("Vous devez sélectionner au moins 1 jour de collecte"))
                    }
                } else {
                    setActiveDay(x)
                }
            } else {
                setActiveDay(x)
                setForm((prev) => ({
                    ...prev,
                    weekDayPicking: [...prev.weekDayPicking, [x, hours[0].value]]
                }))
            }
        } else if (!isNewDayAlreadySelected) {
            setForm((prev) => ({
                ...prev,
                weekDayPicking: [[x, prev.weekDayPicking[0]?.[1] ?? hours[0].value]]
            }))
            setActiveDay(x)
        }
    }

    const currentDayData = form.weekDayPicking.find((d) => d[0] == activeDay)

    const mutation = useMutation({
        mutationKey: ["subscribe"],
        mutationFn: subscribe
    })
    const commandMutation = useMutation({
        mutationKey: ["command"],
        mutationFn: commandApi
    })
    const [order, setOrder] = React.useState<IOrder | null>(null)
    const handleHourChange = (x: string[]) => {
        const day: any = form.weekDayPicking.find((d) => d[0] == activeDay)
        const isAlreadySelected = x.join() == day[1].join()
        if (!isAlreadySelected) {
            day[1] = x
            const f = [...form.weekDayPicking]
            const data = {
                ...form,
                weekDayPicking: f.map((d: any) => {
                    if (d[0] == activeDay) {
                        return day
                    } else {
                        return d
                    }
                })
            }
            setForm(prev => JSON.parse(JSON.stringify(data)))
        }
    }

    const handleChangeSelect = (x: any) => {
        if (mutilplePickingPrice) {
            setAllowSelect(x)
            if (x == false) {
                setForm(prev => ({
                    ...prev,
                    weekDayPicking: defaultDaysValues
                }))
                setActiveDay(defaultDaysValues[0][0])
            }
        }
    }
    const totalKg = useMemo(() => (params?.kg) ? Number(params.kg) * NUMBER_OF_WEEK : 'total ', [params?.kg])
    const { user, setUser } = useStore(s => s)
    const updateUser = (command: ICommand) => {
        if (command?.invoice.status == "SUCCESS") {
            setUser({
                ...user,
                activeSubscription: command
            } as any)
        }
    }

    const allowCancel = React.useRef(false)
    const handleSubmit = async (retry: boolean = true) => {
        const values = {
            ...form,
            cancelActiveSubscription: allowCancel.current,
            packageId: params.id
        }
        if (params.allowSubscriptionCancel == "true" && !allowCancel.current) {
            return Alert.alert(t("Changer l'abonnement ?"), t("Cette action va annuler votre abonnement actuel et n'est pas remboursable."), [
                {
                    text: t("non")
                },
                {
                    text: t("Changer"),
                    onPress: () => {
                        allowCancel.current = true
                        handleSubmit(retry)
                    }
                }
            ])
        }
        try {

            if (commandSavedData.current?.id) {
                const data: any = await mutation.mutateAsync({
                    id: commandSavedData.current.id!,
                    retry
                })
                commandSavedData.current = data.command
                setCommand(data.command)
                updateUser(data.command)
                if (data.paymentUrl) {
                    Linking.openURL(data.paymentUrl)
                }
                return;
            }
            const data: any = await mutation.mutateAsync(values)
            commandSavedData.current = data.command
            setCommand(data.command)
            updateUser(data.command)
            Linking.openURL(data.paymentUrl)
        } catch (e: any) {
            console.log(e)
            if (typeof e == "string") {
                Toast.show({
                    type: "error",
                    text2: e
                })
            } else {
                Toast.show({
                    text2: t("Une erreur innatendue est survenue"),
                    type: "error"
                })
            }

        }
    }

    const handleSubmitUnique = async () => {
        const {
            weekDayPicking,
            dateSelected,
            ...values
        } = {
            ...form,
            packageId: params.id
        }

        try {
            const data: IOrder = await commandMutation.mutateAsync({
                ...values,
                pickingDate: dateSelected + " 00:00:00",
                hours: weekDayPicking[0][1]
            })
            setOrder(data)
            return;
        } catch (e: any) {
            console.log(e)
            if (typeof e == "string") {
                Toast.show({
                    type: "error",
                    text2: e
                })
            } else {
                Toast.show({
                    text2: t("Une erreur innatendue est survenue"),
                    type: "error"
                })
            }

        }
    }
    if (PackageDetail && query.data) {
        return (
            <>
                <View className="flex-1 bg-light dark:bg-dark-bg">
                    <Header title={PackageDetail.name} />
                    <ScrollView className="px-5 mt-6 flex-1">
                        <Text className="font-jakarta-semibold text-[18px] text-primary-500">{t("Définissez vos préférences")}</Text>
                        {
                            !params.unique ? (
                                <>
                                    <View className="mt-8">
                                        <Text className="mb-4 font-jakarta-semibold text-[16px]">{t("Semaines de collecte")}</Text>
                                        <WeekSelector value={form.weeks} setValue={(value: (prev: number[]) => number[]) => setForm(prev => ({
                                            ...prev, weeks: value(prev.weeks)
                                        }))} />
                                    </View>
                                </>
                            ) : <></>
                        }


                        <View className="mt-8">
                            <Text className="mb-4 font-jakarta-semibold text-[16px]">{params.unique ? t("Date de collecte") : t("Collecte  hebdomadaire")}</Text>
                            {
                                params.unique ?
                                    <View>
                                        <DateSelector
                                            onSelect={(dateString) => setForm(prev => ({
                                                ...prev,
                                                dateSelected: dateString
                                            }))}
                                            value={form.dateSelected}
                                        />
                                    </View>
                                    :
                                    <View>
                                        <DaySelector minMultiplePicking={params.paidMultiplePickMin} multipickingPrice={mutilplePickingPrice} hours={form.weekDayPicking.map((a) => ({ id: a[0], title: formatTimeRange(a[1] as any) })) as any} value={activeDay as any} selected={form.weekDayPicking.map((a) => a[0]) as any} onSelect={handleChangeDay} />
                                    </View>
                            }

                        </View>
                        <View className="mt-8">
                            <View>
                                <HourSelector value={currentDayData?.[1] as any} onSelect={handleHourChange} />
                            </View>
                        </View>
                        {
                            !params.unique && mutilplePickingPrice ? (
                                <View className="mt-8">
                                    <View>
                                        <Checkbox

                                            label={
                                                <View className="gap-y-1 -mt-2 ml-4">
                                                    <Text className="text-[14px] font-jakarta-semibold text-dark">{t("Collecte multiple par semaine")}  {
                                                        Number(total) ? (
                                                            <Text className="text-[14px] text-primary dark:text-primary font-jakarta-semibold">{t("+({{total}}f)", {
                                                                total,
                                                                totalUnit
                                                            })}</Text>
                                                        )
                                                            :
                                                            <></>
                                                    }</Text>
                                                    <Text className="font-jakarta text-dark-400">{t("Choisissez plusieurs jours de collecte. Vous avez jusqu'à {{ c }} collecte gratuite par semaine." + " À partir du {{ min }}ᵉ jour, un supplément de {{ amount }}f/jour s'applique.", {
                                                        amount: fnPart(mutilplePickingPrice, country).main,
                                                        min: Number(params.paidMultiplePickMin) + 1,
                                                        c: Number(params.paidMultiplePickMin)
                                                    })}</Text>
                                                </View>
                                            }
                                            check={allowSelect}
                                            onCheck={handleChangeSelect}
                                        />
                                    </View>
                                </View>
                            ) : <></>
                        }

                        <View className="mt-12">
                            <Text className="mb-4 font-jakarta-semibold text-[16px]">{t("Option de livraison")}{Number(shippingPrice) > 0 ? <Text className=" font-jakarta-semibold text-primary dark:text-primary">  {`(+${shippingPrice}f`}<Text className=" font-jakarta-semibold text-primary dark:text-primary text-[12px]">{`/${(typeof (totalKg) == "number" && totalKg > 1) || typeof (totalKg) == "string" ? totalKg : ""}kg)`}</Text></Text> : <></>}</Text>
                        </View>
                        <View>
                            <ShippingOptions params={params} value={form.prefereredShipping} onSelect={(id) => {
                                setForm((prev) => ({ ...prev, prefereredShipping: id }))
                            }} options={query.data.shippings} />
                        </View>
                        <View className="mt-8">
                            <Text className="mb-4 font-jakarta-semibold text-[16px]">{t("Option supplémentaires")}  {Number(dryingPrice) ? <Text className=" font-jakarta-semibold text-primary dark:text-primary">  {`(+${dryingPrice}f`}<Text className=" font-jakarta-semibold text-primary dark:text-primary text-[12px]">{`/${(typeof (totalKg) == "number" && totalKg > 1) || typeof (totalKg) == "string" ? totalKg : ""}kg)`}</Text></Text> : <></>}</Text>
                        </View>
                        <View className="">
                            <View
                                style={{
                                    shadowColor: "#000000",
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 2
                                }}
                                className="p-4 rounded-[15px] bg-white dark:bg-dark-lighter">
                                <Checkbox
                                    label={
                                        <View className="ml-4 flex-row items-center justify-between ">
                                            <View className="flex-row items-center gap-x-4">
                                                <Svg width="27" height="20" viewBox="0 0 27 20" fill="none" >
                                                    <Path fill-rule="evenodd" clip-rule="evenodd" d="M5.48935 1.66667H25.3223V7.32195C24.9563 7.29682 24.4776 7.26782 23.8783 7.23889C22.2628 7.16089 19.7707 7.08333 16.2471 7.08333C9.23844 7.08333 5.50417 7.8889 3.16851 11.1872C2.05875 12.7543 1.31292 14.7298 0.847102 16.2707C0.611822 17.049 0.443135 17.733 0.333026 18.2236C0.277915 18.4691 0.237328 18.6668 0.210297 18.8044C0.196778 18.8732 0.186639 18.9271 0.179761 18.9644L0.17187 19.0078L0.169729 19.0199L0.168774 19.0254L0 20H27V0H5.48935V1.66667ZM23.7968 8.90359C24.4515 8.9352 24.9564 8.96673 25.3223 8.99273V18.3333H2.02871C2.13021 17.9023 2.27063 17.3564 2.45392 16.7501C2.90131 15.2702 3.58503 13.4957 4.54069 12.1461C6.33587 9.6111 9.21095 8.75 16.2471 8.75C19.746 8.75 22.2109 8.82701 23.7968 8.90359ZM9.22741 15.8333C10.154 15.8333 10.9051 15.0871 10.9051 14.1667C10.9051 13.2462 10.154 12.5 9.22741 12.5C8.30083 12.5 7.5497 13.2462 7.5497 14.1667C7.5497 15.0871 8.30083 15.8333 9.22741 15.8333ZM14.2605 15.8333C15.1871 15.8333 15.9383 15.0871 15.9383 14.1667C15.9383 13.2462 15.1871 12.5 14.2605 12.5C13.334 12.5 12.5828 13.2462 12.5828 14.1667C12.5828 15.0871 13.334 15.8333 14.2605 15.8333ZM20.9714 14.1667C20.9714 15.0871 20.2202 15.8333 19.2937 15.8333C18.3671 15.8333 17.616 15.0871 17.616 14.1667C17.616 13.2462 18.3671 12.5 19.2937 12.5C20.2202 12.5 20.9714 13.2462 20.9714 14.1667Z" fill={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[200]} />
                                                </Svg>
                                                <Text className="font-jakarta-medium text-[16px] text-dark dark:text-gray-100">{t("Repassage")}</Text>
                                            </View>
                                            <View>
                                                <Text className="font-jakarta-medium  text-primary">+{fnPart(query.data.drying.price, country).main}f/Kg</Text>
                                            </View>
                                        </View>
                                    }
                                    check={form.dryingAddon}
                                    onCheck={(value) => setForm((prev) => ({ ...prev, dryingAddon: value }))}
                                />
                            </View>
                        </View>
                        <View className="my-8 ">
                            {/* <SwitcherButton
                                onShow={(s) => setForm(prev => ({ ...prev, autoRenew: s }))}
                                label={
                                    <Text className="font-jakarta-medium text-dark dark:text-gray-100 text-[16px]">{t("Activer le renouvellement automatique")}</Text>
                                }
                                show={form.autoRenew}
                            /> */}
                        </View>
                    </ScrollView>
                    <View className="p-4 " style={{ paddingBottom: bottom }}>
                        {
                            params.unique && (
                                <View className="mb-6 flex-row items-center gap-x-4 p-4 rounded-[15px] bg-primary/20 dark:bg-primary/20 ">
                                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" >
                                        <Path opacity="0.4" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill={colorScheme == "light" ? theme.extend.colors.primary.DEFAULT : theme.extend.colors.primary[500]} />
                                        <Path d="M12 13.75C12.41 13.75 12.75 13.41 12.75 13V8C12.75 7.59 12.41 7.25 12 7.25C11.59 7.25 11.25 7.59 11.25 8V13C11.25 13.41 11.59 13.75 12 13.75Z" fill={colorScheme == "light" ? theme.extend.colors.primary.DEFAULT : theme.extend.colors.primary[500]} />
                                        <Path d="M12.92 15.6199C12.87 15.4999 12.8 15.3899 12.71 15.2899C12.61 15.1999 12.5 15.1299 12.38 15.0799C12.14 14.9799 11.86 14.9799 11.62 15.0799C11.5 15.1299 11.39 15.1999 11.29 15.2899C11.2 15.3899 11.13 15.4999 11.08 15.6199C11.03 15.7399 11 15.8699 11 15.9999C11 16.1299 11.03 16.2599 11.08 16.3799C11.13 16.5099 11.2 16.6099 11.29 16.7099C11.39 16.7999 11.5 16.8699 11.62 16.9199C11.74 16.9699 11.87 16.9999 12 16.9999C12.13 16.9999 12.26 16.9699 12.38 16.9199C12.5 16.8699 12.61 16.7999 12.71 16.7099C12.8 16.6099 12.87 16.5099 12.92 16.3799C12.97 16.2599 13 16.1299 13 15.9999C13 15.8699 12.97 15.7399 12.92 15.6199Z" fill={colorScheme == "light" ? theme.extend.colors.primary.DEFAULT : theme.extend.colors.primary[500]} />
                                    </Svg>
                                    <View className="flex-1">
                                        <Text className="text-[12px] font-jakarta text-primary-500 dark:text-primary-100">{t("Aucun paiement ne vous sera demandé pour le moment. La facture de la commande vous sera présentée après la collecte de vos linges.")}</Text>
                                    </View>
                                </View>
                            )
                        }
                        <Button.Primary
                            loading={mutation.isPending || commandMutation.isPending}
                            onPress={() => params.unique ? handleSubmitUnique() : handleSubmit()}
                            label={<Text className="font-jakarta-bold text-[16px] text-dark text-gray-100">{params.unique ? t("Commander") : t("Payer - {{total}}f", { total: totalToPay })}</Text>}
                        />
                    </View>
                </View>
                <PaymentModal
                    open={!!command || !!order}
                    params={{ command, order }}
                    actionTitle={order ? t("Voir la commande") : t("Voir l'abonnement")}
                    title={order ? t("Commande créée") : t("Paiement confirmé")}
                    description={order ? t("Votre commande a été enrégistrée") : t("Votre paiement a été bien reçu")}
                    handleClose={() => {
                        if (order) {
                            setOrder(null)
                        } else {
                            setCommand(null)
                        }
                        if (command?.invoice.status == "SUCCESS") {
                            router.dismissTo("/client/packages")
                        } else if (order) {
                            router.dismissTo({
                                pathname: "/nolayout/client/order",
                                params: {
                                    id: order.id,
                                    orderString: JSON.stringify(order)
                                }
                            })
                        }

                        //router.dismissTo("/client/packages")
                    }}
                    onClose={() => {
                        if (order) {
                            setOrder(null)
                        } else {
                            setCommand(null)
                        }
                        //commandSavedData.current = null
                    }}
                    status={(command?.invoice?.status) ? command?.invoice?.status.toLowerCase() as any : (order ? "success" : undefined)}
                    verifyTransaction={() => {
                        if (commandSavedData.current?.id) {
                            handleSubmit(false)
                        }
                    }}
                    verificationPending={mutation.isPending}
                    routerBack
                    retryFailed={() => handleSubmit(true)}
                />
            </>
        )
    }

}


interface IDaySelector {
    selected: number[],
    onSelect: (x: number) => void,
    value: number,
    hours?: any,
    multipickingPrice?: any
    minMultiplePicking?: number
}
const DaySelector = ({ value, multipickingPrice, minMultiplePicking = 1, onSelect, selected, hours }: IDaySelector) => {

    const scrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (!scrollRef.current) return;
        const index = days.findIndex((d) => d.id === value);
        if (index >= 0) {
            const itemWidth = 100 + 24; // width + margin (≈ 100px + 24px)
            scrollRef.current.scrollTo({
                x: index * itemWidth,
                animated: true,
            });
        }
    }, [value]);

    return (
        <View>
            <Text className="font-jakarta-medium text-[14px] text-dark-400">{t("Selectionner un jour pour la collecte de vos linges")}</Text>
            <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} className="mt-4">
                {
                    days.map((d, i) => {
                        const hourTitle = hours.find((h: any) => h.id == d.id)
                        return (
                            <TouchableOpacity onPress={() => onSelect(d.id)} key={d.id} className={clx("relative w-[100px] p-2 justify-end h-[70px] rounded-[10px] ", i > 0 && "ml-6", value == d.id || selected.includes(d.id) ? "border border-primary bg-primary/10" : "border border-gray dark:border-dark-border")}>
                                <View className="" style={{
                                    alignItems: "stretch"
                                }}>
                                    {
                                        selected.includes(d.id) && multipickingPrice ?
                                            <View>
                                                <Text className="text-dark text-[12px] font-jakarta-medium dark:text-gray-100">{selected.findIndex((value) => d.id == value) >= (minMultiplePicking) ? <Text className="">{`+${fnPart(multipickingPrice, country).main}f`}</Text> : <Text>{t("Gratuit")}</Text>}</Text>
                                            </View>
                                            : <></>
                                    }
                                    <View>
                                        <Text className={clx(" text-[16px]", value == d.id || selected.includes(d.id) ? "text-primary" : " text-dark dark:text-gray-100", value == d.id ? "font-jakarta-bold" : "font-jakarta-medium")}>{d.name}</Text>
                                        {
                                            value != d.id && selected.includes(d.id) && hourTitle?.title && (
                                                <View>
                                                    <Text className="text-[12px] font-jakarta-medium text-primary">{hourTitle.title}</Text>
                                                </View>
                                            )
                                        }
                                    </View>
                                </View>
                                {
                                    value == d.id && (
                                        <View className="absolute top-2 right-2 justify-center items-center w-[14px] h-[14px] rounded-full bg-primary dark:bg-primary-500">
                                            <Svg width="9" height="8" viewBox="0 0 9 8" fill="none" >
                                                <Path d="M0.916667 5.16667L2.48309 6.34148C2.91178 6.663 3.51772 6.58946 3.85705 6.17472L8.5 0.5" stroke="white" strokeLinecap="round" />
                                            </Svg>
                                        </View>
                                    )
                                }
                            </TouchableOpacity>
                        )
                    })
                }
            </ScrollView>
        </View>
    )
}


interface IDateSelector {
    value: string,
    onSelect: (x: string) => void
}

const DateSelector = ({
    onSelect,
    value
}: IDateSelector) => {

    const dates = useMemo(() => {
        const days = [];
        const starting = addDays(new Date, 1);
        const end = new Date();
        end.setMonth(end.getMonth() + 2);
        const dayNames = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
        const monthNames = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

        let current = new Date(starting);
        let index = 0;

        while (current <= end) {
            const dayNo = current.getDate();
            const month = monthNames[current.getMonth()];
            const dayName = dayNames[current.getDay()];

            if (index < 7) {
                days.push({ dayNo, dayName, dateString: format(current, "yyyy-MM-dd") });
            } else {
                days.push({ dayNo, dayName: month, dateString: format(current, "yyyy-MM-dd") });
            }

            current.setDate(current.getDate() + 1);
            index++;
        }
        return days;
    }, [])

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {
                dates.map((d, i) => (
                    <View key={i}>
                        <TouchableOpacity onPress={() => onSelect(d.dateString)} key={d.dayNo} className={clx("relative w-[70px] p-2 justify-end h-[70px] rounded-[10px] ", i > 0 && "ml-6", d.dateString == value ? "border border-primary bg-primary/10" : "border border-gray dark:border-dark-border")}>
                            <View className="items-center">
                                <Text className="font-jakarta-bold text-[20px] text-dark font-jakarta-bold dark:text-gray-100">{d.dayNo}</Text>
                                <Text className="font-jakarta-bold text-[16px] text-dark font-jakarta-medium dark:text-gray-200">{capitalize(d.dayName)}</Text>
                            </View>
                            {
                                d.dateString == value && (
                                    <View className="absolute top-2 right-2 justify-center items-center w-[14px] h-[14px] rounded-full bg-primary dark:bg-primary-500">
                                        <Svg width="9" height="8" viewBox="0 0 9 8" fill="none" >
                                            <Path d="M0.916667 5.16667L2.48309 6.34148C2.91178 6.663 3.51772 6.58946 3.85705 6.17472L8.5 0.5" stroke="white" strokeLinecap="round" />
                                        </Svg>
                                    </View>
                                )
                            }
                        </TouchableOpacity>
                    </View>
                ))
            }
        </ScrollView>
    )
}

interface IHourSelector {
    onSelect: (x: string[]) => void,
    value: null | string[]
}
const HourSelector = ({ value, onSelect }: IHourSelector) => {
    const valueFormatted = useMemo(() => {
        return handleFormat(value)
    }, [value])
    return (
        <View>
            <Text className="font-jakarta-medium text-[14px] text-dark-400">{t("Selectionner une horaire pour la collecte ")}</Text>
            <View className="mt-4 flex-row ">
                {
                    hours.map((d, i) => {
                        const v = handleFormat(d.value)
                        const isActive = v == valueFormatted
                        return (
                            <TouchableOpacity onPress={() => onSelect(d.value)} key={v} className={clx("relative flex-1  p-3 justify-end  rounded-[10px] ", i > 0 && "ml-6", isActive ? "border border-primary bg-primary/10" : "border border-gray dark:border-dark-border")}>
                                <View className="">
                                    <Text className={clx("font-jakarta-medium text-[12px]", isActive ? "text-primary" : " text-dark dark:text-gray-100")}>{d.name}</Text>
                                    <Text className={clx("font-jakarta-medium text-[16px]", isActive ? "text-primary" : " text-dark dark:text-gray-100")}>{formatTimeRange(d.value as any)}</Text>
                                </View>
                                {
                                    isActive && (
                                        <View className="absolute top-2 right-2 justify-center items-center w-[14px] h-[14px] rounded-full bg-primary dark:bg-primary-500">
                                            <Svg width="9" height="8" viewBox="0 0 9 8" fill="none" >
                                                <Path d="M0.916667 5.16667L2.48309 6.34148C2.91178 6.663 3.51772 6.58946 3.85705 6.17472L8.5 0.5" stroke="white" strokeLinecap="round" />
                                            </Svg>
                                        </View>
                                    )
                                }
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
        </View>
    )
}

function WeekSelector({
    value, setValue
}: { value: number[], setValue: (value: ((prev: number[]) => number[])) => void }) {
    const weeks = [1, 2, 3, 4]
    const handlePress = (value: number) => {
        setValue((prev) => {
            let values: number[] = []
            if (prev.includes(value)) {
                values = prev.filter(p => p != value)
            } else {
                values = Array.from(new Set([...prev, value].sort((a, b) => a - b)))
            }
            if (values.length < 2) {
                Alert.alert(t("Vous devez selectionner au moins 2 semaines pour vous abonner."))
                return prev
            } else {
                return values
            }

        })
    }
    return (
        <ScrollView horizontal className="">
            {
                weeks.map(w => (
                    <TouchableOpacity onPress={() => handlePress(w)} key={w} className={clx("w-[70px] h-[70px] gap-y-2 items-center justify-center rounded-full border  mr-6", value.includes(w) ? "bg-primary border-primary" : "border-gray-300 dark:border-gray-200")}>
                        <View className=" justify-center">
                            <View>
                                <Text className={clx("font-jakarta-medium text-[12px] ", value.includes(w) ? "text-gray-100 dark:text-gray-100" : "text-dark-300 dark:text-gray-200")}>{t("Sem")}</Text>
                            </View>
                            <View>
                                <Text className={clx("text-center font-jakarta-bold text-[18px] ", value.includes(w) ? "text-white dark:text-white" : "text-dark-300 dark:text-gray-200")}>{w}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))
            }

        </ScrollView >
    )
}

interface IShippingOptions {
    options: { [x: string]: IServiceMeta },
    onSelect: (id: string) => void,
    value: string | number,
    params: any
}
export const ShippingOptions = ({ options, params, onSelect, value }: IShippingOptions) => {
    const ICONS = {
        "shipping_default": (
            <Svg width="30" height="30" viewBox="0 0 30 30" fill="none" >
                <Path d="M18.75 2.5V15C18.75 16.375 17.625 17.5 16.25 17.5H2.5V7.5C2.5 4.7375 4.7375 2.5 7.5 2.5H18.75Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M27.5 17.5V21.25C27.5 23.325 25.825 25 23.75 25H22.5C22.5 23.625 21.375 22.5 20 22.5C18.625 22.5 17.5 23.625 17.5 25H12.5C12.5 23.625 11.375 22.5 10 22.5C8.625 22.5 7.5 23.625 7.5 25H6.25C4.175 25 2.5 23.325 2.5 21.25V17.5H16.25C17.625 17.5 18.75 16.375 18.75 15V6.25H21.05C21.95 6.25 22.775 6.73751 23.225 7.51251L25.3625 11.25H23.75C23.0625 11.25 22.5 11.8125 22.5 12.5V16.25C22.5 16.9375 23.0625 17.5 23.75 17.5H27.5Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M10 27.5C11.3807 27.5 12.5 26.3807 12.5 25C12.5 23.6193 11.3807 22.5 10 22.5C8.61929 22.5 7.5 23.6193 7.5 25C7.5 26.3807 8.61929 27.5 10 27.5Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M20 27.5C21.3807 27.5 22.5 26.3807 22.5 25C22.5 23.6193 21.3807 22.5 20 22.5C18.6193 22.5 17.5 23.6193 17.5 25C17.5 26.3807 18.6193 27.5 20 27.5Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M27.5 15V17.5H23.75C23.0625 17.5 22.5 16.9375 22.5 16.25V12.5C22.5 11.8125 23.0625 11.25 23.75 11.25H25.3625L27.5 15Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
        ),
        "shipping_fast": (
            <Svg width="31" height="30" viewBox="0 0 31 30" fill="none" >
                <Path d="M15.3332 17.5H16.5832C17.9582 17.5 19.0832 16.375 19.0832 15V2.5H7.83319C5.95819 2.5 4.3207 3.53748 3.4707 5.06248" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M2.83325 21.25C2.83325 23.325 4.50825 25 6.58325 25H7.83325C7.83325 23.625 8.95825 22.5 10.3333 22.5C11.7083 22.5 12.8333 23.625 12.8333 25H17.8333C17.8333 23.625 18.9583 22.5 20.3333 22.5C21.7083 22.5 22.8333 23.625 22.8333 25H24.0833C26.1583 25 27.8333 23.325 27.8333 21.25V17.5H24.0833C23.3958 17.5 22.8333 16.9375 22.8333 16.25V12.5C22.8333 11.8125 23.3958 11.25 24.0833 11.25H25.6957L23.5583 7.51251C23.1083 6.73751 22.2833 6.25 21.3833 6.25H19.0833V15C19.0833 16.375 17.9583 17.5 16.5833 17.5H15.3333" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M10.3333 27.5C11.714 27.5 12.8333 26.3807 12.8333 25C12.8333 23.6193 11.714 22.5 10.3333 22.5C8.95254 22.5 7.83325 23.6193 7.83325 25C7.83325 26.3807 8.95254 27.5 10.3333 27.5Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M20.3333 27.5C21.714 27.5 22.8333 26.3807 22.8333 25C22.8333 23.6193 21.714 22.5 20.3333 22.5C18.9525 22.5 17.8333 23.6193 17.8333 25C17.8333 26.3807 18.9525 27.5 20.3333 27.5Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M27.8333 15V17.5H24.0833C23.3958 17.5 22.8333 16.9375 22.8333 16.25V12.5C22.8333 11.8125 23.3958 11.25 24.0833 11.25H25.6957L27.8333 15Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M2.83325 10H10.3333" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M2.83325 13.75H7.83325" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M2.83325 17.5H5.33325" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
        ),
        "shipping_prioritized": (
            <Svg width="31" height="30" viewBox="0 0 31 30" fill="none" >
                <Path d="M15.6667 27.5C22.5703 27.5 28.1667 21.9036 28.1667 15C28.1667 8.09644 22.5703 2.5 15.6667 2.5C8.76319 2.5 3.16675 8.09644 3.16675 15C3.16675 21.9036 8.76319 27.5 15.6667 27.5Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M11.5167 14.8875L13.5792 15.4L12.3917 20.2001C12.1167 21.3251 12.6667 21.7 13.6167 21.0375L20.0917 16.55C20.8792 16 20.7667 15.3625 19.8292 15.125L17.7667 14.6125L18.9542 9.81251C19.2292 8.68751 18.6792 8.31253 17.7292 8.97503L11.2542 13.4626C10.4667 14.0126 10.5792 14.65 11.5167 14.8875Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>

        )
    }
    return (
        <View>
            <View className="flex-row gap-x-4">
                <View className="flex-1 flex-row">
                    <ShippingOption onSelect={onSelect} isActive={options.shipping_default.code == value} option={options.shipping_default} icon={ICONS.shipping_default} />
                </View>
                <View className="flex-1 flex-row">
                    <ShippingOption onSelect={onSelect} option={options.shipping_fast} isActive={options.shipping_fast.code == value} icon={ICONS.shipping_fast} />
                </View>
                <View className="flex-1 flex-row">
                    <ShippingOption onSelect={onSelect} option={options.shipping_prioritized} isActive={options.shipping_prioritized.code == value} icon={ICONS.shipping_prioritized} />
                </View>
            </View>
        </View>
    )
}
interface IShippingOption {
    option: IServiceMeta,
    icon: React.ReactNode,
    isActive?: boolean,
    onSelect?: (id: string) => void
}
const ShippingOption = ({ option, onSelect, icon, isActive }: IShippingOption) => {
    return (
        <TouchableOpacity onPress={() => onSelect?.(option.code)} className={clx("gap-y-4 flex-1 relative   p-3  rounded-[10px] ", isActive ? "border border-primary bg-primary/10" : "border border-gray dark:border-dark-border")}>
            <View className="flex-row  items-start justify-between">
                <View>
                    {icon}
                </View>
                <View>
                    <Text className="font-jakarta text-dark-300 dark:text-gray-400">~{option.value.timeDurationApprox}h</Text>
                </View>
            </View>
            <View className="gay-y-1">
                <Text className="font-jakarta-bold text-[16px] text-dark dark:text-gray-100">{option.name}</Text>
                <Text className="font-jakarta-medium text-[14px] text-dark dark:text-gray-200">{Number(option.price) == 0 ? t("Gratuit") : `+ ${fnPart(option.price, country).main} f/Kg`}</Text>
            </View>
            {
                isActive && (
                    <View className="absolute bottom-2 right-2 justify-center items-center w-[14px] h-[14px] rounded-full bg-primary dark:bg-primary-500 ">
                        <Svg width="9" height="8" viewBox="0 0 9 8" fill="none" >
                            <Path d="M0.916667 5.16667L2.48309 6.34148C2.91178 6.663 3.51772 6.58946 3.85705 6.17472L8.5 0.5" stroke="white" strokeLinecap="round" />
                        </Svg>
                    </View>
                )
            }
        </TouchableOpacity>
    )
}


export const PaymentModal = ({
    params,
    pendingDescription = "Veuillez confirmer le paiement sur votre téléphone pour valider la transaction",
    pendingTitle = "Paiement en attente",
    actionTitle = "Voir l'abonnement",
    title = "Paiement confirmé",
    description = "Votre paiement a été bien reçu",
    open,
    handleClose,
    onClose,
    status = "pending",
    onResult,
    verifyTransaction,
    failedDescription = "Votre paiement n'a pas été reçu. Veuillez rééssayer à nouveau",
    failedTitle = "Paiement non abouti",
    verificationPending,
    pendingLottiFile,
    retryFailed,
    routerBack
}: {
    failedTitle?: string,
    failedDescription?: string,
    pendingLottiFile?: string | number,
    pendingDescription?: string,
    pendingTitle?: string,
    actionTitle?: string,
    title?: string,
    retryFailed?: any,
    description?: string,
    routerBack?: boolean,
    handleClose: () => void,
    verifyTransaction?: any,
    verificationPending?: any,
    onResult?: (x: any) => void,
    open: boolean,
    onClose: () => void,
    status?: "pending" | "success" | "failed" | "created",
    params?: any
}) => {
    const { t } = useTranslation()
    const router = useRouter()
    const { top, bottom } = useSafeAreaInsets()
    const { colorScheme } = useColorScheme()
    return (
        <Modal visible={open} transparent onRequestClose={() => {
            onClose()
        }}>
            <SafeAreaView className="relative flex-1 items-center justify-center bg-white dark:bg-dark-bg p-2 gap-y-2">
                <View className=" left-2 absolute" style={{ top }}>
                    <TouchableOpacity onPress={onClose} style={{ width: 35, height: 35, borderRadius: 35, justifyContent: "center", alignItems: "center" }} className="bg-gray-100 dark:bg-dark-lighter">
                        <Svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                            <Path d="M0.757324 9.24268L9.24261 0.757395" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <Path d="M9.24261 9.24261L0.757324 0.757324" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                    </TouchableOpacity>
                </View>
                {
                    status == "pending" || status == "created" ? (
                        <>
                            <View className="flex-1 justify-end mt-15">
                                <View style={{ borderRadius: 100, width: 130, height: 130, justifyContent: "center", alignItems: "center" }} className="bg-yellow-100 dark:bg-yellow-dark-300">
                                    <View style={{ height: 100, width: 100, marginRight: -20 }} className="">
                                        <LottieView autoPlay loop style={{ flex: 1 }} source={pendingLottiFile ?? require("@/assets/lotties/payment-pending.json")} />
                                    </View>
                                </View>
                            </View>
                            <View className="flex-1">
                                <View className="gap-y-4 mt-2 ">
                                    <View className="flex-1">
                                        <View>
                                            <Text className="text-center font-jakarta-semibold text-[20px] text-dark dark:text-gray-100">{t(pendingTitle)}</Text>
                                        </View>
                                        <View className="mt-4">
                                            <Text className="text-center font-jakarta text-[14px] text-dark-secondary">{t(pendingDescription)}</Text>
                                        </View>
                                    </View>
                                    {
                                        verifyTransaction && (
                                            <View style={{ marginBottom: bottom }}>
                                                <VerifyTransactionStatus onResult={onResult ?? (() => { })} verifyTransaction={verifyTransaction} verificationPending={verificationPending} intervalSecond={20} />
                                            </View>
                                        )
                                    }

                                </View>
                            </View>

                        </>
                    ) : <></>
                }
                {
                    status == "success" ? (
                        <>
                            <View style={{ backgroundColor: colorScheme == "light" ? theme.extend.colors.primary[100] : theme.extend.colors.primary.dark, borderRadius: 100, width: 120, height: 120, justifyContent: "center", alignItems: "center" }}>
                                <View style={{ height: 150, width: 150 }}>
                                    <LottieView autoPlay loop={false} style={{ flex: 1 }} source={require("@/assets/lotties/valid-success.json")} />
                                </View>
                            </View>

                            <View className="gap-y-4 my-2">
                                <View>
                                    <Text className="text-center font-jakarta-semibold text-[20px] text-primary">{t(title)}</Text>
                                </View>
                                <View>
                                    <Text className="text-center font-jakarta text-[14px] text-dark-secondary">{t(description)}</Text>
                                </View>
                            </View>
                            <View className="flex-row justify-center">
                                <TouchableOpacity disabled={verificationPending} onPress={() => {
                                    handleClose()

                                }} className="bg-gray-100 px-4 py-2 rounded-full flex-row items-center gap-x-2 dark:bg-primary-dark">

                                    <View>
                                        <Text className="font-jakarta text-dark text-[14px]">{t(actionTitle)}</Text>
                                    </View>
                                    <View>
                                        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" >
                                            <Path d="M14.4301 5.92993L20.5001 11.9999L14.4301 18.0699" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[100]} strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                            <Path d="M3.5 12H20.33" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[100]} strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        </Svg>

                                    </View>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : <></>
                }
                {
                    status == "failed" ? (
                        <>
                            <View style={{ borderRadius: 100, width: 150, height: 150, justifyContent: "center", alignItems: "center" }}>
                                <View style={{ height: 200, width: 200, }}>
                                    <LottieView autoPlay loop={false} style={{ flex: 1 }} source={require("@/assets/lotties/paymen-failed.json")} />
                                </View>
                            </View>

                            <View className="gap-y-2 px-2 my-2">
                                <View>
                                    <Text className="text-center font-jakarta-semibold text-[20px] text-red">{t(failedTitle)}</Text>
                                </View>
                                <View>
                                    <Text className="text-center font-jakarta text-[14px] text-dark-secondary">{t(failedDescription)}</Text>
                                </View>
                            </View>
                            <View className="flex-row justify-center ">
                                <TouchableOpacity disabled={verificationPending} onPress={retryFailed} className="bg-primary dark:bg-primary-dark px-4 py-3 rounded-full flex-row items-center gap-x-2">
                                    <View>
                                        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <Path d="M9.11008 5.0799C9.98008 4.8199 10.9401 4.6499 12.0001 4.6499C16.7901 4.6499 20.6701 8.5299 20.6701 13.3199C20.6701 18.1099 16.7901 21.9899 12.0001 21.9899C7.21008 21.9899 3.33008 18.1099 3.33008 13.3199C3.33008 11.5399 3.87008 9.8799 4.79008 8.4999" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <Path d="M7.87012 5.32L10.7601 2" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <Path d="M7.87012 5.32007L11.2401 7.78007" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </Svg>

                                    </View>
                                    <View>
                                        <Text className="font-jakarta text-dark">{t("Rééssayer")}</Text>
                                    </View>
                                </TouchableOpacity>

                            </View>
                        </>
                    ) : <></>
                }

            </SafeAreaView>
        </Modal>
    )
}


export function VerifyTransactionStatus({ verificationPending, verifyTransaction, onResult, intervalSecond = 30 }: { onResult: (x: any) => void, verificationPending: any, verifyTransaction: any, intervalSecond?: number }) {
    const [retryAt, setRetryAt] = React.useState(addSeconds(new Date(), intervalSecond))
    const { t } = useTranslation()
    const [loading, setLoading] = React.useState(false)
    const intervalRef = React.useRef(null as number | null)
    const [currentTime, setCurrentTime] = React.useState(new Date())
    const counter = useRef(0)
    let verification = React.useRef(false)
    React.useEffect(() => {
        if (!intervalRef.current && retryAt > currentTime) {
            intervalRef.current = setInterval(() => {
                const current = addSeconds(currentTime, 1)
                if (current.getTime() < retryAt.getTime()) {
                    setCurrentTime(prev => current)
                } else {
                    setCurrentTime(prev => current)
                    clearInterval(intervalRef.current!)
                    intervalRef.current = null
                    if (!verification.current) {
                        //handleVerify()
                    }
                    counter.current += 1
                }
            }, 1000)
            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [intervalRef.current, retryAt])

    const handleVerify = async () => {
        if (verification.current) return
        try {
            verification.current = true
            setLoading(true)
            const result = await verifyTransaction()
            onResult(result?.data)
        } catch (e) {
            console.log(e)
        } finally {
            verification.current = false
            const now = new Date()
            setRetryAt(addSeconds(now, intervalSecond))
            setCurrentTime(now)
            clearInterval(intervalRef.current!)
            intervalRef.current = null
            setLoading(false)
        }
    }


    const getCountDown = () => {
        const timeDiff = retryAt.getTime() - currentTime.getTime();

        if (timeDiff <= 0) {
            return "00:00";
        }

        const duration = intervalToDuration({
            start: currentTime,
            end: retryAt
        });

        const { hours, minutes, seconds } = duration;

        return `${hours ? hours + ":" : ""}${(minutes || 0).toString().padStart(2, '0')}:${(seconds || 0).toString().padStart(2, '0')}`;

    }
    const disabled = retryAt.getTime() > currentTime.getTime() || verificationPending
    return (
        <Animated.View className="px-2" entering={FadeIn.duration(300)} >
            <View className="px-3 py-3  rounded-[20px] justify-center items-center bg-slate-100 dark:bg-dark-lighter">
                <View >
                    <Text className="text-[12px] text-center font-jakarta text-dark-secondary">{t("Nous vérifions automatiquement le status du paiement dans " + getCountDown())}</Text>
                </View>
                <TouchableOpacity onPress={handleVerify} className={clx(disabled && 'opacity-70', " mt-2")}>
                    <View className="flex-row items-center gap-x-2">
                        {
                            loading ?
                                <View className="w-[18px] h-[18px]">
                                    <LottieView autoPlay loop style={{ flex: 1 }} colorFilters={[{ keypath: "Shape Layer 1.Stroke 1", color: theme.extend.colors.primary.DEFAULT }]} source={require("@/assets/lotties/loading-1.json")} />
                                </View>
                                :
                                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <Path d="M9.11008 5.0799C9.98008 4.8199 10.9401 4.6499 12.0001 4.6499C16.7901 4.6499 20.6701 8.5299 20.6701 13.3199C20.6701 18.1099 16.7901 21.9899 12.0001 21.9899C7.21008 21.9899 3.33008 18.1099 3.33008 13.3199C3.33008 11.5399 3.87008 9.8799 4.79008 8.4999" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <Path d="M7.87012 5.32L10.7601 2" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <Path d="M7.87012 5.32007L11.2401 7.78007" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                        }
                        <Text className="text-[12px] font-jakarta-semibold text-primary dark:text-primary">{t("Vérifier maintenant")}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </Animated.View>
    )


}