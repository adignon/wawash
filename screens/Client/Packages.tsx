import { getPackages } from "@/api/subscription";
import { BasicModal } from "@/components/Modal";
import { ErrorRetry } from "@/components/State";
import { Text } from "@/components/Themed";
import { clx, formatPrice } from "@/helpler";
import { country } from "@/storage/config";
import { PACKAGES } from "@/storage/PackagesConfig";
import { useStore } from "@/store/store";
import { IPackage } from "@/store/type";
import { theme } from "@/tailwind.config";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { t } from "i18next";
import { useColorScheme } from "nativewind";
import React, { useMemo } from "react";
import { Pressable, RefreshControl, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { PackageDetails } from "./PackageDetail";

export function Packages({ filterPackage, showActive = true, allowSubscriptionCancel = false, onPackageSelect }: { allowSubscriptionCancel?: boolean, filterPackage?: (x: IPackage[]) => IPackage[], showActive?: boolean, onPackageSelect?: () => void }) {
    const { top, bottom } = useSafeAreaInsets()
    const user = useStore(s => s.user)
    const packages = useQuery({
        queryFn: () => getPackages(),
        queryKey: ['packagess'],
        enabled: showActive
    })
    
    const activeSubscription = useMemo(() => {
        if(packages.data?.subscription ){
            return packages.data?.subscription
        }else if (packages.data?.subscription && user?.activeSubscription?.id && new Date(user.activeSubscription.endAt) > new Date() && user.activeSubscription.isPaid) {
            return user?.activeSubscription
        } 
    }, [user, packages.data])
    const data = useMemo(() => {
        const data = !!(packages.data?.packages) ? packages.data.packages.sort((a: any, b: any) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" })) : []
        return filterPackage ? filterPackage(data as any) : data
    }, [packages.data])

    if (showActive && activeSubscription) {
        return (
            <PackageDetails activeSubscription={activeSubscription}
                subscriptionRefreshProps={<RefreshControl refreshing={packages.data && packages.isFetching} onRefresh={packages.refetch} />}
            />
        )
    }
    return (
        <View className="flex-1">

            <View className=" bg-primary-500 px-4 pb-14" style={{ paddingTop: top + 20 }}>
               
                <View className="py-4 gap-y-2">
                    <Text className="text-[25px] font-jakarta-bold text-white dark:text-white">{t("Nos souscriptions")}</Text>
                    <Text className="font-jakarta-medium text-[14px] text-white">{t("Selectionner un plan de souscriptions pour continuer")}</Text>
                </View>
            </View>

            <View className="flex-1 -mt-[30px] flex-1 rounded-t-[30px] bg-white dark:bg-dark-dark-bg">
                {
                    packages.isPending && (
                        <View className="gap-y-6 pt-[30px] px-6">
                            <View className="bg-gray-200 rounded-[20px] h-[200px] dark:bg-dark-lighter"></View>
                            <View className="bg-gray-200 rounded-[20px] h-[200px] dark:bg-dark-lighter"></View>
                            <View className="bg-gray-200 rounded-[20px] h-[200px] dark:bg-dark-lighter"></View>
                        </View>
                    )
                }
                {
                    (data?.length) ? (
                        <ScrollView style={{

                        }}
                            refreshControl={
                                <RefreshControl refreshing={packages.data && packages.isFetching} onRefresh={packages.refetch} />
                            }
                            className="pt-[30px] flex-1  ">
                            {
                                data.map((d: any, i: any) => (
                                    <View key={d.id} className={clx("px-6", i > 1 && "mt-10")}>
                                        <PackageCard allowSubscriptionCancel={allowSubscriptionCancel} onSelect={onPackageSelect} item={d} />
                                    </View>
                                ))
                            }
                            <View style={{ marginBottom: bottom + 120 }}></View>
                        </ScrollView>
                    ):<></>
                }
                {
                    packages.isError && (
                        <View className="flex-1 ">
                            <ErrorRetry retry={packages.refetch} />
                        </View>
                    )
                }
            </View>
        </View>
    )
}

interface IPackageCard {
    item: IPackage,
    onSelect?: (x: any) => void,
    allowSubscriptionCancel?: boolean
}
export const PackageCard = ({ item, onSelect, allowSubscriptionCancel }: IPackageCard) => {
    const { colorScheme } = useColorScheme()
    const handlePress = () => {

        router.push({
            pathname: "/nolayout/client/package-details",
            params: {
                ...item as any,
                ...item.meta,
                allowSubscriptionCancel
            }
        })
        onSelect?.(item)
    }
    if (item.code == "LESSIVE_CELIBATAIRE")
        return (
            <Pressable onPress={handlePress} className="relative">
                <LinearGradient className=""
                    colors={
                        colorScheme == "light" ?
                            [
                                '#009283',
                                '#00655A',
                                '#003F39',
                                '#002C28'
                            ]
                            :

                            [
                                '#012B36', // deep teal
                                '#024450', // dark cyan
                                '#036370', // medium teal
                                '#048094', // brighter accent (keeps identity)
                            ]
                    }
                    locations={[0, 0.40, 0.40, 1]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 0.9, y: 0.9 }}
                    style={{
                        borderRadius: 20,
                        height: 200
                    }}
                >
                    <Badge title={t("CELIBATAIRE")} />
                    <View className="flex-row  flex-1">
                        <View className="w-6/12">

                        </View>
                        <View className="w-6/12  justify-center">
                            <View className="-ml-5">
                                <PriceDetails item={item} />
                            </View>
                        </View>
                    </View>
                    <NextButton
                        className="bg-primary/20 dark:bg-primary-400/20"
                        color={colorScheme === "light" ? theme.extend.colors.primary.DEFAULT : theme.extend.colors.gray[200]}
                    />
                </LinearGradient>
                <Image
                    className=" "
                    style={{
                        height: 213,
                        width: 128,
                        position: "absolute",
                        left: "5%",
                        bottom: 0
                    }}
                    source={PACKAGES.LESSIVE_CELIBATAIRE.image}
                />
            </Pressable>

        )
    else if (item.code == "LESSIVE_COUPLE")
        return (
            <Pressable onPress={handlePress} className="relative">
                <LinearGradient className=""
                    colors={
                        colorScheme == "light" ?
                            [
                                '#2B4900',
                                '#41660D',
                                '#476F10',
                                '#58841A',
                                '#84BC36',
                                '#79CF00',

                            ]
                            :
                            [
                                "#0D1F0A", // Very dark green-black
                                "#1B2E12", // Deep forest green
                                "#24461A", // Moss Green
                                "#3A5F28", // Muted Olive
                                "#5B913F", // Balanced Accent
                                "#84BC36", // Vibrant highlight
                            ]
                    }
                    locations={[0, 0.59, 0.59, 0.59, 0.59, 1]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 0.8, y: 1.1 }}
                    style={{
                        borderRadius: 20,
                        height: 200
                    }}
                >
                    <Badge title={t("COUPLE")} />
                    <View className="flex-row  flex-1">
                        <View className="w-6/12 justify-center  ">
                            <View className="" style={{
                                paddingLeft: "15%"
                            }}>
                                <PriceDetails item={item} />
                            </View>
                        </View>
                        <View className="w-6/12  justify-center">

                        </View>
                    </View>

                </LinearGradient>
                <Image
                    className=" "
                    style={{
                        height: 167,
                        width: 200,
                        position: "absolute",
                        right: "2%",
                        bottom: 0,
                        zIndex: 10
                    }}
                    source={PACKAGES.LESSIVE_COUPLE.image}
                />
                <NextButton
                    className="bg-[#2E4D02] dark:bg-[#1A2C01]"
                    color={"#83BD31"}
                />
            </Pressable>

        )
    else if (item.code == "LESSIVE_FAMILLE")
        return (
            <Pressable onPress={handlePress} className="relative">
                <LinearGradient className=""
                    colors={
                        colorScheme == "light" ?
                            [
                                '#FF8934',
                                '#C1631F',
                                '#873F0B',
                                '#682B00',

                            ]
                            :
                            [
                                '#FF7A1F', // slightly darker orange accent
                                '#A74F17', // deeper burnt orange
                                '#6B2E05', // dark reddish brown
                                '#3A1600', // almost black-brown
                            ]
                    }
                    locations={[0, 0.55, 0.55, 1]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 0.8, y: 1.1 }}
                    style={{
                        borderRadius: 20,
                        height: 200
                    }}
                >
                    <Badge title={t("FAMILLE")} />
                    <View className="flex-row  flex-1">
                        <View className="w-6/12 justify-center  ">

                        </View>
                        <View className="w-6/12  justify-center">
                            <View className="" style={{
                                paddingLeft: "15%"
                            }}>
                                <PriceDetails item={item} />
                            </View>
                        </View>
                    </View>
                    <NextButton
                        className="bg-[#C56520]/50"
                        color={"#FC9144"}
                    />
                </LinearGradient>
                <Image
                    className=" "
                    style={{
                        height: 192,
                        width: 219,
                        position: "absolute",
                        left: "2%",
                        bottom: 0
                    }}
                    source={PACKAGES.LESSIVE_FAMILLE.image}
                />
            </Pressable>
        )
}

