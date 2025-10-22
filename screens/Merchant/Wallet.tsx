import { getMerchant } from "@/api/merchants";
import { BasicModal } from "@/components/Modal";
import { StatusLabel } from "@/components/State";
import { Text } from "@/components/Themed";
import { fnPart } from "@/helpler";
import { country } from "@/storage/config";
import { IPayment } from "@/store/type";
import { theme } from "@/tailwind.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Decimal from "decimal.js";
import { router } from "expo-router";
import { t } from "i18next";
import { useColorScheme } from "nativewind";
import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

export function Wallet() {
    const { top, bottom } = useSafeAreaInsets()
    const { colorScheme } = useColorScheme()
    const query = useQuery({
        queryKey: ["merchant"],
        queryFn: getMerchant
    })
    const solde: any = query.data?.balance ?? 0
    const serviceFeeRate = query.data?.serviceFeeRate
    const [payment, setPayment] = React.useState<IPayment | null>(null)
    return (
        <BottomSheetModalProvider>
            <View className="flex-1">
                <View className="px-4  bg-primary-500 dark:bg-primary-dark-500 gap-y-2" style={{ paddingTop: top + 20, paddingBottom: 50 }}>
                    <Text className="font-jakarta-bold text-[25px] text-white dark:text-gray-100">{t("Portefeuille")}</Text>
                    <Text className="font-jakarta-semibold text-[14px] text-white dark:text-gray-100">{t("Gerer votre argent depuis votre portefeuille")}</Text>
                </View>
                <View className="bg-light dark:bg-dark-bg rounded-t-[30px] -mt-[30px] flex-1 " style={{ paddingBottom: bottom + 100 + 20 }}>
                    {
                        query.isLoading && (
                            <View className="flex-row items-center justify-between  mt-4 p-4">
                                <View className="bg-gray-200 dark:bg-dark-400 rounded-[15px] h-[40px] w-[150px]"></View>
                                <View className="bg-gray-200 dark:bg-dark-400 rounded-[15px] h-[40px] w-[100px]"></View>
                            </View>
                        )
                    }
                    {
                        query.isSuccess && (
                            <View className="p-4 flex-row items-center justify-between mt-4">

                                <View className="gap-y-1">
                                    <Text className="font-jakarta text-[14px] text-dark-400 dark:text-dark-400">{t("Solde actuel")}</Text>
                                    <Text className="font-jakarta-bold text-[35px] text-primary dark:text-white">{fnPart(solde, country).main}f</Text>
                                </View>


                                <View>
                                    <TouchableOpacity disabled={!query.isSuccess} onPress={() => router.push({
                                        "pathname": "/nolayout/merchant/withdraw",
                                        "params": {
                                            balance: solde,
                                            serviceFeeRate
                                        }
                                    })} className="flex-row items-center bg-primary/10 dark:bg-primary/20 p-2 rounded-full">
                                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" >
                                            <Path d="M9.76666 11.7334L11.9 13.8667L14.0333 11.7334" stroke={colorScheme == "light" ? theme.extend.colors.primary.DEFAULT : theme.extend.colors.primary.DEFAULT} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                            <Path d="M11.9 5.33325V13.8083" stroke={colorScheme == "light" ? theme.extend.colors.primary.DEFAULT : theme.extend.colors.primary.DEFAULT} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                            <Path d="M18.6667 12.1501C18.6667 15.8335 16.1667 18.8168 12 18.8168C7.83334 18.8168 5.33334 15.8335 5.33334 12.1501" stroke={colorScheme == "light" ? theme.extend.colors.primary.DEFAULT : theme.extend.colors.primary.DEFAULT} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        </Svg>
                                        <Text className="font-jakarta-medium text-[16px] text-primary dark:text-primary">{t("Retirer")}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    }
                    <View className="mt-6 flex-1">
                        <View className="px-4">
                            <Text className="font-jakarta-bold text-[18px] text-dark dark:text-gray-100">{t("Historiques")}</Text>
                        </View>
                        <View className="flex-1">
                            <FlatList
                                refreshControl={
                                    <RefreshControl
                                        refreshing={!!query.data && query.isFetching}
                                        onRefresh={query.refetch}
                                    />
                                }
                                className="flex-1 "
                                data={query.isLoading ? Array.from(new Array(6)) : (query.isSuccess ? query.data.payments : [])}
                                renderItem={({ item, index }) => {
                                    if (query.isLoading) {
                                        return (<View key={index} className="p-4">
                                            <PaymentLoaderItem />
                                        </View>)
                                    } else if (item) {
                                        return (
                                            <PaymentItem onShowPayment={(x) => setPayment(x)} payment={item} key={index} />
                                        )
                                    }
                                    return <></>
                                }}
                                ListEmptyComponent={
                                    query.isSuccess ? (
                                        <View className="">
                                            <Text className="text-center font-jakarta text-dark dark:text-gray-200">{t("Aucun Paiement enrégistrer")}</Text>
                                        </View>
                                    ) : <></>
                                }
                            />


                        </View>
                    </View>
                </View>
            </View>
            <BasicModal
                show={!!payment}
                onClose={() => setPayment(null)}
            >
                {
                    payment ? (
                        <PaymentDetails payment={payment} />
                    ) : <></>
                }

            </BasicModal>
        </BottomSheetModalProvider>

    )
}
interface IPaymentItem {
    payment: IPayment,

}
export function PaymentItem({
    payment,
    onShowPayment
}: IPaymentItem & { onShowPayment: (x: IPayment) => void }) {
    const status = {
        "created": "warning",
        pending: "warning",
        failed: "danger",
        success: "success"
    }
    return (
        <TouchableOpacity onPress={() => onShowPayment(payment)} className="p-4 flex-row items-center">
            <View className="flex-1 flex-row items-center gap-x-4">
                <View className=" justify-center items-center w-[40px] h-[40px] rounded-full bg-primary/20 dark:bg-primary/20">
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: [{ rotate: '-130deg' }] }} >
                        <Path d="M9.76667 11.7334L11.9 13.8667L14.0333 11.7334" stroke={theme.extend.colors.primary.DEFAULT} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M11.9 5.33325V13.8083" stroke={theme.extend.colors.primary.DEFAULT} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M18.6667 12.1501C18.6667 15.8335 16.1667 18.8168 12 18.8168C7.83333 18.8168 5.33333 15.8335 5.33333 12.1501" stroke={theme.extend.colors.primary.DEFAULT} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>

                </View>
                <View className="">
                    <Text className="font-jakarta-bold text-[20px] text-dark dark:text-gray-100">{fnPart(Decimal(payment.askAmount).toNumber(), country).main}f</Text>
                    <Text className="text-[14px] font-jakarta text-dark-400 dark:text-dark-400">{format(payment.createdAt, "dd-MM-yyyy HH:mm")}</Text>
                </View>
            </View>
            <View>
                <StatusLabel contained color={status[payment.status.toLowerCase() as keyof typeof status] as any} />
            </View>
        </TouchableOpacity>
    )
}

