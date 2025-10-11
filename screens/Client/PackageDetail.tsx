import { cancelActiveSubscription, getPackages } from "@/api/subscription";
import { Button } from "@/components/Button";
import { ErrorRetry } from "@/components/State";
import { Text } from "@/components/Themed";
import { clx, fnPart } from "@/helpler";
import { country } from "@/storage/config";
import { PACKAGES } from "@/storage/PackagesConfig";
import { useStore } from "@/store/store";
import { ICommand, IPackage } from "@/store/type";
import { theme } from "@/tailwind.config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Decimal } from 'decimal.js';
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";
import { t } from "i18next";
import { useColorScheme } from "nativewind";
import React, { useMemo } from "react";
import { Alert, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line, Path } from "react-native-svg";
import Toast from "react-native-toast-message";
import { Packages } from "./Packages";

export function PackageDetails({ activeSubscription, subscriptionRefreshProps }: { activeSubscription?: ICommand, subscriptionRefreshProps?: any }) {
    const request: any = useLocalSearchParams()
    const query = useQuery({
        queryKey: ["package-" + request.code],
        queryFn: () => getPackages({ type: request.code }),
        enabled: request.unique == "true"
    })
    const { setUser, user } = useStore(s => s)
    const router = useRouter()
    const params = useMemo(() => {
        if (activeSubscription && !request.cancelsubscription && !request.unique) {
            return activeSubscription.package
        } else if (request.unique) {
            return query.isSuccess ? { ...request, ...(query.data ? { ...query.data.packages, ...query.data.packages?.meta } : {}) } : request
        } else if (request && Object.values(request).length) {
            return request
        }
    }, [request, activeSubscription])
    const { top, bottom } = useSafeAreaInsets()
    const { colorScheme } = useColorScheme()
    const prices = useMemo(() => {
        if (params?.id && params.amount) {
            return fnPart(Number(params.amount), country)
        }
    }, [params?.id])
    const advantages = [
        ...(
            !params.unique ? [{
                icon: (
                    <Svg width="30" height="30" viewBox="0 0 30 30" fill="none" >
                        <Path d="M11.5703 29.4563L10.048 29.3649C8.8274 29.255 5.96486 28.8092 5.44578 27.4661L5.43325 27.4325C5.3253 27.1549 5.42701 26.8486 5.44222 26.5636L5.45384 25.67C5.45767 25.3524 5.51292 24.9649 5.55279 24.6438C5.68876 23.5488 5.90164 22.4684 6.25677 21.42C6.47861 20.7651 6.70879 20.3963 6.71013 19.6943L6.70531 16.7352L6.4907 13.7916C6.19741 14.1542 5.20786 15.5266 4.77551 15.581C4.45223 15.6216 4.18945 15.4103 3.92378 15.2598L2.21255 14.1772C1.57523 13.7314 0.559278 12.8932 0.216714 12.1923C-0.191447 11.3571 0.0194102 10.8208 0.496249 10.1397L3.11971 6.40204C3.94753 5.30599 4.85028 4.3981 6.27562 4.16178L8.23316 3.90051C8.57422 3.84064 8.66902 3.82487 8.79962 3.54464L9.74607 1.79622C9.8539 1.60626 9.94606 1.40104 10.0755 1.22419L10.1866 1.08028C10.7251 0.487589 11.379 0.523634 12.1103 0.556372L13.0294 0.57817C13.3021 0.5916 13.5705 0.62967 13.8444 0.632512L16.2623 0.628619L18.4536 0.505689C19.3661 0.438113 19.8029 0.981449 20.1802 1.66099L21.1012 3.33623C21.1681 3.46616 21.2394 3.57524 21.276 3.71985L21.2807 3.73947C21.553 3.83659 21.8176 3.88272 22.1003 3.93535L23.4172 4.12375C25.6395 4.39592 26.4107 5.73243 27.6242 7.40747L29.6526 10.3551C30.0449 10.9741 30.1445 11.6386 29.7447 12.3056C29.241 13.1458 27.9209 14.1362 27.0979 14.6713L25.9862 15.3336C25.0142 15.862 24.8851 15.4021 24.2332 14.657C23.9876 14.3762 23.7157 14.0872 23.5136 13.7748L23.4998 13.7531C23.4681 13.8507 23.4709 13.9756 23.4666 14.0774L23.3666 15.6978C23.351 15.8867 23.3185 16.0741 23.3111 16.2642L23.3075 19.575C23.3081 19.846 23.3168 20.1338 23.4087 20.3934L23.5697 20.9132C23.8053 21.4922 23.9998 22.1409 24.1375 22.7468L24.3755 23.9502C24.4564 24.4716 24.512 25.023 24.5433 25.5509L24.5757 26.4712C24.5951 26.7788 24.7176 27.1549 24.5948 27.4518L24.5864 27.4716C24.0791 28.6864 21.5002 29.2091 20.3407 29.3353L17.5525 29.4997L13.092 29.5C12.9309 29.4975 12.7739 29.4735 12.6137 29.4668L11.5703 29.4563ZM11.3259 1.63008C11.8526 2.45626 11.5214 2.34551 12.3725 2.51967C13.2035 2.6897 13.8123 2.75241 14.6522 2.75681L15.92 2.74497C16.4041 2.71866 18.1039 2.54283 18.2514 2.32297L18.2671 2.29802C18.3993 2.09148 18.4872 1.81697 18.6334 1.62887L11.3259 1.63008ZM10.5639 2.53088L9.75982 4.07443C9.92693 4.45583 10.0452 4.85607 10.1886 5.246L10.6245 6.34567C10.9834 7.23689 11.238 7.48202 12.2564 7.16321C12.4288 7.10922 12.6095 7.02611 12.7675 6.93957C13.2044 6.71664 13.5665 6.42516 13.977 6.1647C13.7548 6.00662 13.5041 5.89354 13.2777 5.7369C12.2609 5.03311 11.3921 4.08552 10.8149 2.99753L10.603 2.5698C10.5912 2.5482 10.588 2.53462 10.5639 2.53088ZM19.3791 2.51289C18.5837 4.10164 17.6636 5.37531 15.986 6.17568C16.3575 6.48433 16.8298 6.75413 17.2678 6.95986C18.5718 7.54726 18.678 7.4007 19.3139 6.1997L20.2661 4.09483L19.723 3.09558C19.6131 2.89535 19.5167 2.69702 19.3791 2.51289ZM12.5841 3.66975C13.4258 4.53882 14.1064 4.86098 15.004 5.52327C15.5099 5.18383 16.0934 4.88453 16.5401 4.47109L17.363 3.70689L16.0671 3.88034C15.5462 3.92429 14.03 3.93414 13.5759 3.85033L12.5841 3.66975ZM21.1904 4.86043L20.1303 7.01715C19.4019 8.36767 18.7889 8.67881 17.3193 8.15245C16.6522 7.91352 16.1057 7.61946 15.5435 7.18684L15.5339 28.3652L17.6789 28.3558C17.9067 28.3461 18.1319 28.301 18.3601 28.2911L19.1441 28.2753C20.4212 28.2157 22.5289 28.0297 23.4267 27.1713L23.524 27.0632L23.4719 26.2614C23.455 24.9475 23.2868 23.6379 22.9035 22.3751C22.5947 21.3583 22.2184 20.6963 22.2162 19.6124L22.22 15.9656C22.2503 15.0896 22.3529 14.0191 22.4926 13.1675C22.535 12.9087 22.5473 12.6422 22.6229 12.3893C22.7406 11.9954 23.2338 11.6721 23.5704 12.0285C23.6982 12.1639 23.7971 12.3392 23.9143 12.4855C24.4164 13.1126 24.8893 13.7776 25.4568 14.3495C26.5002 13.8084 27.491 13.1061 28.3251 12.2857C29.3156 11.3115 28.7425 11.0054 28.1234 10.0775L26.716 8.05844C26.3322 7.50922 25.9547 6.97072 25.5129 6.4637C23.9955 4.72209 23.0224 5.45103 21.1904 4.86043ZM8.85024 4.88593L7.60924 5.11295C5.25741 5.42611 5.07789 5.53943 3.61113 7.6058L1.65387 10.4242C1.42369 10.7523 1.0844 11.0854 1.15296 11.5132L1.15802 11.546C1.27084 12.1887 3.00247 13.3949 3.55712 13.7641L4.57078 14.3542C5.14202 13.7959 5.59329 13.1044 6.09159 12.4833C6.3648 12.1427 6.70555 11.5533 7.20064 12.059C7.3544 12.2161 7.39392 12.4687 7.43296 12.6741L7.70435 14.7778L7.79165 16.4252L7.79836 19.8947C7.79678 20.2506 7.73249 20.5837 7.61027 20.9216C6.90645 22.8682 6.61715 24.2348 6.5301 26.2737L6.52804 26.7498C6.50639 27.1495 6.48612 27.1126 6.81461 27.3498C7.66037 27.9605 8.81831 28.1029 9.83355 28.1914L12.4823 28.3549L14.1978 28.3655C14.2937 28.3676 14.4001 28.3858 14.494 28.374L14.4657 7.15928C13.8931 7.76369 12.6589 8.25019 11.8516 8.38733C10.6385 8.5934 10.0358 7.76225 9.63202 6.82252L8.91366 4.94389C8.89434 4.89305 8.90323 4.89784 8.85024 4.88593Z" fill={theme.extend.colors.primary.DEFAULT} />
                    </Svg>

                ),
                title: t("Capacité généreuse"),
                description: (data: {
                    kg: number
                    nombreDeJoursDeVetementMax?: number;
                    nombreDeJoursDeVetementMin?: number;
                    nombreDePersonnesMax?: number;
                    nombreDePersonnesMin?: number;
                }) => {
                    const {
                        kg,
                        nombreDeJoursDeVetementMax,
                        nombreDeJoursDeVetementMin,
                        nombreDePersonnesMax,
                        nombreDePersonnesMin,
                    } = data;

                    let phrase = "Jusqu'à " + kg + "kg de linge";

                    const jours =
                        nombreDeJoursDeVetementMin && nombreDeJoursDeVetementMax
                            ? `${nombreDeJoursDeVetementMin} à ${nombreDeJoursDeVetementMax} jours`
                            : nombreDeJoursDeVetementMax
                                ? `${nombreDeJoursDeVetementMax} jours`
                                : null;

                    const personnes =
                        nombreDePersonnesMin && nombreDePersonnesMax
                            ? `${nombreDePersonnesMin} à ${nombreDePersonnesMax} personnes`
                            : nombreDePersonnesMax
                                ? `${nombreDePersonnesMax} personnes`
                                : null;

                    if (jours || personnes) {
                        phrase += ", soit l'équivalent de";
                        if (jours) phrase += ` ${jours} de tenues complètes`;
                        phrase += " chaque semaine"
                        if (personnes) phrase += ` pour ${personnes}`;
                    }

                    return phrase + ".";
                }
            }] : []
        ),
        {
            icon: (
                <Svg width="30" height="30" viewBox="0 0 30 30" fill="none" >
                    <Path d="M18.75 2.5V15C18.75 16.375 17.625 17.5 16.25 17.5H2.5V9.52499C3.4125 10.6125 4.81253 11.2875 6.36253 11.25C7.62503 11.225 8.7625 10.7375 9.6125 9.925C10 9.6 10.325 9.18749 10.575 8.73749C11.025 7.97499 11.275 7.07497 11.25 6.13747C11.2125 4.67497 10.5625 3.3875 9.55002 2.5H18.75Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M27.5 17.5V21.25C27.5 23.325 25.825 25 23.75 25H22.5C22.5 23.625 21.375 22.5 20 22.5C18.625 22.5 17.5 23.625 17.5 25H12.5C12.5 23.625 11.375 22.5 10 22.5C8.625 22.5 7.5 23.625 7.5 25H6.25C4.175 25 2.5 23.325 2.5 21.25V17.5H16.25C17.625 17.5 18.75 16.375 18.75 15V6.25H21.05C21.95 6.25 22.775 6.73751 23.225 7.51251L25.3625 11.25H23.75C23.0625 11.25 22.5 11.8125 22.5 12.5V16.25C22.5 16.9375 23.0625 17.5 23.75 17.5H27.5Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M10 27.5C11.3807 27.5 12.5 26.3807 12.5 25C12.5 23.6193 11.3807 22.5 10 22.5C8.61929 22.5 7.5 23.6193 7.5 25C7.5 26.3807 8.61929 27.5 10 27.5Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M20 27.5C21.3807 27.5 22.5 26.3807 22.5 25C22.5 23.6193 21.3807 22.5 20 22.5C18.6193 22.5 17.5 23.6193 17.5 25C17.5 26.3807 18.6193 27.5 20 27.5Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M27.5 15V17.5H23.75C23.0625 17.5 22.5 16.9375 22.5 16.25V12.5C22.5 11.8125 23.0625 11.25 23.75 11.25H25.3625L27.5 15Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M11.25 6.13749C11.275 7.07499 11.025 7.97501 10.575 8.73751C10.325 9.18751 9.99997 9.60003 9.61247 9.92503C8.76247 10.7375 7.625 11.225 6.3625 11.25C4.8125 11.2875 3.41247 10.6125 2.49997 9.52502C2.32497 9.33752 2.17498 9.12503 2.03748 8.91253C1.54998 8.17503 1.27497 7.30006 1.24997 6.36256C1.21247 4.78756 1.91246 3.35002 3.03746 2.41252C3.88746 1.71252 4.96244 1.27502 6.13744 1.25002C7.44994 1.22502 8.64999 1.70002 9.54999 2.50002C10.5625 3.38752 11.2125 4.67499 11.25 6.13749Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M4.30005 6.28754L5.56256 7.48749L8.17502 4.96246" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>


            ),
            title: t("Collecte et livraison gratuites"),
            description: "Nous venons chercher et livrons votre linge gratuitement."
        },
        {
            icon: (
                <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <Path d="M10.5 8.125H19.5C23.75 8.125 24.175 10.1125 24.4625 12.5375L25.5875 21.9125C25.95 24.9875 25 27.5 20.625 27.5H9.38753C5.00003 27.5 4.05003 24.9875 4.42503 21.9125L5.55004 12.5375C5.82504 10.1125 6.25003 8.125 10.5 8.125Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M10 10V5.625C10 3.75 11.25 2.5 13.125 2.5H16.875C18.75 2.5 20 3.75 20 5.625V10" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M25.5125 21.2875H10" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            ),
            title: t("Sacs plastiques inclus"),
            description: "Des sacs pratiques fournis pour faciliter le dépôt de votre linge."
        },
        {
            icon: (
                <Svg width="30" height="30" viewBox="0 0 30 30" fill="none" >
                    <Path d="M10 14.25C10 15.2125 10.75 16 11.6625 16H13.5375C14.3375 16 14.9875 15.3125 14.9875 14.475C14.9875 13.5625 14.5875 13.2375 14 13.025L11 11.975C10.4 11.7625 10 11.4375 10 10.525C10 9.6875 10.65 9 11.45 9H13.325C14.25 9.0125 15 9.7875 15 10.75" stroke="#06A8C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12.5 16.0625V16.9875" stroke="#06A8C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12.5 8.01251V8.98751" stroke="#06A8C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12.4875 22.475C18.0034 22.475 22.475 18.0034 22.475 12.4875C22.475 6.97156 18.0034 2.5 12.4875 2.5C6.97156 2.5 2.5 6.97156 2.5 12.4875C2.5 18.0034 6.97156 22.475 12.4875 22.475Z" stroke="#06A8C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M16.2251 24.85C17.3501 26.4375 19.1876 27.475 21.2876 27.475C24.7001 27.475 27.4751 24.7 27.4751 21.2875C27.4751 19.2125 26.4501 17.375 24.8876 16.25" stroke="#06A8C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>

            ),
            title: t("Aucun frais caché"),
            description: "Un prix fixe sans frais cachés pour une tranquillité d'esprit."
        }
    ]

    const cancelMutation = useMutation({
        mutationKey: ["cancel-active-" + activeSubscription?.id],
        mutationFn: cancelActiveSubscription
    })

    const handleCancel = async (authorized = false) => {
        try {
            if (!authorized) {
                return Alert.alert(t("Cloturer l'abonnement ?"), t("En cloturant l'abonnement vous ne pourrez plus profitez du reste de la période de votre abonnement qui sera définitivement annulé. Etes vous sur de vouloir continuer ?"), [
                    {
                        text: t("Non"),
                    },
                    {
                        text: t("Oui, continuer"),
                        onPress: () => {
                            handleCancel(true)
                        }
                    }
                ])
            }
            await cancelMutation.mutateAsync()
            setUser({
                ...user,
                activeSubscription: null
            } as any)
            Toast.show({
                type: "success",
                text2: t("Votre abonnement a été annulé avec succès !")
            })
            return
        } catch (e) {
            if (typeof e === "string") {
                Toast.show({
                    type: "error",
                    text2: e
                })
            } else {
                Toast.show({
                    type: "error",
                    text2: t("Une erreur innatendue est arrivée lors de l'annulation de votre abonnement.")
                })
            }

        }
    }

    const type = (params?.code ?? params.unique).toUpperCase()
    const packageDesign: any = PACKAGES[type as keyof typeof PACKAGES]
    const COLORS = {
        "LESSIVE_CELIBATAIRE": colorScheme == "light" ?
            [
                '#002C28',
                '#003F39',
                '#00655A',
                '#009283',
            ]
            :

            [
                '#012B36', // deep teal
                '#024450', // dark cyan
                '#036370', // medium teal
                '#048094', // brighter accent (keeps identity)
                /*
                '#048094', 
                '#036370', 
                '#024450', 
                '#012B36', 
                */
            ],
        "LESSIVE_COUPLE": colorScheme == "light" ?
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
            ],
        "LESSIVE_FAMILLE": colorScheme == "light" ?
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
            ],
        "LESSIVE_UNIQUE": colorScheme == "light" ?
            [
                '#7A6500',
                '#7A6500',
                '#CFB846',
                '#FFE460',

            ]
            :
            [
                '#4A3B00', // deep golden brown
                '#5C4A00', // dark warm amber
                '#8C7A1F', // muted antique gold
                '#BFAE38', // soft warm gold highlight
            ]
    }
    const [showPakages, setShowPackages] = React.useState(false)
    if (params) {
        return (
            <>

                <View className="flex-1">
                    <LinearGradient
                        colors={
                            COLORS[type as keyof typeof COLORS] as any
                        }
                        locations={(packageDesign as any).locations ?? [0, 0.40, 0.40, 1]}
                        start={{ x: 0, y: 0.8 }}
                        end={{ x: 1.3, y: 0.5 }}
                        style={{
                            height: 346 + top,
                            position: "relative",
                        }}
                    >
                        {!activeSubscription &&
                            <View className="absolute px-4 z-10" style={{ top: top + 5, left: 0, right: 0 }}>
                                <TouchableOpacity onPress={() => router.back()} className={clx("justify-center items-center w-[40px] h-[40px] rounded-full", packageDesign.button.className)}>
                                    <View className=" ">
                                        <Svg width="7" height="12" viewBox="0 0 7 12" fill="none" >
                                            <Path d="M6 1.09999L1.11002 5.17499C0.532523 5.65624 0.532523 6.44374 1.11002 6.92499L6 11" stroke={packageDesign.button.color} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        </Svg>

                                    </View>
                                </TouchableOpacity>
                            </View>
                        }
                        <Image
                            className=" "
                            style={{
                                height: packageDesign.heightImage ? packageDesign.heightImage : 301,
                                width: packageDesign.widthImage,
                                position: "absolute",
                                [packageDesign.reverse ? "left" : "right"]: packageDesign.imagePosition ?? "2%",
                                bottom: 0
                            }}
                            source={packageDesign.image}
                        />
                        <View className={clx("mb-[30px] flex-1  justify-end py-5 px-4  ", packageDesign.reverse ? "items-end" : '')}>
                            <View className="w-[200px]">
                                <Text className="font-jakarta-bold text-[35px] text-white">{params.name}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                    <View className="flex-1 -mt-[30px] flex-1 rounded-t-[30px] bg-white dark:bg-dark-dark-bg">
                        <View style={{
                        }}

                            className="pt-[30px] flex-1  ">
                            {
                                params.unique && !params.id ? (
                                    <>
                                        {
                                            query.isPending && (
                                                <LoadingState />
                                            )
                                        }
                                        {
                                            query.isError && (
                                                <ErrorRetry retry={query.refetch} />
                                            )
                                        }
                                    </>
                                ) : <View className="flex-1">
                                    <ScrollView contentContainerClassName="flex-1" className="px-6 flex-1" refreshControl={subscriptionRefreshProps}>
                                        <View
                                            style={{
                                                shadowColor: "#000000",
                                                shadowOffset: { width: 0, height: 0 },
                                                shadowOpacity: 0.1,
                                                shadowRadius: 20,
                                                elevation: 2
                                            }}
                                            className="bg-white dark:bg-dark-lighter  rounded-[20px] ">
                                            <View className="p-4 flex-row justify-between items-start">
                                                <View>
                                                    {
                                                        params.unique ?
                                                            <Text className="font-jakarta-bold text-[25px] text-dark dark:text-white">{t("Cout par kg")}</Text>
                                                            :
                                                            <Text className="font-jakarta-bold text-[25px] text-dark dark:text-white">{Number(params.kg)}{t("Kg")}<Text className="text-[16px] text-dark">{t("/semaine")}</Text></Text>
                                                    }
                                                </View>
                                                <View className="gap-y-1 items-end">
                                                    <Text className="font-jakarta-bold text-primary-500 text-[25px] dark:text-white">{prices?.main}f<Text className="text-[14px] text-primary-500">{params.unique ? t("/kg") : t("/sem")}</Text></Text>
                                                    <Text className="font-dark-400 text-[14px] font-jakarta-medium">{(!params.unique ? t("Facturé par mois") : t("Facture unique"))}</Text>
                                                </View>
                                            </View>
                                            {
                                                activeSubscription && (

                                                    <View className="relative p-4 border-t border-gray-200 dark:border-dark-400">
                                                        <View className="absolute top-6 left-[30px] " >
                                                            <Svg className="" width="2" height="100" viewBox="0 0 2 72" fill="none" >
                                                                <Line x1="1" y1="72.0035" x2="1" y2="-0.00346375" stroke={theme.extend.colors.primary.DEFAULT} strokeDasharray="5 5" />
                                                            </Svg>
                                                        </View>
                                                        <DateAbonnement
                                                            title={t("Date début d'abonnement")}
                                                            date={activeSubscription!.startAt}
                                                            icon={
                                                                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none" >
                                                                    <Path d="M8 5.33331V8.66665" stroke={colorScheme == "light" ? theme.extend.colors.primary[500] : theme.extend.colors.primary.DEFAULT} strokeLinecap="round" strokeLinejoin="round" />
                                                                    <Path d="M8.00008 14.6667C4.78008 14.6667 2.16675 12.0533 2.16675 8.83333C2.16675 5.61333 4.78008 3 8.00008 3C11.2201 3 13.8334 5.61333 13.8334 8.83333" stroke={colorScheme == "light" ? theme.extend.colors.primary[500] : theme.extend.colors.primary.DEFAULT} strokeLinecap="round" strokeLinejoin="round" />
                                                                    <Path d="M6 1.33331H10" stroke={colorScheme == "light" ? theme.extend.colors.primary[500] : theme.extend.colors.primary.DEFAULT} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <Path d="M9.93335 12.3333V11.56C9.93335 10.6066 10.6133 10.2133 11.44 10.6933L12.1067 11.08L12.7733 11.4666C13.6 11.9466 13.6 12.7266 12.7733 13.2066L12.1067 13.5933L11.44 13.98C10.6133 14.46 9.93335 14.0666 9.93335 13.1133V12.3333Z" stroke={colorScheme == "light" ? theme.extend.colors.primary[500] : theme.extend.colors.primary.DEFAULT} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                                </Svg>
                                                            }

                                                        />
                                                        <DateAbonnement
                                                            title={t("Date fin d'abonnement")}
                                                            className="mt-8"
                                                            date={activeSubscription!.endAt}
                                                            icon={
                                                                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none" >
                                                                    <Path d="M8.00008 14.6667C4.78008 14.6667 2.16675 12.0533 2.16675 8.83333C2.16675 5.61333 4.78008 3 8.00008 3C11.2201 3 13.8334 5.61333 13.8334 8.83333" stroke={colorScheme == "light" ? theme.extend.colors.primary[500] : theme.extend.colors.primary.DEFAULT} strokeLinecap="round" strokeLinejoin="round" />
                                                                    <Path d="M8 5.33331V8.66665" stroke={colorScheme == "light" ? theme.extend.colors.primary[500] : theme.extend.colors.primary.DEFAULT} strokeLinecap="round" strokeLinejoin="round" />
                                                                    <Path d="M6 1.33331H10" stroke={colorScheme == "light" ? theme.extend.colors.primary[500] : theme.extend.colors.primary.DEFAULT} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <Path d="M12.6667 11.3333V14" stroke={colorScheme == "light" ? theme.extend.colors.primary[500] : theme.extend.colors.primary.DEFAULT} strokeLinecap="round" strokeLinejoin="round" />
                                                                    <Path d="M10.6667 11.3333V14" stroke={colorScheme == "light" ? theme.extend.colors.primary[500] : theme.extend.colors.primary.DEFAULT} strokeLinecap="round" strokeLinejoin="round" />
                                                                </Svg>
                                                            }

                                                        />
                                                        <View className="mt-4 flex-row justify-between items-center">
                                                            <Text className="font-jakarta-semibold-semibold text-[12px] text-dark-300 dark:text-gray-400">{t("Status de l'abonnement")}</Text>
                                                            <View className="p-2 py-1 rounded-full bg-green-500 dark:bg-green-dark-500"><Text className="text-white dark:text-gray-100 font-jakarta text-[12px]">{t("En cours")}</Text></View>
                                                        </View>
                                                    </View>
                                                )
                                            }

                                        </View>
                                        {
                                            activeSubscription && (
                                                <View className="mt-8">
                                                    <View className="flex-row  items-center gap-x-4">
                                                        <View className="flex-1">
                                                            <Button onPress={() => {
                                                                handleCancel()
                                                            }} className=" bg-gray-200 dark:bg-dark-lighter">
                                                                <View className="justify-center flex-row items-center gap-x-3">
                                                                    <Svg width="21" height="20" viewBox="0 0 21 20" fill="none" >
                                                                        <Path d="M10.5001 18.3334C15.0834 18.3334 18.8334 14.5834 18.8334 10C18.8334 5.41669 15.0834 1.66669 10.5001 1.66669C5.91675 1.66669 2.16675 5.41669 2.16675 10C2.16675 14.5834 5.91675 18.3334 10.5001 18.3334Z" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[100]} strokeLinecap="round" strokeLinejoin="round" />
                                                                        <Path d="M8.1416 12.3583L12.8583 7.64166" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[100]} strokeLinecap="round" strokeLinejoin="round" />
                                                                        <Path d="M12.8583 12.3583L8.1416 7.64166" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[100]} strokeLinecap="round" strokeLinejoin="round" />
                                                                    </Svg>
                                                                    <Text className="font-jakarta-medium text-[14px] text-dark dark:text-gray-200">{t("Cloturer")}</Text>
                                                                </View>
                                                            </Button>
                                                        </View>
                                                        <View className="flex-1">
                                                            <Button.Primary className="" onPress={() => {
                                                                setShowPackages(true)
                                                                //Alert.alert("ok")
                                                            }}>
                                                                <View className="flex-row justify-center items-center gap-x-3">
                                                                    <Svg width="23" height="24" viewBox="0 0 23 24" fill="none" >
                                                                        <Path d="M13.6024 7.2294L5.26328 9.81741C3.28338 10.4302 3.2551 13.221 5.22085 13.8762L7.51188 14.6399C8.14828 14.852 8.64797 15.3517 8.8601 15.9881L9.62377 18.2791C10.279 20.2449 13.065 20.2119 13.6826 18.2367L16.2706 9.89755C16.7797 8.25706 15.2429 6.72028 13.6024 7.2294Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </Svg>

                                                                    <Text className="font-jakarta-medium text-[14px] text-white dark:text-gray-200">{t("Changer le plan")}</Text>
                                                                </View>
                                                            </Button.Primary>
                                                        </View>
                                                    </View>
                                                </View>
                                            )
                                        }
                                        {
                                            !activeSubscription && (
                                                <View className="flex-1 " style={{ marginBottom: bottom }}>
                                                    <ScrollView className="flex-1">
                                                        <View className="mt-8 ">
                                                            <Text className="font-jakarta-bold text-[20px] text-dark dark:text-gray-100">{t("Avantages clés")}</Text>
                                                        </View>
                                                        <View className="gap-y-6 my-8">
                                                            {
                                                                advantages.map((d, i) => (
                                                                    <View key={i}>
                                                                        <KeyAdvantage title={d.title} description={d.description} icon={d.icon} item={params} />
                                                                    </View>
                                                                ))
                                                            }
                                                        </View>
                                                    </ScrollView>
                                                    <View className="">
                                                        <Button.Primary onPress={() => router.push({
                                                            pathname: "/nolayout/client/subscription-form",
                                                            params,
                                                        })} label={
                                                            <Text className="font-jakarta-semibold text-white">{params?.unique ? t("Commander") : t("Souscrire - {{price}}f", {
                                                                price: fnPart(new Decimal(params.amount).mul(4).toString(), country).main
                                                            })}{!params.unique ? <Text className="text-[12px] text-white font-jakarta-semibold">{t("/mo")}</Text> : <></>}</Text>
                                                        } />
                                                    </View>
                                                </View>
                                            )
                                        }
                                    </ScrollView>
                                </View>
                            }

                        </View>

                    </View>
                </View>
                <Modal animationType="slide" presentationStyle="formSheet" visible={showPakages} onRequestClose={() => {
                    setShowPackages(false)
                }}>
                    <View className="flex-1 bg-white dark:bg-dark-lighter">
                        <Packages allowSubscriptionCancel={true} filterPackage={(x) => {
                            return x.filter((y) => y.id != activeSubscription?.package.id)
                        }} showActive={false} onPackageSelect={() => {
                            setShowPackages(false)
                        }} />
                    </View>
                </Modal>
            </>
        )
    }

}

