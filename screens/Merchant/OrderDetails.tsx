import { confirmCommand, submitAction } from "@/api/merchants";
import { getOrder } from "@/api/subscription";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { WarningAlert } from "@/components/Modal";
import { StatusLabel } from "@/components/State";
import { Text } from "@/components/Themed";
import { clx, fnPart } from "@/helpler";
import { country } from "@/storage/config";
import { useStore } from "@/store/store";
import { IOrder } from "@/store/type";
import { theme } from "@/tailwind.config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Decimal } from "decimal.js";
import { useLocalSearchParams } from "expo-router";
import { t } from "i18next";
import { useColorScheme } from "nativewind";
import { useMemo } from "react";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";
import { PrioritShipping, StatusItem } from "../Client/Histories";

export function OrderDetails() {
    const user = useStore(s => s.user)
    const { orderString, id } = useLocalSearchParams<{ orderString: string, id: string }>()
    const orderParsed = useMemo(() => {
        if (orderString) {
            return JSON.parse(orderString)
        }
    }, [orderString])
    const orderQuery = useQuery({
        queryKey: ["order-key-" + id],
        queryFn: () => getOrder(id),
        
    })
    const order: IOrder | undefined = useMemo(() => {
        if (orderQuery.isSuccess && orderQuery.data) {
            return orderQuery.data
        } else if (orderParsed) {
            return orderParsed
        }
    }, [orderParsed, orderQuery.data])
    const { colorScheme } = useColorScheme()
    const { bottom } = useSafeAreaInsets()
    const confirmMutation = useMutation({
        mutationKey: ["confirm"],
        mutationFn: confirmCommand
    })
    const submitActionMutation = useMutation({
        mutationKey: ["submit-" + order?.id],
        mutationFn: submitAction
    })

    if (order) {
        const detailsData = [
            {
                title: t("Date de la commande"),
                description1: `${format(order.executionDate, "dd/MM")} à ${order.pickingHours[0]}`
            },
            {
                title: t("Date de livraison"),
                description1: format(order.deliveryDate, "dd/MM 'à' HH:mm")
            },
            {
                title: t("Délai maximal de traitement "),
                description1: `~${order.executionDuration}h`,
                description2: format(order.deliveryDate, "dd/MM 'à' HH:mm")
            }
        ]
        const additionnamOptions = useMemo(() => {
            const data = []
            for (let k in order.addons) {
                if (k == "SHIPPING" && order.addons[k].totalCost) {
                    data.push({
                        title: t("Livraison en {{t}}h",
                            {
                                t: order.executionDuration
                            }
                        ),
                        description1: t("+{{amount}}Kg", {
                            amount: order.addons.SHIPPING.unitCost
                        })
                    })
                } else if (k === "REPASSAGE" && order.addons[k].totalCost) {
                    data.push({
                        title: t("Repassage",
                            {
                                t: order.executionDuration
                            }
                        ),
                        description1: t("+{{amount}}Kg", {
                            amount: order.addons.REPASSAGE.unitCost
                        })
                    })
                }
            }
            return data
        }, [order])
        const handleConfirmCommand = async (confirm = true) => {
            if (confirm)
                return Alert.alert(t("Confirmer la commande"), t("Etes vous sur de pouvoir traiter cette commande dans les délais impartis ?"), [
                    {
                        text: t("Annuler")
                    },
                    {
                        text: t("Accepter"),
                        onPress: () => {
                            handleConfirmCommand(false)
                        }
                    }
                ])

            try {
                const data = await confirmMutation.mutateAsync({
                    orderId: order!.id!
                })
                await orderQuery.refetch()
                Toast.show({
                    text2: t("Commande acceptée"),
                    type: "success"
                })
            } catch (e) {
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
        const handleSubmitAction = async (action: "WASHED" | "REJECTED", confirm = true) => {
            if (confirm) {
                return Alert.alert(t("Confirmation"), action === "WASHED" ? t("Confirmez-vous le lavage complet selon les conditions du client de cette commande ?") : t("Etes vous sur de vouloir abandonner cette commande ?"), [
                    {
                        text: t("Annuler")
                    },
                    {
                        text: t("Oui, Continuer"),
                        onPress: () => {
                            handleSubmitAction(action, false)
                        }
                    }
                ])
            }
            try {
                const data = await submitActionMutation.mutateAsync({
                    action,
                    orderId: order.id
                })
                orderQuery.refetch()
                Toast.show({
                    text2: t("Commande mise à jour"),
                    type: "success"
                })
            } catch (e) {
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
        return (
            <View className="flex-1">
                <View className="flex-1 bg-light dark:bg-dark-bg">
                    <Header
                        title={t("Details de la commande")}
                    />
                    <ScrollView contentContainerClassName="flex-1"
                        refreshControl={
                            <RefreshControl
                                refreshing={!!orderQuery.data && orderQuery.isPending}
                                onRefresh={orderQuery.refetch}
                            />
                        }
                    >
                        <View className="flex-1">
                            <View className="flex-row items-center p-4">
                                <View className="flex-1 ">
                                    <Text className="font-jakarta-bold text-[20px] text-dark dark:text-gray-100">#{order.orderId}</Text>
                                </View>
                                <View className="flex-row items-center gap-x-4">
                                    {
                                        ["SHIPPING_FAST", "SHIPPING_PRIORITIZED"].includes(order.deliveryType) ? (
                                            <PrioritShipping contained={false} title={"Urgent~" + order.executionDuration + "h"} />
                                        ) : <></>
                                    }
                                    <StatusItem order={order} />
                                </View>
                            </View>
                            <View className="mt-4 p-4">
                                <View >
                                    <Text className="font-jakarta-bold text-[16px] text-primary dark:text-primary">{t("Details")}</Text>
                                    <View className="p-4 gap-y-4 rounded-[15px] mt-4 bg-white dark:bg-dark-dark-bg">
                                        {
                                            detailsData.map(d => (
                                                <View key={d.title}><Description  {...d} /></View>
                                            ))
                                        }
                                    </View>
                                </View>
                            </View>
                            {
                                additionnamOptions.length ? (
                                    <View className="mt-8 ">
                                        <View className="px-4">
                                            <Text className="font-jakarta-bold text-[16px] text-primary dark:text-primary">{t("Options additionnels")}</Text>
                                            <View className="p-4 rounded-[15px]  mt-4 gap-y-4 bg-white dark:bg-dark-dark-bg">
                                                {
                                                    additionnamOptions.map(d => (
                                                        <View key={d.title}>
                                                            <Description right  {...d} />
                                                        </View>
                                                    ))
                                                }
                                            </View>
                                        </View>
                                    </View>
                                ) : <></>
                            }
                            <View className="mt-8 p-4">
                                <View className="">
                                    <View className="flex-row items-center justify-between">
                                        <View>
                                            <Text className="font-jakarta-bold text-[16px] text-primary dark:text-primary">{t("Prix de traitement")}</Text>
                                        </View>
                                        <View>
                                            {
                                                order.merchantPaymentStatus == "PENDING" && <StatusLabel color='warning' title={t("En attente de versement")} contained />
                                            }
                                            {
                                                order.merchantPaymentStatus == "REVERSED" && <StatusLabel color="success" title={t("Payé")}  />
                                            }
                                        </View>
                                    </View>

                                    <View className="bg-white rounded-[15px] dark:bg-dark-dark-bg  mt-4 flex-row items-center justify-between p-4 bg-white dark:bg-dark-dark-bg">
                                        <Text className="font-jakarta-bold text-[16px] text-dark dark:text-gray-100">{`${Decimal(order.merchantKgCost).toNumber()}f/kg * ${order.userKg}Kg`}</Text>
                                        <Text className="font-jakarta-bold text-primary text-[20px] dark:text-primary">{`${fnPart(Decimal(order.merchantKgCost!).mul(order.userKg!).toNumber()!, country).main}f`}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        {

                            <View className="flex-row items-center gap-x-4 px-4 " style={{ marginBottom: bottom }}>
                                {
                                    (user?.merchantId && order.merchantId == user.merchantId) && (
                                        order.status == "WASHING" ? (
                                            <>
                                                <View className="">
                                                    <Button onPress={() => handleSubmitAction("REJECTED")} className=" bg-gray-200 dark:bg-dark-lighter">
                                                        <View className="flex-row items-center gap-x-2 justify-center">
                                                            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none" >
                                                                <Path d="M10 18.3334C14.5834 18.3334 18.3334 14.5834 18.3334 10.0001C18.3334 5.41675 14.5834 1.66675 10 1.66675C5.41669 1.66675 1.66669 5.41675 1.66669 10.0001C1.66669 14.5834 5.41669 18.3334 10 18.3334Z" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]} strokeLinecap="round" strokeLinejoin="round" />
                                                                <Path d="M7.64166 12.3583L12.3583 7.6416" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]} strokeLinecap="round" strokeLinejoin="round" />
                                                                <Path d="M12.3583 12.3583L7.64166 7.6416" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]} strokeLinecap="round" strokeLinejoin="round" />
                                                            </Svg>
                                                            <Text className="font-jakarta-medium text-[14px] text-dark dark:text-gray-200">{t("Renoncer")}</Text>
                                                        </View>
                                                    </Button>
                                                </View>
                                                <View className="flex-1">
                                                    <Button.Primary onPress={() => handleSubmitAction("WASHED")} className=" bg-green dark:bg-green-dark-500">
                                                        <View className="flex-row items-center gap-x-2 justify-center">
                                                            <Svg width="21" height="20" viewBox="0 0 21 20" fill="none" >
                                                                <Path d="M10.5 17.5C12.2352 17.5 13.9166 16.8984 15.2579 15.7976C16.5992 14.6968 17.5174 13.165 17.8559 11.4632C18.1944 9.76135 17.9324 7.9948 17.1144 6.46453C16.2965 4.93425 14.9732 3.73492 13.3701 3.0709C11.767 2.40689 9.98332 2.31926 8.32287 2.82295C6.66242 3.32664 5.22799 4.39049 4.26398 5.83322C3.29997 7.27596 2.86604 9.00832 3.03611 10.7351C3.20619 12.4619 3.96975 14.0764 5.1967 15.3033" stroke={colorScheme == "light" ? "#fff" : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeLinecap="round" />
                                                                <Path d="M13.8334 8.33325L11.0688 11.6508C10.4132 12.4375 10.0854 12.8308 9.64482 12.8508C9.20425 12.8708 8.8422 12.5087 8.1181 11.7846L7.16671 10.8333" stroke={colorScheme == "light" ? "#fff" : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeLinecap="round" />
                                                            </Svg>
                                                            <Text className="font-jakarta-medium text-[14px] text-white dark:text-gray-200">{t("Marquer lavage terminée")}</Text>
                                                        </View>
                                                    </Button.Primary>
                                                </View>
                                            </>
                                        ) : (
                                            <>

                                                {
                                                    order.status == "READY" && (
                                                        <WarningAlert
                                                            title={t("Livraison démarrée")}
                                                            description={t("Nos livreurs passeront pour récupérer la commande. Votre compte sera sera crédité du montant de la commande dès confirmation de reception par le client. Veuillez préparer la commande en le mettant dans les sacs pour la livraison.")}
                                                        />
                                                    )
                                                }

                                            </>
                                        )
                                    )
                                }
                                {
                                    !(order?.merchantId) && (
                                        <View className="flex-1">
                                            <Button.Primary loading={confirmMutation.isPending} onPress={() => handleConfirmCommand()} className=" bg-green dark:bg-green-dark-500">
                                                <View className="flex-row  items-center gap-x-2 justify-center">
                                                    <Svg width="21" height="20" viewBox="0 0 21 20" fill="none" >
                                                        <Path d="M10.5 17.5C12.2352 17.5 13.9166 16.8984 15.2579 15.7976C16.5992 14.6968 17.5174 13.165 17.8559 11.4632C18.1944 9.76135 17.9324 7.9948 17.1144 6.46453C16.2965 4.93425 14.9732 3.73492 13.3701 3.0709C11.767 2.40689 9.98332 2.31926 8.32287 2.82295C6.66242 3.32664 5.22799 4.39049 4.26398 5.83322C3.29997 7.27596 2.86604 9.00832 3.03611 10.7351C3.20619 12.4619 3.96975 14.0764 5.1967 15.3033" stroke={colorScheme == "light" ? "#fff" : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeLinecap="round" />
                                                        <Path d="M13.8334 8.33325L11.0688 11.6508C10.4132 12.4375 10.0854 12.8308 9.64482 12.8508C9.20425 12.8708 8.8422 12.5087 8.1181 11.7846L7.16671 10.8333" stroke={colorScheme == "light" ? "#fff" : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeLinecap="round" />
                                                    </Svg>
                                                    <Text className="font-jakarta-medium text-[14px] text-white dark:text-gray-200">{t("Accepter la commande")}</Text>
                                                </View>
                                            </Button.Primary>
                                        </View>
                                    )
                                }
                            </View>

                        }
                    </ScrollView>

                </View>
            </View>
        )
    }

}



const Description = ({ title, description1, description2, right = false }: {
    title: string,
    description1: string,
    description2?: string,
    right?: boolean
}) => {
    return (
        <View className={clx(right ? " flex-row items-center justify-between" : "gap-y-1")}>
            <View>
                <Text className="font-jakarta-semibold text-[16px] text-dark dark:text-gray-100">{title}</Text>
            </View>
            <View className="flex-row items-center gap-x-2">
                <Text className={clx("font-jakarta ", right ? "text-[16px] font-jakarta-medium text-primary dark:text-primary" : "text-[14px] text-dark-400 dark:text-gray-400")}>{description1}</Text>
                {
                    description2 &&
                    <>
                        <View className="w-[3px] h-[3px] rounded-full bg-dark-300 dark:bg-gray"></View>
                        <Text className="font-jakarta text-[14px] text-dark-300 dark:text-dark-400">{description2}</Text>
                    </>
                }

            </View>
        </View>
    )
}