function PaymentLoaderItem() {
    return (
        <View className="flex-row items-center gap-x-4">
            <View className=" rounded-full w-[40px] h-[40px] bg-gray-300 dark:bg-dark-400"></View>
            <View className="gap-y-2 flex-1">
                <View className="w-4/12 h-[15px] rounded-full bg-gray-200 dark:bg-dark-300"></View>
                <View className="w-6/12 h-[15px] rounded-full bg-gray-200 dark:bg-dark-400"></View>
            </View>
        </View>
    )
}

function PaymentDetails({ payment }: IPaymentItem) {
    const status = {
        "created": {
            status: "warning",
            text: t("Paiement en attente")
        },
        pending: {
            status: "warning",
            text: t("Paiement en attente")
        },
        failed: {
            status: "danger",
            text: t("Paiement échoué")
        },
        success: {
            status: "success",
            text: t("Paiement éffectué")
        },
    }
    const statusData = status[payment.status.toLowerCase() as keyof typeof status]
    const { colorScheme } = useColorScheme()
    const data = [
        {
            icon: (
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <Path d="M5.33301 1.3335V3.3335" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M10.667 1.3335V3.3335" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M10.6667 2.3335C12.8867 2.4535 14 3.30016 14 6.4335V10.5535C14 13.3002 13.3333 14.6735 10 14.6735H6C2.66667 14.6735 2 13.3002 2 10.5535V6.4335C2 3.30016 3.11333 2.46016 5.33333 2.3335H10.6667Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M13.8337 11.7334H2.16699" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M7.99967 5.5C7.17967 5.5 6.48634 5.94667 6.48634 6.81333C6.48634 7.22667 6.67967 7.54 6.97301 7.74C6.56634 7.98 6.33301 8.36667 6.33301 8.82C6.33301 9.64667 6.96634 10.16 7.99967 10.16C9.02634 10.16 9.66634 9.64667 9.66634 8.82C9.66634 8.36667 9.43301 7.97333 9.01967 7.74C9.31967 7.53333 9.50634 7.22667 9.50634 6.81333C9.50634 5.94667 8.81967 5.5 7.99967 5.5ZM7.99967 7.39333C7.65301 7.39333 7.39967 7.18667 7.39967 6.86C7.39967 6.52667 7.65301 6.33333 7.99967 6.33333C8.34634 6.33333 8.59967 6.52667 8.59967 6.86C8.59967 7.18667 8.34634 7.39333 7.99967 7.39333ZM7.99967 9.33333C7.55967 9.33333 7.23967 9.11333 7.23967 8.71333C7.23967 8.31333 7.55967 8.1 7.99967 8.1C8.43967 8.1 8.75967 8.32 8.75967 8.71333C8.75967 9.11333 8.43967 9.33333 7.99967 9.33333Z" fill={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} />
                </Svg>
            ),

            iconLabel: "Créé le",
            description: (<Text className="font-jakarta-bold text-dark text-[16px] dark:text-gray-100">{format(payment.createdAt, "dd MMM yyyy", {
                locale: fr
            })}</Text>)
        },
        {
            icon: (
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <Path d="M5.33301 1.3335V3.3335" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M10.667 1.3335V3.3335" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M2.33301 6.06006H13.6663" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M14.6663 12.6667C14.6663 13.1667 14.5263 13.64 14.2797 14.04C13.8197 14.8133 12.973 15.3333 11.9997 15.3333C11.3263 15.3333 10.713 15.0867 10.2463 14.6667C10.0397 14.4933 9.85968 14.28 9.71968 14.04C9.47301 13.64 9.33301 13.1667 9.33301 12.6667C9.33301 11.1933 10.5263 10 11.9997 10C12.7997 10 13.513 10.3533 13.9997 10.9067C14.413 11.38 14.6663 11.9933 14.6663 12.6667Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M10.96 12.6665L11.62 13.3265L13.04 12.0132" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M14 5.66683V10.9068C13.5133 10.3535 12.8 10.0002 12 10.0002C10.5267 10.0002 9.33333 11.1935 9.33333 12.6668C9.33333 13.1668 9.47333 13.6402 9.72 14.0402C9.86 14.2802 10.04 14.4935 10.2467 14.6668H5.33333C3 14.6668 2 13.3335 2 11.3335V5.66683C2 3.66683 3 2.3335 5.33333 2.3335H10.6667C13 2.3335 14 3.66683 14 5.66683Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M7.99666 9.13363H8.00265" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} stroke-width="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M5.52987 9.13363H5.53585" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} stroke-width="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M5.5293 11.1333H5.53528" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} stroke-width="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>

            ),

            iconLabel: "Validé le",
            description: (<Text className="font-jakarta-bold text-dark text-[16px] dark:text-gray-100">{payment.paidAt ? format(payment.paidAt, "dd MMM yyyy", {
                locale: fr
            }) : "-"}</Text>)
        },
        {
            icon: (
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none" >
                    <Path d="M8.24634 1.43355L14.2463 3.83353C14.4797 3.92687 14.6663 4.20687 14.6663 4.45353V6.66689C14.6663 7.03356 14.3663 7.33356 13.9997 7.33356H1.99967C1.63301 7.33356 1.33301 7.03356 1.33301 6.66689V4.45353C1.33301 4.20687 1.51967 3.92687 1.75301 3.83353L7.75301 1.43355C7.88634 1.38022 8.11301 1.38022 8.24634 1.43355Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M14.6663 14.6667H1.33301V12.6667C1.33301 12.3 1.63301 12 1.99967 12H13.9997C14.3663 12 14.6663 12.3 14.6663 12.6667V14.6667Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M2.66699 12.0002V7.3335" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M5.33301 12.0002V7.3335" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M8 12.0002V7.3335" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M10.667 12.0002V7.3335" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M13.333 12.0002V7.3335" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M0.666992 14.6665H15.3337" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M8 5.6665C8.55227 5.6665 9 5.21879 9 4.6665C9 4.11422 8.55227 3.6665 8 3.6665C7.44773 3.6665 7 4.11422 7 4.6665C7 5.21879 7.44773 5.6665 8 5.6665Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>


            ),

            iconLabel: "Méthode de paiement",
            description: (<Text className="font-jakarta-bold text-dark text-[16px] dark:text-gray-100">{payment.paymentAccount.methodTitle}</Text>)
        },
        {
            icon: (
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none" >
                    <G clip-path="url(#clip0_1597_2204)">
                        <Path d="M12.027 9.03317C11.747 9.3065 11.587 9.69984 11.627 10.1198C11.687 10.8398 12.347 11.3665 13.067 11.3665H14.3337V12.1598C14.3337 13.5398 13.207 14.6665 11.827 14.6665H5.08699C5.29366 14.4932 5.47366 14.2798 5.61366 14.0398C5.86033 13.6398 6.00033 13.1665 6.00033 12.6665C6.00033 11.1932 4.80699 9.99984 3.33366 9.99984C2.70699 9.99984 2.12699 10.2198 1.66699 10.5865V7.67317C1.66699 6.29318 2.79366 5.1665 4.17366 5.1665H11.827C13.207 5.1665 14.3337 6.29318 14.3337 7.67317V8.63317H12.987C12.6137 8.63317 12.2737 8.77984 12.027 9.03317Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M1.66699 8.2734V5.22673C1.66699 4.4334 2.15366 3.72671 2.89366 3.44671L8.18699 1.44671C9.01366 1.13337 9.90033 1.74673 9.90033 2.63339V5.16672" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M15.0395 9.3133V10.6866C15.0395 11.0533 14.7462 11.3533 14.3729 11.3666H13.0662C12.3462 11.3666 11.6862 10.84 11.6262 10.12C11.5862 9.69997 11.7462 9.30663 12.0262 9.0333C12.2729 8.77997 12.6129 8.6333 12.9862 8.6333H14.3729C14.7462 8.64663 15.0395 8.94663 15.0395 9.3133Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M4.66699 8H9.33366" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M6.00033 12.6667C6.00033 13.1667 5.86033 13.64 5.61366 14.04C5.47366 14.28 5.29366 14.4933 5.08699 14.6667C4.62033 15.0867 4.00699 15.3333 3.33366 15.3333C2.36033 15.3333 1.51366 14.8133 1.05366 14.04C0.806992 13.64 0.666992 13.1667 0.666992 12.6667C0.666992 11.8267 1.05366 11.0733 1.66699 10.5867C2.12699 10.22 2.70699 10 3.33366 10C4.80699 10 6.00033 11.1933 6.00033 12.6667Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M4.32748 12.6528H2.34082" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M3.33301 11.6797V13.673" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </G>
                    <Defs>
                        <ClipPath id="clip0_1597_2204">
                            <Rect width="16" height="16" fill="white" />
                        </ClipPath>
                    </Defs>
                </Svg>

            ),

            iconLabel: "Envoyer à",
            description: (<Text className="font-jakarta-bold text-dark text-[16px] dark:text-gray-100">{payment.recevingAdress}</Text>)
        },
        {
            icon: (
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <Path d="M12.3337 8.43311V10.8998C12.3337 12.9798 10.3937 14.6664 8.00033 14.6664C5.60699 14.6664 3.66699 12.9798 3.66699 10.8998V8.43311C3.66699 10.5131 5.60699 11.9998 8.00033 11.9998C10.3937 11.9998 12.3337 10.5131 12.3337 8.43311Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12.3337 5.10016C12.3337 5.70683 12.167 6.26683 11.8737 6.74683C11.1603 7.92016 9.69366 8.66683 8.00033 8.66683C6.30699 8.66683 4.84033 7.92016 4.12699 6.74683C3.83366 6.26683 3.66699 5.70683 3.66699 5.10016C3.66699 4.06016 4.15365 3.12016 4.93365 2.44016C5.72032 1.7535 6.80033 1.3335 8.00033 1.3335C9.20033 1.3335 10.2803 1.7535 11.067 2.4335C11.847 3.12016 12.3337 4.06016 12.3337 5.10016Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12.3337 5.10016V8.4335C12.3337 10.5135 10.3937 12.0002 8.00033 12.0002C5.60699 12.0002 3.66699 10.5135 3.66699 8.4335V5.10016C3.66699 3.02016 5.60699 1.3335 8.00033 1.3335C9.20033 1.3335 10.2803 1.7535 11.067 2.4335C11.847 3.12016 12.3337 4.06016 12.3337 5.10016Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>

            ),

            iconLabel: "Frais de transfert",
            description: (<Text className="font-jakarta-bold text-dark text-[16px] dark:text-gray-100">{fnPart(payment.networkFees, country).main}f</Text>)
        },
        {
            icon: (
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <Path d="M12.3337 8.43311V10.8998C12.3337 12.9798 10.3937 14.6664 8.00033 14.6664C5.60699 14.6664 3.66699 12.9798 3.66699 10.8998V8.43311C3.66699 10.5131 5.60699 11.9998 8.00033 11.9998C10.3937 11.9998 12.3337 10.5131 12.3337 8.43311Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12.3337 5.10016C12.3337 5.70683 12.167 6.26683 11.8737 6.74683C11.1603 7.92016 9.69366 8.66683 8.00033 8.66683C6.30699 8.66683 4.84033 7.92016 4.12699 6.74683C3.83366 6.26683 3.66699 5.70683 3.66699 5.10016C3.66699 4.06016 4.15365 3.12016 4.93365 2.44016C5.72032 1.7535 6.80033 1.3335 8.00033 1.3335C9.20033 1.3335 10.2803 1.7535 11.067 2.4335C11.847 3.12016 12.3337 4.06016 12.3337 5.10016Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12.3337 5.10016V8.4335C12.3337 10.5135 10.3937 12.0002 8.00033 12.0002C5.60699 12.0002 3.66699 10.5135 3.66699 8.4335V5.10016C3.66699 3.02016 5.60699 1.3335 8.00033 1.3335C9.20033 1.3335 10.2803 1.7535 11.067 2.4335C11.847 3.12016 12.3337 4.06016 12.3337 5.10016Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>

            ),

            iconLabel: "Frais de service",
            description: (<Text className="font-jakarta-bold text-dark text-[16px] dark:text-gray-100">{fnPart(payment.serviceFees, country).main}f</Text>)
        },
        {
            icon: (
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <Path d="M12.3337 8.43311V10.8998C12.3337 12.9798 10.3937 14.6664 8.00033 14.6664C5.60699 14.6664 3.66699 12.9798 3.66699 10.8998V8.43311C3.66699 10.5131 5.60699 11.9998 8.00033 11.9998C10.3937 11.9998 12.3337 10.5131 12.3337 8.43311Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12.3337 5.10016C12.3337 5.70683 12.167 6.26683 11.8737 6.74683C11.1603 7.92016 9.69366 8.66683 8.00033 8.66683C6.30699 8.66683 4.84033 7.92016 4.12699 6.74683C3.83366 6.26683 3.66699 5.70683 3.66699 5.10016C3.66699 4.06016 4.15365 3.12016 4.93365 2.44016C5.72032 1.7535 6.80033 1.3335 8.00033 1.3335C9.20033 1.3335 10.2803 1.7535 11.067 2.4335C11.847 3.12016 12.3337 4.06016 12.3337 5.10016Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12.3337 5.10016V8.4335C12.3337 10.5135 10.3937 12.0002 8.00033 12.0002C5.60699 12.0002 3.66699 10.5135 3.66699 8.4335V5.10016C3.66699 3.02016 5.60699 1.3335 8.00033 1.3335C9.20033 1.3335 10.2803 1.7535 11.067 2.4335C11.847 3.12016 12.3337 4.06016 12.3337 5.10016Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray[200] : theme.extend.colors.dark[400]} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>

            ),

            iconLabel: "Total à envoyer",
            description: (<Text className="font-jakarta-bold text-dark text-[16px] dark:text-gray-100">{fnPart(payment.sentAmount, country).main}f</Text>)
        }


    ]
    return (
        <View>
            <View>
                <View className="flex-row justify-center">
                    <View className=" justify-center items-center bg-primary w-[70px] rounded-full h-[70px]">
                        <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ transform: [{ rotate: '-130deg' }] }} >
                            <Path d="M9.76667 11.7334L11.9 13.8667L14.0333 11.7334" strokeWidth={"1.5"} stroke={"#fff"} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                            <Path d="M11.9 5.33325V13.8083" stroke={"#fff"} strokeWidth={"1.5"} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                            <Path d="M18.6667 12.1501C18.6667 15.8335 16.1667 18.8168 12 18.8168C7.83333 18.8168 5.33333 15.8335 5.33333 12.1501" strokeWidth={"1.5"} stroke={"#fff"} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                    </View>
                </View>
                <Text className="mt-2 text-center font-jakarta-semibold text-primary dark:text-primary text-[18px]">{t("Retrait")}</Text>
                <Text className="mt-2 text-center font-jakarta-bold text-dark dark:text-white text-[25px]">-{fnPart(payment.askAmount, country).main}<Text className="font-jakarta-semibold text-[12px] text-dark-400 dark:text-gray-100"> F</Text></Text>
                <View className="mt-2">
                    <View className="flex-row items-center justify-center gap-x-4">
                        <Text>{t("Créé le {{date}}", {
                            date: format(payment.createdAt, "dd MMM yyyy", {
                                locale: fr
                            })
                        })}</Text>
                        <View className="w-[3px] h-[3px] rounded-full bg-dark-300 dark:bg-gray"></View>
                        <StatusLabel color={statusData.status as any} title={statusData.text} />
                    </View>
                </View>
            </View>
            <View className="px-4 my-6 ">
                <View className=" rounded-[20px] overflow-hidden bg-gray-100 dark:bg-dark-lighter-2">
                    {
                        data.map(d => (

                            <View className="flex-row items-center p-4 ">
                                <View className="flex-row itens-center gap-x-4 flex-1">
                                    {d.icon}
                                    <Text className="font-jakarta-medium text-[14px] text-dark dark:text-gray-100">{d.iconLabel}</Text>
                                </View>
                                <View>
                                    {d.description}
                                </View>
                            </View>


                        ))
                    }
                </View>
            </View>
        </View>
    )
}