const Badge = ({ title }: { title: string }) => {
    return (
        <View className="px-2 py-1 rounded-full absolute right-3 top-3 bg-white dark:bg-dark-lighter">
            <Text className="font-jakarta-medium text-[12px] uppercase text-primary">{title}</Text>
        </View>
    )
}

const PriceDetails = ({ item }: { item: IPackage }) => {
    return (
        <View className="">
            <Text className="font-jakarta-medium text-[10px] text-white dark:text-white">{t("Jusqu'à ")}</Text>
            <Text className="font-jakarta-bold text-[40px] text-white dark:text-gray-100">{t("{{ k }}Kg", {
                k: Number(item.kg)
            })}</Text>
            <Text className="font-jakarta-semibold text-[25px] text-white dark:text-white">{t("{{ amount }} f", {
                amount: formatPrice(item.amount, country.currency).replace(/[a-z]/ig, '')
            })}<Text className="font-jakarta text-[12px] text-white dark:text-white">{t("/sem")}</Text></Text>
        </View>
    )
}
interface INextButton {
    color: string,
    className: string
}
const NextButton = ({ className, color }: INextButton) => {
    return (
        <View style={{ zIndex: 10 }} className={clx(" absolute bottom-3 right-3 w-[30px] items-center justify-center h-[30px] rounded-full", className)} >
            <Svg width="7" height="12" viewBox="0 0 7 12" fill="none" >
                <Path d="M1 10.9L5.88998 6.82501C6.46748 6.34376 6.46748 5.55626 5.88998 5.07501L1 1" stroke={color} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>

        </View>
    )
}