const DateAbonnement = ({ icon, date, className, title }: { title?: string, className?: string, date: string, icon: React.ReactNode }) => {

    return (
        <View className={clx("gap-x-4 flex-row items-center", className)}>
            <View className="w-[35px] h-[35px] rounded-full bg-[#CDEEF3] dark:bg-[#0F3E46] justify-center items-center">
                {icon}
            </View>
            <View className="gap-y-1">
                <Text className="font-jakarta-semibold text-[16px] text-dark dark:text-gray-100">{t(title ?? "Date d'abonnement")}</Text>
                <Text className="font-jakarta text-dark-300 dark:text-gray-400">{format(new Date(date), "dd MMM")}</Text>
            </View>
        </View>
    )
}
interface IKeyAdvantage {
    title: string,
    icon: React.ReactNode,
    description: string | ((d: any) => string),
    item: IPackage
}
const KeyAdvantage = ({ icon, title, description, item }: IKeyAdvantage) => {

    return (
        <View className=" flex-row items-center gap-x-4">
            <View className="w-[50px] justify-center items-center h-[50px] rounded-[10px] bg-primary/20">
                {icon}
            </View>
            <View className="flex-1">
                <Text className="font-jakarta-semibold text-[16px] dark:text-gray-100 text-dark">{t(title)}</Text>
                <Text className="text-[14px] font-jakarta text-dark">{typeof description == 'string' ? t(description) : description(item)}</Text>
            </View>
        </View>
    )
}

