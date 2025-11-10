import { confirmDelivery } from "@/api/merchants";
import { getOrder, payInvoice } from "@/api/subscription";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { ActionModal, WarningAlert } from "@/components/Modal";
import { Text } from "@/components/Themed";
import { capitalize, clx, fnPart } from "@/helpler";
import { country } from "@/storage/config";
import { IInvoice, IOrder } from "@/store/type";
import { theme } from "@/tailwind.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addDays, format, isSameDay, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";
import { Decimal } from "decimal.js";
import { useLocalSearchParams } from "expo-router";
import { t } from "i18next";
import { useColorScheme } from "nativewind";
import React, { useMemo } from "react";
import { Alert, Linking, RefreshControl, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";
import { StatusItem } from "./Histories";
import { PaymentModal } from "./SubscriptionForm";

export function Order() {
    const { orderString, id } = useLocalSearchParams<{ orderString: string, id: string }>()
    const orderParsed = useMemo(() => {
        if (orderString) {
            return JSON.parse(orderString)
        }
    }, [orderString])
    const orderQuery = useQuery({
        queryKey: ["order-key-" + id],
        queryFn: () => getOrder(id),
        enabled: !!id
    })
    const order: IOrder | undefined = useMemo(() => {
        if (orderQuery.isSuccess && orderQuery.data) {
            return orderQuery.data
        } else if (orderParsed) {
            return orderParsed
        }
    }, [orderParsed, orderQuery.data])
    const [showModal, setShowModal] = React.useState(false)
    const { colorScheme } = useColorScheme()
    const modalType = React.useRef<"invoice" | "description">("description")
    const confirmDeliveryMutation = useMutation({
        mutationKey: ["confirmDelivery-" + order?.id],
        mutationFn: confirmDelivery
    })
    const { bottom } = useSafeAreaInsets()
    if (order) {

        const Steps = [
            {
                title: order.hasStarted ? t("Commande démarrée") : t("La commande démarre " + getOrderExecutionDayName(order).toLowerCase()),
                description: <Text className="font-jakarta text-[14px] text-dark-300 dark:text-gray-400">{order.orderTitle}</Text>,
                icon: (
                    <Svg width="30" height="30" viewBox="0 0 30 30" fill="none" >
                        <Path d="M15 26.25C17.6027 26.25 20.125 25.3475 22.1369 23.6964C24.1489 22.0452 25.5261 19.7475 26.0338 17.1948C26.5416 14.642 26.1485 11.9922 24.9216 9.69679C23.6947 7.40137 21.7098 5.60238 19.3052 4.60636C16.9006 3.61033 14.225 3.47888 11.7343 4.23442C9.24363 4.98996 7.09198 6.58573 5.64597 8.74983C4.19996 10.9139 3.54906 13.5125 3.80417 16.1027C4.05928 18.6929 5.20463 21.1145 7.04505 22.9549" stroke={order.hasStarted ? "white" : (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200])} strokeWidth="1.5" strokeLinecap="round" />
                        <Path d="M20 12.5L15.152 18.3175C14.4965 19.1042 14.1687 19.4976 13.7281 19.5176C13.2875 19.5375 12.9255 19.1755 12.2014 18.4514L10 16.25" stroke={order.hasStarted ? "white" : (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200])} strokeWidth="1.5" strokeLinecap="round" />
                    </Svg>
                ),
                isActive: order.hasStarted,
                isCompleted: order.hasStarted,
                onClick: () => {
                    console.log("hello")
                    modalType.current = "description"
                    setShowModal(true)
                }
            },
            {
                title: t("Collecte des linges"),
                description: (
                    <View className="flex-row items-center gap-x-2">
                        <Text className="font-jakarta text-[14px] text-dark-300 dark:text-gray-400">{`${order.pickingHours[0]} - ${order.pickingHours[1]}`}</Text>
                        {
                            ( order.userKg ) &&
                            <>
                                <View className="w-[3px] h-[3px] rounded-full bg-dark-300 dark:bg-gray"></View>
                                <Text className="font-jakarta text-[14px] text-dark-300 dark:text-gray-400">{order.userKg ? `${order.userKg}Kg collectés` : t("En cours")}</Text>
                            </>
                        }

                    </View>
                ),
                icon: (
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path d="M9.25626 23.9639L8.03844 23.8882C7.06192 23.7973 4.77189 23.4283 4.35662 22.3168L4.3466 22.2889C4.26024 22.0592 4.34161 21.8058 4.35378 21.5699L4.36307 20.8304C4.36614 20.5675 4.41034 20.2468 4.44223 19.981C4.55101 19.0749 4.72131 18.1807 5.00541 17.3131C5.18289 16.7711 5.36703 16.4659 5.36811 15.8849L5.36425 13.436L5.19256 11C4.95793 11.3 4.16628 12.4358 3.82041 12.4808C3.56178 12.5144 3.35156 12.3395 3.13903 12.215L1.77004 11.3191C1.26019 10.9501 0.447422 10.2565 0.173371 9.6764C-0.153157 8.98519 0.0155281 8.54133 0.396999 7.97767L2.49577 4.88445C3.15803 3.97737 3.88022 3.22602 5.02049 3.03044L6.58653 2.81421C6.85938 2.76467 6.93521 2.75162 7.03969 2.5197L7.79685 1.07273C7.88312 0.915523 7.95684 0.745686 8.06038 0.599333L8.14927 0.480234C8.58006 -0.0102716 9.10319 0.0195595 9.68828 0.0466524L10.4236 0.0646927C10.6417 0.0758069 10.8564 0.107313 11.0755 0.109665L13.0098 0.106444L14.7629 0.00470836C15.4929 -0.0512169 15.8423 0.39844 16.1442 0.960818L16.8809 2.34722C16.9345 2.45476 16.9915 2.54502 17.0208 2.6647L17.0246 2.68094C17.2424 2.76132 17.4541 2.79949 17.6802 2.84304L18.7337 2.99897C20.5116 3.22421 21.1286 4.33028 22.0994 5.71653L23.7221 8.15594C24.0359 8.66823 24.1156 9.21817 23.7957 9.77014C23.3928 10.4655 22.3367 11.2851 21.6783 11.728L20.7889 12.2761C20.0113 12.7133 19.9081 12.3328 19.3866 11.7161C19.1901 11.4838 18.9726 11.2446 18.8109 10.9861L18.7998 10.9681C18.7745 11.0489 18.7767 11.1522 18.7732 11.2364L18.6933 12.5775C18.6808 12.7338 18.6548 12.8889 18.6488 13.0462L18.646 15.7862C18.6465 16.0105 18.6535 16.2486 18.7269 16.4635L18.8558 16.8937C19.0443 17.3728 19.1998 17.9097 19.31 18.4111L19.5004 19.407C19.5651 19.8386 19.6096 20.2949 19.6346 20.7318L19.6606 21.4934C19.6761 21.748 19.7741 22.0592 19.6759 22.3049L19.6691 22.3213C19.2633 23.3266 17.2002 23.7592 16.2725 23.8637L14.042 23.9998L10.4736 24C10.3447 23.9979 10.2191 23.9781 10.091 23.9725L9.25626 23.9639ZM9.06073 0.935239C9.4821 1.61897 9.21709 1.52732 9.89796 1.67145C10.5628 1.81216 11.0498 1.86406 11.7218 1.8677L12.736 1.85791C13.1233 1.83613 14.4831 1.69062 14.6011 1.50867L14.6137 1.48802C14.7194 1.31708 14.7897 1.0899 14.9067 0.934241L9.06073 0.935239ZM8.45114 1.68073L7.80785 2.95815C7.94154 3.27379 8.03613 3.60503 8.15091 3.92772L8.49957 4.8378C8.78674 5.57536 8.99042 5.77822 9.80508 5.51438C9.94304 5.4697 10.0876 5.40092 10.214 5.3293C10.5635 5.14481 10.8532 4.90358 11.1816 4.68803C11.0039 4.55721 10.8033 4.46362 10.6222 4.33399C9.80869 3.75154 9.11371 2.96733 8.65191 2.06692L8.48244 1.71294C8.47292 1.69506 8.47039 1.68382 8.45114 1.68073ZM15.5033 1.66584C14.867 2.98067 14.1309 4.03474 12.7888 4.69711C13.086 4.95255 13.4638 5.17583 13.8143 5.34609C14.8574 5.83221 14.9424 5.71092 15.4511 4.71699L16.2129 2.97503L15.7784 2.14807C15.6905 1.98236 15.6133 1.81822 15.5033 1.66584ZM10.0673 2.62324C10.7406 3.34247 11.2851 3.60908 12.0032 4.15719C12.4079 3.87628 12.8747 3.62858 13.2321 3.28642L13.8904 2.65397L12.8537 2.79752C12.4369 2.8339 11.224 2.84205 10.8607 2.77269L10.0673 2.62324ZM16.9524 3.60863L16.1043 5.39351C15.5215 6.51117 15.0311 6.76867 13.8554 6.33306C13.3218 6.13532 12.8846 5.89197 12.4348 5.53393L12.4271 23.0609L14.1431 23.053C14.3254 23.0451 14.5055 23.0077 14.6881 22.9995L15.3153 22.9865C16.337 22.9371 18.0231 22.7832 18.7413 22.0728L18.8192 21.9834L18.7775 21.3198C18.764 20.2325 18.6295 19.1486 18.3228 18.1036C18.0758 17.262 17.7748 16.7142 17.7729 15.8172L17.776 12.7991C17.8003 12.0742 17.8823 11.1882 17.9941 10.4835C18.028 10.2693 18.0378 10.0487 18.0983 9.8394C18.1925 9.51342 18.587 9.24584 18.8563 9.54084C18.9585 9.65285 19.0377 9.79794 19.1314 9.91901C19.5332 10.438 19.9114 10.9884 20.3655 11.4617C21.2001 11.0138 21.9928 10.4326 22.6601 9.75365C23.4524 8.94744 22.994 8.6941 22.4987 7.92622L21.3728 6.25526C21.0657 5.80074 20.7637 5.35507 20.4103 4.93547C19.1964 3.49414 18.4179 4.0974 16.9524 3.60863ZM7.08019 3.62974L6.08739 3.81761C4.20593 4.07678 4.06231 4.17056 2.88891 5.88066L1.3231 8.21309C1.13895 8.48463 0.867524 8.76036 0.922372 9.11434L0.926419 9.14153C1.01667 9.67343 2.40198 10.6717 2.84569 10.9772L3.65662 11.4656C4.11362 11.0035 4.47463 10.4312 4.87327 9.9172C5.09184 9.63532 5.36444 9.14752 5.76052 9.56606C5.88352 9.69605 5.91513 9.90516 5.94637 10.0751L6.16348 11.8161L6.23332 13.1795L6.23869 16.0508C6.23743 16.3453 6.18599 16.621 6.08821 16.9006C5.52516 18.5116 5.29372 19.6426 5.22408 21.33L5.22243 21.724C5.20511 22.0548 5.18889 22.0242 5.45169 22.2205C6.1283 22.726 7.05465 22.8438 7.86684 22.9171L9.98581 23.0523L11.3582 23.0611C11.435 23.0628 11.52 23.0779 11.5952 23.0681L11.5726 5.51112C11.1145 6.01133 10.1271 6.41395 9.48127 6.52744C8.51079 6.69799 8.0286 6.01013 7.70562 5.23243L7.13093 3.6777C7.11547 3.63563 7.12258 3.63959 7.08019 3.62974Z" fill={!!order.userKg && order.merchantId && order.hasStarted ? "white" : (order.hasStarted ? (colorScheme == "light" ? theme.extend.colors.green[400] : theme.extend.colors.green[400]) : (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]))} />
                    </Svg>
                ),
                isActive: order.hasStarted && (["STARTED"].includes(order.status) || !!order.userKg),
                isCompleted: order.hasStarted && !!order.userKg
            },
            {
                title: t("Lavage, séchage & emballage"),
                description: (
                    <View className="flex-row items-center gap-x-2">
                        <Text className="font-jakarta text-[14px] text-dark-300 dark:text-gray-400">{`~${order.executionDuration}h approx`}</Text>
                        {
                            !!order.userKg &&
                            <>
                                <View className="w-[3px] h-[3px] rounded-full bg-dark-300 dark:bg-gray"></View>
                                <Text className="font-jakarta text-[14px] text-dark-300 dark:text-gray-400">{order.status == "READY" ? t("Terminé") : t("En cours")}</Text>
                            </>
                        }

                    </View>
                ),
                icon: (
                    <Svg width="17" height="21" viewBox="0 0 17 21" fill="none" >
                        <Path d="M14.7498 0.0937602L2.24984 0.0833435C1.09359 0.0833435 0.166504 1.01043 0.166504 2.16668V18.8333C0.166504 19.9896 1.09359 20.9167 2.24984 20.9167H14.7498C15.9061 20.9167 16.8332 19.9896 16.8332 18.8333V2.16668C16.8332 1.01043 15.9061 0.0937602 14.7498 0.0937602ZM14.7498 18.8333H2.24984L2.23942 2.16668H14.7498V18.8333Z" fill={order.hasStarted && ["READY", "DELIVERED"].includes(order.status) ? "white" : (order.hasStarted && !!order.userKg ? (colorScheme == "light" ? theme.extend.colors.green[400] : theme.extend.colors.green[400]) : (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]))} />
                        <Path d="M4.33317 5.29168C4.90847 5.29168 5.37484 4.82531 5.37484 4.25001C5.37484 3.67471 4.90847 3.20834 4.33317 3.20834C3.75787 3.20834 3.2915 3.67471 3.2915 4.25001C3.2915 4.82531 3.75787 5.29168 4.33317 5.29168Z" fill={order.hasStarted && ["READY", "DELIVERED"].includes(order.status) ? "white" : (order.hasStarted && !!order.userKg ? (colorScheme == "light" ? theme.extend.colors.green[400] : theme.extend.colors.green[400]) : (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]))} />
                        <Path d="M7.45817 5.29168C8.03347 5.29168 8.49984 4.82531 8.49984 4.25001C8.49984 3.67471 8.03347 3.20834 7.45817 3.20834C6.88287 3.20834 6.4165 3.67471 6.4165 4.25001C6.4165 4.82531 6.88287 5.29168 7.45817 5.29168Z" fill={order.hasStarted && ["READY", "DELIVERED"].includes(order.status) ? "white" : (order.hasStarted && !!order.userKg ? (colorScheme == "light" ? theme.extend.colors.green[400] : theme.extend.colors.green[400]) : (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]))} />
                        <Path d="M8.49984 17.7917C11.3748 17.7917 13.7082 15.4583 13.7082 12.5833C13.7082 9.70834 11.3748 7.37501 8.49984 7.37501C5.62484 7.37501 3.2915 9.70834 3.2915 12.5833C3.2915 15.4583 5.62484 17.7917 8.49984 17.7917ZM10.9582 10.125C12.3123 11.4792 12.3123 13.6875 10.9582 15.0417C9.604 16.3958 7.39567 16.3958 6.0415 15.0417L10.9582 10.125Z" fill={order.hasStarted && ["READY", "DELIVERED"].includes(order.status) ? "white" : (order.hasStarted && !!order.userKg ? (colorScheme == "light" ? theme.extend.colors.green[400] : theme.extend.colors.green[400]) : (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]))} />
                    </Svg>

                ),
                isActive: order.hasStarted && !!order.userKg,
                isCompleted: order.hasStarted && ["READY", "DELIVERED"].includes(order.status)
            },
            {
                title: t("Livraison"),
                description: (
                    <View className="flex-row items-center gap-x-2">
                        <Text className="font-jakarta text-[14px] text-dark-300 dark:text-gray-400">{`${order.pickingHours[0]} - ${order.pickingHours[1]}`}</Text>
                        {
                            order.hasStarted && ["STARTED", "PICKED", "WASHING"].includes(order.status) &&
                            <>
                                <View className="w-[3px] h-[3px] rounded-full bg-dark-300 dark:bg-gray"></View>
                                <Text className="font-jakarta text-[14px] text-dark-300 dark:text-gray-400">{order.userKg ? `${order.userKg}Kg collectés` : t("En cours")}</Text>
                            </>
                        }

                    </View>
                ),
                icon: (
                    <Svg width="30" height="26" viewBox="0 0 30 26" fill="none">
                        <Path d="M18.75 2.16666V13C18.75 14.1917 17.625 15.1667 16.25 15.1667H2.5V8.25498C3.4125 9.19748 4.81253 9.78249 6.36253 9.74999C7.62503 9.72832 8.7625 9.30583 9.6125 8.60166C10 8.31999 10.325 7.96248 10.575 7.57248C11.025 6.91165 11.275 6.13163 11.25 5.31913C11.2125 4.05163 10.5625 2.93582 9.55002 2.16666H18.75Z" stroke={order.status == "DELIVERED" ? "white" : (!!order.userKg && ["READY", "DELIVERED"].includes(order.status) ? (colorScheme == "light" ? theme.extend.colors.green[400] : theme.extend.colors.green[400]) : (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]))} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M27.5 15.1667V18.4167C27.5 20.215 25.825 21.6667 23.75 21.6667H22.5C22.5 20.475 21.375 19.5 20 19.5C18.625 19.5 17.5 20.475 17.5 21.6667H12.5C12.5 20.475 11.375 19.5 10 19.5C8.625 19.5 7.5 20.475 7.5 21.6667H6.25C4.175 21.6667 2.5 20.215 2.5 18.4167V15.1667H16.25C17.625 15.1667 18.75 14.1917 18.75 13V5.41666H21.05C21.95 5.41666 22.775 5.83917 23.225 6.51083L25.3625 9.74999H23.75C23.0625 9.74999 22.5 10.2375 22.5 10.8333V14.0833C22.5 14.6792 23.0625 15.1667 23.75 15.1667H27.5Z" stroke={order.status == "DELIVERED" ? "white" : (!!order.userKg && ["READY", "DELIVERED"].includes(order.status) ? (colorScheme == "light" ? theme.extend.colors.green[400] : theme.extend.colors.green[400]) : (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]))} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M10 23.8333C11.3807 23.8333 12.5 22.8633 12.5 21.6667C12.5 20.47 11.3807 19.5 10 19.5C8.61929 19.5 7.5 20.47 7.5 21.6667C7.5 22.8633 8.61929 23.8333 10 23.8333Z" stroke={order.status == "DELIVERED" ? "white" : (!!order.userKg && ["READY", "DELIVERED"].includes(order.status) ? (colorScheme == "light" ? theme.extend.colors.green[400] : theme.extend.colors.green[400]) : (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]))} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M20 23.8333C21.3807 23.8333 22.5 22.8633 22.5 21.6667C22.5 20.47 21.3807 19.5 20 19.5C18.6193 19.5 17.5 20.47 17.5 21.6667C17.5 22.8633 18.6193 23.8333 20 23.8333Z" stroke={order.status == "DELIVERED" ? "white" : (!!order.userKg && ["READY", "DELIVERED"].includes(order.status) ? (colorScheme == "light" ? theme.extend.colors.green[400] : theme.extend.colors.green[400]) : (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]))} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M27.5 13V15.1667H23.75C23.0625 15.1667 22.5 14.6792 22.5 14.0833V10.8333C22.5 10.2375 23.0625 9.75 23.75 9.75H25.3625L27.5 13Z" stroke={order.status == "DELIVERED" ? "white" : (!!order.userKg && ["READY", "DELIVERED"].includes(order.status) ? (colorScheme == "light" ? theme.extend.colors.green[400] : theme.extend.colors.green[400]) : (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]))} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M11.25 5.41668C11.25 6.71668 10.5875 7.87584 9.55002 8.66668C8.66252 9.33834 7.5125 9.75001 6.25 9.75001C3.4875 9.75001 1.25 7.81084 1.25 5.41668C1.25 4.05168 1.975 2.82752 3.125 2.03668C3.9875 1.44085 5.075 1.08334 6.25 1.08334C9.0125 1.08334 11.25 3.02251 11.25 5.41668Z" stroke={order.status == "DELIVERED" ? "white" : (!!order.userKg && ["READY", "DELIVERED"].includes(order.status) ? (colorScheme == "light" ? theme.extend.colors.green[400] : theme.extend.colors.green[400]) : (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]))} strokeWidth="1.2" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M6.5625 4.0625V5.6875L5 6.5" stroke={order.status == "DELIVERED" ? "white" : (!!order.userKg && ["READY", "DELIVERED"].includes(order.status) ? (colorScheme == "light" ? theme.extend.colors.green[400] : theme.extend.colors.green[400]) : (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]))} strokeWidth="1.2" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>


                ),
                isActive: order.hasStarted && !!order.userKg && ["READY", "DELIVERED"].includes(order.status),
                isCompleted: order.hasStarted && order.status == "DELIVERED"
            },
        ]
        const lastActiveIndex = [...Steps, {}].findIndex((s: any) => !s.isActive) - 1

        const factureDate = useMemo(() => {
            const add_kgWeight = Decimal(order.userKg ?? 0).minus(Decimal(order.capacityKg)).toNumber()
            return {
                add_kgWeight,
                add_price: fnPart(Decimal(add_kgWeight).mul(order.customerOrderKgPrice!).toNumber(), country).main
            }
        }, [order])

        const handleSubmitAction = async (confirm = true) => {
            if (confirm) {
                return Alert.alert(t("Confirmation"), t("Confirmez-vous la reception de vos linges ?"), [
                    {
                        text: t("Annuler")
                    },
                    {
                        text: t("Oui, Continuer"),
                        onPress: () => {
                            handleSubmitAction(false)
                        }
                    }
                ])
            }
            try {
                await confirmDeliveryMutation.mutateAsync({
                    orderId: order.id
                })
                orderQuery.refetch()
                Toast.show({
                    text2: t("Commande mise à jour"),
                    type: "success"
                })
            } catch (e) {
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

        return (
            <BottomSheetModalProvider>
                <View className="flex-1 bg-light dark:bg-dark-bg">
                    <Header
                        title={t("Suivi de commande")}
                    />
                    <ScrollView contentContainerClassName="flex-1"
                        refreshControl={
                            <RefreshControl
                                refreshing={!!orderQuery.data && orderQuery.isPending}
                                onRefresh={orderQuery.refetch}
                            />
                        }
                    >
                        <View className="flex-1 ">
                            <View className="px-4 my-8 flex-row items-center justify-between ">
                                <View className="flex-row items-center gap-x-2">
                                    <Text className="text-[20px] font-jakarta-semibold text-primary dark:text-primary-500">{capitalize(format(order.executionDate, "dd MMMM", {
                                        locale: fr
                                    }))}</Text>
                                    <View className="w-[4px] h-[4px] rouded-full rounded-full bg-dark-300 dark:bg-gray"></View>
                                    <Text className="font-jakarta-semibold text-14px text-dark-300 dark:text-dark-400">ID: #{order.orderId}</Text>
                                </View>
                                <View>
                                    <StatusItem order={order} />
                                </View>
                            </View>
                            {
                                order.status == "READY" && (
                                    <View className="px-4">
                                        <WarningAlert
                                            title={t("Livraison démarrée")}
                                            description={ order.invoice && order.invoice?.status != "SUCCESS" ? t("Vous serez livré bientot. Veuillez régler votre facture en attente pour récupérer vos linges"):""}
                                        />
                                    </View>
                                )
                            }
                            <View className="relative">
                                <View className="bg-primary-400/20 absolute z-10" style={{ height: lastActiveIndex > 0 ? lastActiveIndex * 80 : 0, width: 1, left: 33, top: 35 }}></View>
                                {
                                    Steps.map((s, i) => (
                                        <View key={s.title}>
                                            <Step icon={s.icon} subtitle={s.description} title={s.title} isActive={s.isActive} isCompleted={s.isCompleted} onClick={s.onClick} />
                                        </View>
                                    ))
                                }
                            </View>
                            <View>
                                {
                                    order.invoiceId && (
                                        <View className="p-4 gap-y-6">
                                            <Text className="font-jakarta-semibold text-dark-400 dark:text-gray-100 text-[16px] border-b border-gray dark:border-dark-400 pb-4">{t("Facturation kg additionnel")}</Text>
                                            <TouchableOpacity onPress={() => {
                                                modalType.current = "invoice"
                                                setShowModal(true)
                                            }} className="flex-row ">

                                                <View className="flex-1 flex-row items-center gap-x-4 flex-1">
                                                    <View className="w-[40px] h-[40px] bg-primary/20 rounded-full justify-center items-center">
                                                        <Svg width="21" height="18" viewBox="0 0 21 18" fill="none" >
                                                            <Path fillRule="evenodd" clipRule="evenodd" d="M0 0.211678L2.77268 16.1073V18H18.2273V16.1073L21 0.211678L19.782 0L19.4046 2.16341C18.6244 2.69196 17.5716 2.94511 16.5464 2.66271C16.1653 2.55775 15.1177 2.09097 14.4947 1.78006L14.1739 1.61992L13.8754 1.81855C12.9458 2.43713 12.0769 2.99307 10.8183 2.99307C9.56193 2.99307 8.54704 2.35093 7.7654 1.8214L7.40679 1.57846L7.05573 1.83215C6.62063 2.14655 5.42497 2.77581 4.61608 3.01936C4.20099 3.14434 3.53119 3.21835 2.87181 3.21736C2.54795 3.21687 2.24419 3.19824 1.99382 3.16368C1.90397 3.15128 1.82727 3.13763 1.76295 3.12389L1.21805 0L0 0.211678ZM1.98661 4.40614L4.00905 16.0006V16.7659H16.991V16.0006L19.1388 3.68716C18.2593 4.02906 17.2379 4.1334 16.2175 3.85232C15.7846 3.73308 14.8996 3.34389 14.265 3.04125C13.3916 3.61196 12.3138 4.22715 10.8183 4.22715C9.37236 4.22715 8.20731 3.5862 7.41444 3.07126C6.77144 3.46162 5.7481 3.96752 4.97314 4.20086C4.39454 4.37507 3.58926 4.45252 2.86995 4.45143C2.5652 4.45098 2.26323 4.43644 1.98661 4.40614ZM9.27279 11.1067C9.27279 11.7883 8.71925 12.3408 8.03642 12.3408C7.35359 12.3408 6.80005 11.7883 6.80005 11.1067C6.80005 10.4252 7.35359 9.87264 8.03642 9.87264C8.71925 9.87264 9.27279 10.4252 9.27279 11.1067ZM12.9819 12.3408C13.6647 12.3408 14.2183 11.7883 14.2183 11.1067C14.2183 10.4252 13.6647 9.87264 12.9819 9.87264C12.2991 9.87264 11.7455 10.4252 11.7455 11.1067C11.7455 11.7883 12.2991 12.3408 12.9819 12.3408Z" fill="#06A8C4" />
                                                        </Svg>
                                                    </View>
                                                    <View className="gap-y-1">
                                                        <Text className="font-jakarta-semibold text-[16px] text-dark dark:text-gray-100">{t("{{kg}} Kg", {
                                                            kg: factureDate.add_kgWeight
                                                        })}</Text>
                                                        <View className="flex-row items-center gap-x-2">
                                                            <Text className="font-jakarta text-[14px] text-dark-300 dark:text-gray-400">{`${order.customerOrderKgPrice}f/kg`}</Text>
                                                            <View className="w-[3px] h-[3px] rounded-full bg-dark-300 dark:bg-gray"></View>
                                                            <Text className="font-jakarta text-[14px] text-dark-300 dark:text-gray-400">{t("{{price}}f", {
                                                                price: factureDate.add_price
                                                            })}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                <View className=" flex-row items-center gap-x-4 px-2">
                                                    <StatusInvoice invoice={order.invoice} />
                                                    <Svg width="7" height="8" viewBox="0 0 7 8" fill="none" >
                                                        <Path d="M1 8.90001L5.88998 4.82501C6.46748 4.34376 6.46748 3.55626 5.88998 3.07501L1 -1" stroke={colorScheme == "light" ? theme.extend.colors.dark[300] : theme.extend.colors.dark[400]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                    </Svg>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }

                            </View>

                        </View>
                        {
                            order?.status == "READY" && (
                                <View className="px-4" style={{ marginBottom: bottom }}>
                                    <Button.Primary onPress={() => {
                                        handleSubmitAction()
                                    }} className=" bg-green dark:bg-green-dark-500">
                                        <View className="flex-row items-center gap-x-2 justify-center">
                                            <Svg width="21" height="20" viewBox="0 0 21 20" fill="none" >
                                                <Path d="M10.5 17.5C12.2352 17.5 13.9166 16.8984 15.2579 15.7976C16.5992 14.6968 17.5174 13.165 17.8559 11.4632C18.1944 9.76135 17.9324 7.9948 17.1144 6.46453C16.2965 4.93425 14.9732 3.73492 13.3701 3.0709C11.767 2.40689 9.98332 2.31926 8.32287 2.82295C6.66242 3.32664 5.22799 4.39049 4.26398 5.83322C3.29997 7.27596 2.86604 9.00832 3.03611 10.7351C3.20619 12.4619 3.96975 14.0764 5.1967 15.3033" stroke={colorScheme == "light" ? "#fff" : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeLinecap="round" />
                                                <Path d="M13.8334 8.33325L11.0688 11.6508C10.4132 12.4375 10.0854 12.8308 9.64482 12.8508C9.20425 12.8708 8.8422 12.5087 8.1181 11.7846L7.16671 10.8333" stroke={colorScheme == "light" ? "#fff" : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeLinecap="round" />
                                            </Svg>
                                            <Text className="font-jakarta-medium text-[14px] text-white dark:text-gray-200">{t("Marquer comme reçu")}</Text>
                                        </View>
                                    </Button.Primary>
                                </View>
                            )
                        }
                    </ScrollView>
                </View>

                <DetailModal
                    refetchOrder={orderQuery.refetch}
                    type={modalType.current}
                    order={{ ...order, ...factureDate }}
                    show={showModal}
                    onClose={() => setShowModal(false)}
                />

            </BottomSheetModalProvider>
        )
    }

}

interface IStep {
    icon: React.ReactNode,
    title: string,
    subtitle: React.ReactNode,
    onClick?: () => void,
    isActive?: boolean,
    isCompleted?: boolean
}
const Step = ({
    icon,
    title,
    subtitle,
    onClick,
    isActive,
    isCompleted
}: IStep) => {
    const { colorScheme } = useColorScheme()
    const Comp = (
        <View className={clx("p-4 flex-row items-center gap-x-4  z-20", !isActive && "opacity-50 bg-light dark:bg-dark-bg")}>
            <View className={clx("items-center justify-center w-[40px] h-[40px] rounded-full ", isCompleted ? "bg-green dark:bg-green" : (isActive ? "bg-green-100 dark:bg-green-dark-500" : "bg-light dark:bg-dark-bg"))}>
                {icon}
            </View>
            <View className="gap-y-2 flex-1 ">
                <Text className="font-jakarta-semibold text-[16px] text-dark dark:text-gray-100">{t(title)}</Text>
                <View className="flex-row items-center gap-x-2">
                    <View className="">{subtitle}</View>
                    <View>
                        {
                            onClick && (
                                <Svg width="7" height="8" viewBox="0 0 7 8" fill="none" >
                                    <Path d="M1 8.90001L5.88998 4.82501C6.46748 4.34376 6.46748 3.55626 5.88998 3.07501L1 -1" stroke={colorScheme == "light" ? theme.extend.colors.dark[300] : theme.extend.colors.gray[200]} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            )
                        }
                    </View>

                </View>
            </View>
        </View>
    )
    if (onClick) {
        return <TouchableOpacity onPress={onClick}>
            {Comp}
        </TouchableOpacity>
    }
    return (
        Comp
    )
}

function getOrderExecutionDayName(order: IOrder) {
    let title = t("Prochainement")
    if (order.status == "CREATED" && !order.hasStarted) {
        if (isTomorrow(order.executionDate)) {
            title = t("Demain")
        } else if (addDays(new Date(), 4) > new Date(order.executionDate)) {
            title = capitalize('le ' + format(order.executionDate, "dddd", {
                locale: fr
            }))
        }
    }
    return title
}
interface IDetailModal {
    type?: "invoice" | "description"
    show: boolean,
    onClose: () => void,
    order: IOrder & ({
        add_kgWeight: number;
        add_price: string;
    }),
    refetchOrder?: any
}
function DetailModal({ order, type = "description", show, onClose, refetchOrder }: IDetailModal) {
    const shippings = {
        "SHIPPING_DEFAULT": t("Livraison standard"),
        "SHIPPING_FAST": t("Livraison rapide"),
        "SHIPPING_PRIORITIZED": t("Livraison priorisé"),
    }
    const formatFrenchSmartDate = () => {
        const date = new Date(order.executionDate)
        const now = new Date()
        const afterTomorrow = addDays(now, 2)
        let prefix = ""

        if (isToday(date)) {
            prefix = t("Aujourd'hui")
        } else if (isTomorrow(date)) {
            prefix = t("Demain")
        } else if (isSameDay(date, afterTomorrow)) {
            prefix = t("Après-demain")
        } else {
            const dayLabel = format(date, "EEEE d", { locale: fr })
            prefix = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)
        }
        console.log(order.pickingHours[1])
        const [h, m] = order.pickingHours[1].split(":")
        const n = new Date()
        n.setHours(Number(h), Number(m), 0, 0)
        const timePart = format(n, "HH:mm", { locale: fr })
        return `${prefix} à ${timePart}`
    }
    const { colorScheme } = useColorScheme()
    const mutation = useMutation({
        mutationKey: ["commmand-pay"],
        mutationFn: payInvoice
    })
    const [paymentStatus, setPaymentStatus] = React.useState<string | undefined>(undefined)

    const handlePayInvoice = async (redirect: boolean = true) => {
        try {
            onClose()
            const data = await mutation.mutateAsync({
                orderId: order.id
            })
            setTimeout(() => {
                setPaymentStatus(data.order.invoice?.status?.toLowerCase())
                if (data.order.invoice.status == "SUCCESS") {
                    refetchOrder()
                }
            }, 300)
            if (redirect && data.paymentUrl) {
                Linking.openURL(data.paymentUrl)
            }

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
    if (type == "invoice") {
        return (
            <>
                <ActionModal show={show} title={(
                    <View className="flex-row items-center flex-1 ">
                        <View className="flex-1">
                            <Text className="font-jakarta-semibold text-[18px] text-dark-400">{t("Kg additionnel")}</Text>
                        </View>
                        <StatusInvoice invoice={order.invoice} />
                    </View>
                )} onClose={onClose}>
                    <View className="py-4 -mt-4 border-b border-gray dark:border-dark-lighter">
                        <Text className="text-[32px] font-jakarta-semibold text-dark dark:text-gray-100">+{order.add_kgWeight}Kg <Text className="ml-4 font-jakarta-medium text-[14px] text-dark-300 dark:text-dark-200 ">{t("de linges additionnels traités")}</Text> </Text>
                    </View>
                    <View className="my-10 gap-y-4 ">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-[16px] font-jakarta-semibold text-dark-400 dark:text-dark-200 ">{t("Prix du kg")}</Text>
                            <Text className="text-[16px] font-jakarta-medium text-primary dark:text-primary-500 ">{`${fnPart(order.customerOrderKgPrice as any, country).main}f/Kg`}</Text>
                        </View>
                        {
                            !order.commandId && (
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-[16px] font-jakarta-semibold text-dark-400 dark:text-dark-200 ">{t("Cout livraison")}</Text>
                                    <Text className="text-[16px] font-jakarta-medium text-primary dark:text-primary-500 ">{`${order.deliveryCost}f`}</Text>
                                </View>
                            )
                        }

                        <View className="flex-row items-center justify-between">
                            <Text className="text-[16px] font-jakarta-semibold text-dark dark:text-dark-200 ">{t("Total à payer")}</Text>
                            <Text className="text-[16px] font-jakarta-semibold text-primary dark:text-primary-500 ">{`${fnPart(order.customerFeesToPay as any, country).main}f`}</Text>
                        </View>
                    </View>
                    {
                        order.invoice.status != "SUCCESS" && (
                            <View className="">
                                <Button.Primary
                                    loading={mutation.isPending}
                                    onPress={() => handlePayInvoice()}
                                    label={
                                        <Text className="font-jakarta-semibold text-[16px] text-white">{t("Payer - " + fnPart(order.customerFeesToPay as any, country).main + "f")}</Text>
                                    }
                                />
                            </View>
                        )
                    }
                </ActionModal>

                <PaymentModal
                    open={!!paymentStatus}
                    params={{ order }}
                    actionTitle={t("Voir la commande")}
                    title={t("Paiement confirmé")}
                    description={t("Vos kg additionnels ont été payées")}
                    handleClose={() => {
                        setPaymentStatus(undefined)
                    }}
                    onClose={() => {
                        setPaymentStatus(undefined)
                        //commandSavedData.current = null
                    }}
                    status={paymentStatus as any}
                    verifyTransaction={() => {
                        handlePayInvoice(false)
                    }}
                    verificationPending={mutation.isPending}
                    routerBack
                    retryFailed={() => handlePayInvoice(true)}
                />

            </>

        )
    }
    return (
        <>
            <ActionModal show={show} title={t("Description de la commande")} onClose={onClose}>
                <Text className="text-[16px] font-jakarta text-dark-400 dark:text-gray-200">{order.orderTitle}</Text>
                <View className="my-6">
                    <Text className="font-jakarta-semibold text-[14px] text-primary dark:text-primary">{t("Options incluses")}</Text>
                    <View className="mt-6 gap-y-1 flex-row  items-center gap-x-4">
                        <View className="p-2">
                            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none" >
                                <Path d="M12.4998 1.66669V10C12.4998 10.9167 11.7498 11.6667 10.8332 11.6667H1.6665V5.00002C1.6665 3.15835 3.15817 1.66669 4.99984 1.66669H12.4998Z" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[200]} stroke-linecap="round" stroke-linejoin="round" />
                                <Path d="M18.3332 11.6667V14.1667C18.3332 15.55 17.2165 16.6667 15.8332 16.6667H14.9998C14.9998 15.75 14.2498 15 13.3332 15C12.4165 15 11.6665 15.75 11.6665 16.6667H8.33317C8.33317 15.75 7.58317 15 6.6665 15C5.74984 15 4.99984 15.75 4.99984 16.6667H4.1665C2.78317 16.6667 1.6665 15.55 1.6665 14.1667V11.6667H10.8332C11.7498 11.6667 12.4998 10.9167 12.4998 10V4.16669H14.0332C14.6332 4.16669 15.1832 4.4917 15.4832 5.00836L16.9082 7.50002H15.8332C15.3748 7.50002 14.9998 7.87502 14.9998 8.33335V10.8334C14.9998 11.2917 15.3748 11.6667 15.8332 11.6667H18.3332Z" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[200]} stroke-linecap="round" stroke-linejoin="round" />
                                <Path d="M6.66667 18.3333C7.58714 18.3333 8.33333 17.5871 8.33333 16.6667C8.33333 15.7462 7.58714 15 6.66667 15C5.74619 15 5 15.7462 5 16.6667C5 17.5871 5.74619 18.3333 6.66667 18.3333Z" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[200]} stroke-linecap="round" stroke-linejoin="round" />
                                <Path d="M13.3332 18.3333C14.2536 18.3333 14.9998 17.5871 14.9998 16.6667C14.9998 15.7462 14.2536 15 13.3332 15C12.4127 15 11.6665 15.7462 11.6665 16.6667C11.6665 17.5871 12.4127 18.3333 13.3332 18.3333Z" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[200]} stroke-linecap="round" stroke-linejoin="round" />
                                <Path d="M18.3333 10V11.6667H15.8333C15.375 11.6667 15 11.2917 15 10.8333V8.33333C15 7.875 15.375 7.5 15.8333 7.5H16.9083L18.3333 10Z" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[200]} stroke-linecap="round" stroke-linejoin="round" />
                            </Svg>
                        </View>

                        <View className="flex-1 gap-y-1">
                            <Text className="font-jakarta-medium text-[16px] text-dark-400 dark:text-gray-100">{shippings[order.deliveryType]}</Text>
                            <View className="flex-row items-center gap-x-2 flex-1">
                                <Text className="font-jakarta text-[14px] text-dark-300 dark:text-gray-400">{`~${order.executionDuration}h approx`}</Text>
                                <View className="w-[3px] h-[3px] rounded-full bg-dark-300 dark:bg-gray"></View>
                                <Text className="font-jakarta text-[14px] text-dark-300 dark:text-gray-400">{t("Au plus {{date}}", {
                                    date: formatFrenchSmartDate().toLowerCase()
                                })}</Text>
                            </View>
                        </View>
                    </View>
                    {
                        order.addons!.REPASSAGE && (
                            <View className="mt-6 gap-y-1 flex-row  items-center gap-x-4">
                                <View className="p-2">
                                    <Svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                                        <Path fillRule="evenodd" clipRule="evenodd" d="M4.06619 1.75H18.7573V5.99146C18.4861 5.97261 18.1315 5.95086 17.6876 5.92916C16.491 5.87067 14.6449 5.8125 12.0349 5.8125C6.84329 5.8125 4.07717 6.41667 2.34704 8.89039C1.525 10.0657 0.97253 11.5474 0.627483 12.703C0.453201 13.2868 0.328248 13.7998 0.246686 14.1677C0.205863 14.3518 0.175799 14.5001 0.155776 14.6033C0.145762 14.6549 0.138251 14.6953 0.133156 14.7233L0.127311 14.7559L0.125725 14.7649L0.125018 14.769L0 15.5H20V0.5H4.06619V1.75ZM17.6273 7.17769C18.1123 7.2014 18.4862 7.22505 18.7573 7.24455V14.25H1.50275C1.57793 13.9268 1.68195 13.5173 1.81772 13.0626C2.14912 11.9526 2.65558 10.6218 3.36348 9.60961C4.69324 7.70833 6.82292 7.0625 12.0349 7.0625C14.6267 7.0625 16.4525 7.12026 17.6273 7.17769ZM6.83512 12.375C7.52147 12.375 8.07787 11.8154 8.07787 11.125C8.07787 10.4346 7.52147 9.875 6.83512 9.875C6.14877 9.875 5.59237 10.4346 5.59237 11.125C5.59237 11.8154 6.14877 12.375 6.83512 12.375ZM10.5634 12.375C11.2497 12.375 11.8061 11.8154 11.8061 11.125C11.8061 10.4346 11.2497 9.875 10.5634 9.875C9.87701 9.875 9.32061 10.4346 9.32061 11.125C9.32061 11.8154 9.87701 12.375 10.5634 12.375ZM15.5344 11.125C15.5344 11.8154 14.978 12.375 14.2916 12.375C13.6053 12.375 13.0489 11.8154 13.0489 11.125C13.0489 10.4346 13.6053 9.875 14.2916 9.875C14.978 9.875 15.5344 10.4346 15.5344 11.125Z" fill={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[200]} />
                                    </Svg>

                                </View>

                                <View className="flex-1 gap-y-1">
                                    <Text className="font-jakarta-medium text-[16px] text-dark-400 dark:text-gray-100">{t("Repassage des linges")}</Text>
                                    <View className="flex-row items-center gap-x-2 flex-1">
                                        <Text className="font-jakarta text-[14px] text-dark-300 dark:text-gray-400">{t("Option activé")}</Text>
                                    </View>
                                </View>
                            </View>
                        )
                    }


                </View>
            </ActionModal>

        </>

    )
}