interface IPackageModal {
    show: boolean,
    onClose: () => void
}

export function PackageModal({ onClose, show = true }: IPackageModal) {
    return (
        <BasicModal show={show} onClose={onClose}>
            <View className="gap-y-4 mt-4">
                <PackageModalItem onClick={() => {
                    onClose()
                    router.push('/nolayout/client/package-details?code=lessive_unique&title=Lessive unique&unique=true')
                }} title={t("Lavage unique")} description={t("Un seul lavage pour vos besoins ponctuels")} />
                <PackageModalItem onClick={() => {
                    onClose()
                    router.push("/client/packages")
                }} title={t("Abonnement")} description={t("Lavage régulier avec des avantages exclusifs.")} />
            </View>
        </BasicModal>
    )
}

const PackageModalItem = ({
    title,
    description,
    onClick
}: {
    title: string,
    description: string,
    onClick?: () => void
}) => {
    const { colorScheme } = useColorScheme()
    return (
        <TouchableOpacity onPress={onClick} className="flex-row items-center gap-x-4 p-4 rounded-[15px] border border-gray dark:border-dark-400 items-center">
            <View className="flex-1">
                <Text className="font-jakarta-semibold text-[16px] text-dark dark:text-white">{title}</Text>
                <Text className="font-jakarta text-[14px] text-dark-300 dark:text-gray-300">{description}</Text>
            </View>
            <View>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <Path d="M14.4302 5.92999L20.5002 12L14.4302 18.07" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M3.5 12H20.33" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            </View>
        </TouchableOpacity>
    )
}