const LoadingState = () => {
    return (
        <View className="px-6">
            <View className="h-[100px] rounded-[20px] bg-gray-200  dark:bg-dark-lighter"></View>
            <View className="mt-10 gap-y-10">
                <View className=" flex-row gap-x-4">
                    <View className="w-[50px] h-[50px] rounded-[10px] bg-gray-200 dark:bg-dark-lighter"></View>
                    <View className="gap-y-3 flex-1">
                        <View className="h-6 rounded-full bg-gray-200 dark:bg-dark-lighter w-10/12" ></View>
                        <View className="h-4 rounded-full bg-gray-200 dark:bg-dark-lighter w-5/12" ></View>
                    </View>
                </View>
                <View className=" flex-row gap-x-4">
                    <View className="w-[50px] h-[50px] rounded-[10px] bg-gray-200 dark:bg-dark-lighter"></View>
                    <View className="gap-y-3 flex-1">
                        <View className="h-6 rounded-full bg-gray-200 dark:bg-dark-lighter w-10/12" ></View>
                        <View className="h-4 rounded-full bg-gray-200 dark:bg-dark-lighter w-5/12" ></View>
                    </View>
                </View>
                <View className=" flex-row gap-x-4">
                    <View className="w-[50px] h-[50px] rounded-[10px] bg-gray-200 dark:bg-dark-lighter"></View>
                    <View className="gap-y-3 flex-1">
                        <View className="h-6 rounded-full bg-gray-200 dark:bg-dark-lighter w-10/12" ></View>
                        <View className="h-4 rounded-full bg-gray-200 dark:bg-dark-lighter w-5/12" ></View>
                    </View>
                </View>
                <View className=" flex-row gap-x-4">
                    <View className="w-[50px] h-[50px] rounded-[10px] bg-gray-200 dark:bg-dark-lighter"></View>
                    <View className="gap-y-3 flex-1">
                        <View className="h-6 rounded-full bg-gray-200 dark:bg-dark-lighter w-10/12" ></View>
                        <View className="h-4 rounded-full bg-gray-200 dark:bg-dark-lighter w-5/12" ></View>
                    </View>
                </View>
            </View>
        </View>
    )
}