export function StatusInvoice({ invoice, contained, icon }: { icon?: boolean, invoice?: IInvoice, contained?: boolean }) {
    const { colorScheme } = useColorScheme()
    if (invoice?.status == "SUCCESS") {
        return (
            <View className={clx("flex-row items-center gap-x-2 px-1.5 py-1 rounded-[5px] ", !contained ? "bg-green-500/10 dark:bg-green-500/10" : "bg-green-500 dark:bg-green-dark-500")}>
                <View>
                    <Svg width="8" height="7" viewBox="0 0 8 7" fill="none" >
                        <Path d="M7 1.5L4.65205 4.31754C3.99647 5.10423 3.66869 5.49758 3.22812 5.51756C2.78755 5.53755 2.42549 5.17549 1.70139 4.45139L1 3.75" stroke={!contained ? (colorScheme == "light" ? theme.extend.colors.green[500] : theme.extend.colors.green[500]) : (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[200])} strokeWidth="1.5" strokeLinecap="round" />
                    </Svg>
                </View>
                <View>
                    <Text className={clx("text-[12px] font-jakarta-medium ", !contained ? "text-green-500 dark:text-green-500" : "text-white dark:text-gray-200")}>{t("Payé")}</Text>
                </View>
            </View>
        )
    } else if (invoice?.status == "CANCELED") {
        return (
            <View className={clx("flex-row items-center gap-x-2 px-1.5 py-1 rounded-[5px] ", !contained ? "bg-gray/10 dark:bg-dark-lighter" : "bg-gray dark:bg-dark-lighter")}>
                <View>
                    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <Path d="M10.5 3.5L3.5 10.5" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]} strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M3.5 3.5L10.5 10.5" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>

                </View>
                <View>
                    <Text className={clx("text-[12px] font-jakarta-medium ", !contained ? "text-dark dark:text-gray-200" : "text-dark dark:text-gray-200")}>{t("Non Payé")}</Text>
                </View>
            </View>
        )
    }else {
        return (
            <View className={clx("flex-row items-center gap-x-2 px-1.5 py-1 rounded-[5px] ", !contained ? "bg-red/10 dark:bg-red-500/10" : "bg-red dark:bg-red-500")}>
                <View>
                    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <Path d="M10.5 3.5L3.5 10.5" stroke={colorScheme == "light" ? theme.extend.colors.red.DEFAULT : theme.extend.colors.red[500]} strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M3.5 3.5L10.5 10.5" stroke={colorScheme == "light" ? theme.extend.colors.red.DEFAULT : theme.extend.colors.red[500]} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>

                </View>
                <View>
                    <Text className={clx("text-[12px] font-jakarta-medium ", !contained ? "text-red dark:text-red-500" : "text-white dark:text-gray-200")}>{t("Non Payé")}</Text>
                </View>
            </View>
        )
    }
}