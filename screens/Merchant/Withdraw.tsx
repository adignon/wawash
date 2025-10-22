import { addOrEditAdress, getAddress, getMerchant, getPaymentMethods, withdrawFunds } from "@/api/merchants"
import { Button } from "@/components/Button"
import { Header } from "@/components/Header"
import { Input, InputLabel, InputPhoneNumber } from "@/components/Input"
import { ActionModal } from "@/components/Modal"
import { ErrorRetry } from "@/components/State"
import { Text } from "@/components/Themed"
import { calculateFees, capitalize, clx, fnPart } from "@/helpler"
import { useForm } from "@/hooks/useForm"
import { country } from "@/storage/config"
import { IPaymentAccount, IPaymentAdress } from "@/store/type"
import { theme } from "@/tailwind.config"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Decimal } from "decimal.js"
import { Image } from "expo-image"
import { Redirect, router } from "expo-router"
import { useLocalSearchParams } from "expo-router/build/hooks"
import { t } from "i18next"
import Joi from "joi"
import parsePhoneNumberFromString, { isValidPhoneNumber } from "libphonenumber-js"
import { useColorScheme } from "nativewind"
import React, { useMemo } from "react"
import { Alert, ScrollView, TextInput, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Svg, { Path } from "react-native-svg"
import Toast from "react-native-toast-message"
import { PaymentModal } from "../Client/SubscriptionForm"

export function Withdraw() {
    const { balance, serviceFeeRate } = useLocalSearchParams<{ balance: string, serviceFeeRate: string, transfertFeeRate: string }>()
    const query = useQuery({
        queryKey: ["merchant"],
        queryFn: getMerchant,
        enabled: true
    })
    const { field, form, isFormValid, getValues } = useForm({
        amount: {
            validator(x, form) {
                if (!/^[0-9]+$/.test(x)) {
                    return t("Le montant doit uniqument contenir des chiffres")
                } else if (Decimal(balance ? balance : 0).lessThan(x ? x : 0)) {
                    return t("Le montant doit etres inférieur à votre balance qui est de {{ balance }}f", {
                        balance
                    })
                }
            },
            defaultValue: ""
        }
    })
    const [address, setAdress] = React.useState<IPaymentAdress | null>(null)
    const { bottom } = useSafeAreaInsets()

    const { onChangeText } = field("amount")

    const amounts = useMemo(() => {
        const account = query.data?.accounts?.find(a => a.adressMethodType == address?.adressMethodType)
        if (form?.amount?.value && address && account) {
            const fees = calculateFees(account, form?.amount?.value, "payout")
            const amount = Number((form?.amount?.value) ?? 0)
            const serviceFee = Number(serviceFeeRate ?? 0)
            const transfertFeesAmount = fees.feeAmount
            const serviceFeesAmount = Decimal(amount).mul(serviceFee).toNumber()
            const toReceive = Decimal(amount).minus(Decimal(serviceFeesAmount).add(transfertFeesAmount)).toNumber()
            return {
                initial: fnPart(amount, country).main,
                serviceFee: Decimal(serviceFee).mul(100).toNumber(),
                serviceFeeAmout: fnPart(serviceFeesAmount, country).main,
                transfertFeesAmount: fnPart(transfertFeesAmount, country).main,
                toReceiveAmount: toReceive,
                toReceive: toReceive > 0 ? fnPart(toReceive, country).main : toReceive,
                fees
            }
        }
    }, [form?.amount?.value, address, query.data])
    const mutation = useMutation({
        mutationKey: ["withdraw"],
        mutationFn: withdrawFunds
    })

    const [showModal, setShowModal] = React.useState(false)
    const handleSubmit = async () => {
        if (!isFormValid(true).isValid || !address || !amounts) {
            return Alert.alert(t("Oups!"), t("vous devez veuillez à renseigner un montant correcte et selectionner votre adresse de réception."))
        } else if (amounts.toReceiveAmount < 0) {
            return Alert.alert(t("Balance inssuffissante"), t("Vous n'avez pas assez de balance pour retirer ce montant."))
        }
        try {
            const values = getValues()
            const data = await mutation.mutateAsync({
                id: mutation.data?.id,
                addressId: address?.id,
                amout: values.amount,
                amoutToSend: amounts!.toReceiveAmount
            })
            console.log(data)
            query.refetch()
            setShowModal(true)
        } catch (e) {
            if (typeof e == "string") {
                Toast.show({
                    text2: e,
                    type: "error"
                })
            } else {
                Toast.show({
                    text2: t("Une erreur innatendue est survenue"),
                    type: "error"
                })
            }
        }

    }
    const queryMethods = useQuery({
        queryKey: ["methods-payment"],
        queryFn: getPaymentMethods
    })
    if (query.data && Number(balance)) {
        return (
            <>
                <BottomSheetModalProvider>
                    <View className="flex-1 bg-light dark:bg-dark-bg" style={{ paddingBottom: bottom }}>
                        <Header
                            title={t("Paiement")}
                        />
                        <ScrollView className="flex-1" >
                            <View className="flex-1">
                                <View className="gap-y-1 py-8 px-2">
                                    <Text className="text-[20px] font-jakarta-semibold dark:text-gray-100">{t("Retrait wallet")}</Text>
                                    <Text className="text-[14px] font-jakarta text-dark-400 dark:text-gray-100">{t("Veuillez entrer le montant de retrait souhaité. Des frais de services et de transfert seront déduits du montant retiré")}</Text>
                                </View>
                                <View className="flex-1">
                                    <View className="">
                                        <View className="flex-row px-4">
                                            <View className="p-2 px-2 rounded-full bg-primary-100 dark:bg-primary/10">
                                                <Text className="font-cabin-semibold text-[12px] text-primary dark:text-primary">{t("F CFA")}</Text>
                                            </View>
                                        </View>
                                        <View className="py-6 px-4 border-b border-gray-300 dark:border-dark-400">
                                            <TextInput className={clx("text-[70px] font-jakarta-semibold   p-4 p-4 text-[16px] text-white font-jakarta-medium placeholder:text-dark-300", form.amount.error ? "text-red dark:text-red-dark" : "text-dark dark:text-white")}
                                                onChangeText={(t) => {
                                                    const value = t.replace(/(\s|\,)/g, '')
                                                    if (onChangeText) onChangeText(value)
                                                }}
                                                value={form?.amount?.value ? fnPart(form?.amount?.value, country).main : undefined}

                                                placeholder={"1 000"}
                                                placeholderTextColor={theme.extend.colors.gray[400]}
                                            />

                                        </View>
                                        {
                                            (form?.amount?.error) && (
                                                <View className="p-2 px-4">
                                                    <Text className="font-jakarta-semibold text-red dark:text-red-dark text-[12px]">{form?.amount?.error}</Text>
                                                </View>
                                            )
                                        }

                                    </View>
                                    <View className="p-4 mt-4">
                                        <Text className="text-[18px] font-jakarta-semibold text-primary dark:text-primary">{t("Moyen de paiement")}</Text>
                                        <View className="mt-6">
                                            {
                                                queryMethods.isSuccess ? (
                                                    <PaymentMothod address={address} setAdress={setAdress} accounts={queryMethods.data} />
                                                ) : <></>
                                            }
                                            {
                                                queryMethods.isPending ? (
                                                    <View className="flex-row gap-x-4 items-center">
                                                        <View className="w-[70px] h-[70px] rounded-full bg-gray-200 dark:bg-dark-400">
                                                        </View>
                                                        <View className="gap-y-2 flex-1">
                                                            <View className="w-4/12 h-[15px] rounded-full bg-gray-200 dark:bg-dark-300"></View>
                                                            <View className="w-6/12 h-[15px] rounded-full bg-gray-200 dark:bg-dark-400"></View>
                                                        </View>
                                                    </View>
                                                ) : <></>
                                            }
                                            {
                                                queryMethods.isError ?(
                                                    <ErrorRetry
                                                        retry={queryMethods.refetch}

                                                    />
                                                ):<></>
                                            }

                                        </View>

                                    </View>
                                </View>
                            </View>

                        </ScrollView>
                        <View className="p-4">
                            {
                                form.amount.value && address && amounts ? (
                                    <View className="bg-gray-100 dark:bg-dark-lighter rounded-[15px] p-4">
                                        <Text className="font-jakarta-semibold text-dark dark:text-primary text-[18px] mb-2">{t("Résumé")}</Text>
                                        <View className="flex-row items-center justify-between pt-4 border-b border-gray-300 dark:border-dark-400 pb-4">
                                            <Text className="font-jakarta text-dark-400 dark:text-gray-100 text-[14px]">{t("Montant à retirer")}</Text>
                                            <Text className="font-jakarta-semibold text-dark-400 dark:text-white text-[14px]">{amounts?.initial}f</Text>
                                        </View>
                                        {
                                            amounts?.serviceFee ? (
                                                <View className="flex-row items-center justify-between pt-4 border-b border-gray-300 dark:border-dark-400 pb-4">
                                                    <Text className="font-jakarta text-dark-400 dark:text-gray-100 text-[14px]">{t("Frais de service")}</Text>
                                                    <Text className="font-jakarta-semibold text-dark-400 dark:text-white text-[14px]"><Text className="text-[10px] font-jakarta">(-{amounts.serviceFee}%) </Text>{amounts.serviceFeeAmout}f</Text>
                                                </View>
                                            ) : <></>
                                        }
                                        {
                                            amounts?.fees ? (
                                                <View className="flex-row items-center justify-between pt-4 border-b border-gray-300 dark:border-dark-400 pb-4">
                                                    <Text className="font-jakarta text-dark-400 dark:text-gray-100 text-[14px]">{t("Frais de transfert")}</Text>
                                                    <Text className="font-jakarta-semibold text-dark-400 dark:text-white text-[14px]"><Text className="text-[10px] font-jakarta">{amounts.fees.type == "percent" ? `(-${amounts.fees.value}%) ` : ''}</Text>{amounts.transfertFeesAmount}f</Text>
                                                </View>
                                            ) : <></>
                                        }
                                        {
                                            amounts?.toReceiveAmount ? (
                                                <View className="flex-row items-center justify-between pt-4">
                                                    <Text className="font-jakarta text-dark-400 dark:text-gray-100 text-[14px]">{t("Montant à recevoir")}</Text>
                                                    <Text className="font-jakarta-semibold text-dark-400 dark:text-white text-[14px]">{amounts.toReceive}f</Text>
                                                </View>) : <></>
                                        }
                                    </View>
                                ) : <></>
                            }
                            <View className="mt-6">
                                <Button.Primary loading={mutation.isPending} onPress={handleSubmit} disabled={!form.amount.value || !address} label={t("Retirer")} />
                            </View>
                        </View>
                    </View>
                </BottomSheetModalProvider>

                <PaymentModal
                    open={showModal && !!mutation.data}
                    params={{ payment: mutation.data }}
                    actionTitle={t("Voir la commande")}
                    title={t("Paiement éffectué")}
                    description={t("Votre requete de paiement a été traitée avec succès!")}
                    pendingTitle={t("Requete de paiement soumis")}
                    pendingDescription={t("Votre demande de paiement a été soumis et sera taité dans un délai de 24h.")}
                    handleClose={() => {
                        setShowModal(false)
                        if (mutation.data?.id) {
                            router.dismissTo("/merchant/wallet?paymentId=" + mutation.data.id as any)
                        }
                    }}
                    onClose={() => {
                        setShowModal(false)
                        if (mutation.data?.id) {
                            router.dismissTo("/merchant/wallet")
                        }
                    }}
                    verificationPending={mutation.isPending}
                    verifyTransaction={() => {
                        if (mutation.data) {
                            handleSubmit()
                        }
                    }}
                    status={mutation.data?.status?.toLowerCase() as any}
                />
            </>
        )
    } else {
        return (
            <Redirect href={".."} />
        )
    }

}

const PaymentMothod = ({ address, setAdress, accounts }: {address:IPaymentAdress|null, setAdress:any, accounts:IPaymentAccount[]}) => {
    const { colorScheme } = useColorScheme()
    const [open, setOpen] = React.useState(false)
    const { transfertFeeRate } = useLocalSearchParams<{ balance: string, serviceFeeRate: string, transfertFeeRate: string }>()
    return (
        <>
            <View className="">
                <TouchableOpacity onPress={() => {
                    if (address) {
                        setAdress(undefined)
                    } else {
                        setOpen(true)
                    }
                }} className="flex-row items-center gap-x-4 ">
                    {
                        address ? (
                            <AdressItem adress={address} paymentMethod={accounts?.find(p=>p.adressMethodType==address.adressMethodType)}  right={(
                                <View className="w-[20px] h-[20px] justify-center items-center rounded-full bg-gray-300 dark:bg-dark-400">
                                    <Svg width="30" height="29" viewBox="0 0 30 29" fill="none" >
                                        <Path d="M11.4646 18.0355L18.5357 10.9645" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[400]} strokeLinecap="round" strokeLinejoin="round" />
                                        <Path d="M18.5357 18.0355L11.4646 10.9645" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[400]} strokeLinecap="round" strokeLinejoin="round" />
                                    </Svg>

                                </View>
                            )} />
                        ) : (
                            <View className="flex-row items-center gap-x-4 ">
                                <View className="w-[70px] h-[70px] justify-center items-center rounded-full bg-gray-200 dark:bg-gray-400 ">
                                    <Image
                                        source={require("@/assets/images/mobile-money.png")}
                                        style={{
                                            width: 50,
                                            height: 50
                                        }}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-jakarta-semibold text-dark dark:text-gray-100 text-[16px]">{t("Mobile money")}</Text>
                                    <Text className="font-jakarta text-dark-400 dark:text-dark-300 text-[14px] mt-2">{t("Recevoir avec les paiements mobiles sur vos réseaux préférés.")}{transfertFeeRate ? t(" Des frais de transfert au plus de {{fees}}% seront prélevés par le réseau.", {
                                        fees: Decimal(transfertFeeRate).mul(100).toNumber()
                                    }) : <></>}</Text>
                                </View>
                                <View>
                                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" >
                                        <Path d="M14.4302 5.92999L20.5002 12L14.4302 18.07" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <Path d="M3.5 12H20.33" stroke={colorScheme == "light" ? theme.extend.colors.dark[400] : theme.extend.colors.gray[100]} strokeWidth="0" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    </Svg>

                                </View>
                            </View >
                        )
                    }
                </TouchableOpacity >
            </View >
            <PaymentMethodModal
                adress={address}
                setAdress={(x: any) => setAdress(x)}
                onClose={() => {
                    setOpen(false)
                }}
                accounts={accounts}
                open={open}
            />
        </>

    )
}
interface IPaymentMethodModal {
    open: boolean,
    onClose: () => void,
    adress?: IPaymentAdress | null,
    setAdress: (x: IPaymentAdress) => void
     accounts:IPaymentAccount[]

}
const PaymentMethodModal = ({ open,accounts, onClose, adress, setAdress }: IPaymentMethodModal) => {
    const [content, setContent] = React.useState("list")
    const [editItem, setEditItem] = React.useState(null)
    const adressQuery = useQuery({
        queryKey: ["getAddress"],
        queryFn: getAddress
    })
    const handleAdd = async (x: IPaymentAdress, refresh = false) => {
        setAdress(x)
        setContent("list")
        if (refresh) await adressQuery.refetch()
    }
    const handleClose = () => {
        if (content == "list") {
            onClose()
        } else {
            setContent("list")
        }
    }

    return (
        <ActionModal
            title={
                <View className="flex-1 flex-row items-center justify-between">
                    <Text className="font-jakarta-semibold text-[18px] text-dark dark:text-gray-100">{content == "list" ? t("Mes Addresses ") : (editItem ? t("Editer adresse") : t("Nouvelle adresse"))}</Text>
                    <View>
                        {
                            content == "list" && (
                                <TouchableOpacity onPress={() => {
                                    setContent("edit")
                                }} className="flex-row items-center gap-x-2 rounded-full p-2 bg-primary/20 dark:bg-primary/20">
                                    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none" >
                                        <Path d="M8.00002 15.0711V0.928932" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <Path d="M15.0711 8H0.928955" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </Svg>
                                    <Text className="font-jakarta-medium text-[14px] text-primary dark:text-primary">{t("Ajouter")}</Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>
                </View>
            }
            onClose={handleClose} show={open}>
            {
                content == "list" && (!Array.isArray(adressQuery.data) || adressQuery.data.length) ? <AdressesList  accounts={accounts} onSelect={(x) => {
                    handleAdd(x)
                    onClose()
                }} selected={adress} query={adressQuery} /> : <EditPaymentMethod accounts={accounts} onAdd={handleAdd} />
            }

        </ActionModal>
    )
}

interface IEditPayment {
    adress?: IPaymentAdress,
    onAdd: (x: IPaymentAdress, refresh: boolean) => void,
    accounts:IPaymentAccount[]
}
const EditPaymentMethod = ({ adress, onAdd, accounts }: IEditPayment) => {
    const { form, setForm, field, isFormValid, getValues } = useForm({
        method: {
            defaultValue: (adress?.adressMethodType) ?? accounts[0].adressMethodType
        },
        phone: {
            defaultValue: (adress?.adress) ?? "",
            validator: (x) => {
                if (!isValidPhoneNumber(x, country.code as any)) {
                    return t("Le numéro de téléphone n'est pas valide veuillez vérifier à nouveau et rééssayer.")
                }
            }
        },
        fullname: {
            defaultValue: (adress?.adress) ?? "",
            validator: Joi.string().min(3).messages({
                "string.base": "Le nom doit être une chaîne de caractères.",
                "string.empty": "Le nom est obligatoire.",
                "string.min": "Le nom doit contenir au moins {#limit} caractères.",
            })
        }

    })
    const mutation = useMutation({
        mutationKey: ["add-adress"],
        mutationFn: addOrEditAdress
    })
    const { colorScheme } = useColorScheme()
    const handleSumbit = async () => {
        if (!isFormValid(true).isValid) {
            return (
                Alert.alert(t("Formulaire invalide", t("Certains champs de votre formulaire sont invalides. Veuillez les corriger et rééssayer.")))
            )
        }
        const value = getValues()
        try {

            const data = await mutation.mutateAsync({
                adress: "+229" + value.phone,
                id: adress ? adress.id : undefined,
                methodType: value.method,
                fullname: value.fullname
            })
            onAdd(data, true)
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
        <View>
            <View className="flex-row gap-x-2">
                {
                    accounts.map((d) => {
                        const isActive = d.adressMethodType == form.method.value
                        return (
                            <View className="flex-1 ">
                                <TouchableOpacity onPress={() => setForm(prev => ({ ...prev, method: { ...prev.method, value: d.adressMethodType } }))} className={clx("rounded-[15px] items-center  gap-y-2 p-2", isActive ? "bg-primary/10 dark:bg-primary/10" : "")}>
                                    <Image
                                        style={{
                                            width: 70,
                                            height: 70,
                                            objectFit: "cover",
                                            borderRadius: 70
                                        }}
                                        source={process.env.EXPO_PUBLIC_API_URL + "/assets/images/" + d.adressMethodType + ".png"}
                                        className="rounded-full"
                                    />
                                    <View className="mt-1 flex-row items-center gap-x-2">
                                        <View className={clx("w-[15px] h-[15px] rounded-full ", isActive ? "bg-primary dark:bg-primary-500" : "bg-gray-300")}>
                                            <Svg width="16" height="15" viewBox="0 0 16 15" fill="none">
                                                <Path d="M3.625 8.75L5.35809 10.0498C5.78678 10.3713 6.39272 10.2978 6.73205 9.88305L11.75 3.75" stroke={isActive ? (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[200]) : (colorScheme == "light" ? theme.extend.colors.gray[100] : theme.extend.colors.dark[300])} strokeLinecap="round" />
                                            </Svg>
                                        </View>
                                        <Text className="text-center text-dark text-[16px] font-jakarta-semibold dark:text-gray-100">{d.methodTitle}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )
                    })
                }

            </View>
            <View className=" my-6 gap-y-4">
                <Input
                    label={
                        <InputLabel title={t("Nom du compte")} />
                    }
                    {...field("fullname")}
                    placeholder={t("Entrez le nom du compte")}
                />
                <InputPhoneNumber
                    label={<InputLabel title={t("Numéro de réception")} />}
                    {...field("phone")}
                    placeholder={t("Ex:01 91 98 00 00")}
                />
                <View className="mt-6">
                    <Button.Primary
                        onPress={handleSumbit}
                        disabled={mutation.isPending || !isFormValid().isValid}
                        label={(adress?.id) ? t("Éditer") : t("Ajouter")}
                    />
                </View>
            </View>
        </View>
    )
}
interface IAdressList {
    query: any,
    onSelect: (x: IPaymentAdress) => void,
    selected?: IPaymentAdress | null,
    accounts:IPaymentAccount[]
}
const AdressesList = ({ query, selected, onSelect, accounts }: IAdressList) => {

    return (
        <View>
            {
                query.isFetching ? (
                    <View className="gap-y-4 ">
                        {
                            Array.from(new Array(2)).map((_, i) => (
                                <View className="flex-row gap-x-4 items-center" key={i}>
                                    <View className="w-[70px] h-[70px] rounded-full bg-slate-200 dark:bg-dark-300"></View>
                                    <View className="gap-y-2 flex-1">
                                        <View className="w-1/10 h-[12px] rounded-full bg-slate-200 dark:bg-dark-300"></View>
                                        <View className="w-1/6 h-[12px] rounded-full bg-slate-100 dark:bg-dark-400"></View>
                                    </View>
                                </View>
                            ))
                        }
                    </View>
                ) : <></>
            }
            <View className="gap-y-4">
                {query.data?.length ? (
                    query.data.map((d: IPaymentAdress) => {
                        const isActive = d.id == selected?.id
                        return (
                            <TouchableOpacity key={d.id} onPress={() => onSelect(d)} className="flex-1 flex-row gap-x-4 items-center">
                                <AdressItem
                                    adress={d}
                                    isActive={isActive}
                                    paymentMethod={accounts?.find(p=>p.adressMethodType==d.adressMethodType)}
                                />
                            </TouchableOpacity>
                        )
                    })
                ) : <></>}

            </View>
        </View>
    )
}

const AdressItem = ({
    adress: d,
    isActive,
    right,
    paymentMethod
}: {
    adress: IPaymentAdress,
    isActive?: boolean,
    right?: any
    paymentMethod?:IPaymentAccount
}) => {
    const method = paymentMethod
    console.log(d)
    const { colorScheme } = useColorScheme()
    return (
        <View className="flex-row items-center flex-1">
            <View className="flex-1 flex-row gap-x-4 items-center">
                <Image
                    style={{
                        width: 70,
                        height: 70,
                        objectFit: "cover",
                        borderRadius: 70
                    }}
                    source={process.env.EXPO_PUBLIC_API_URL + "/assets/images/" + d.adressMethodType + ".png"}
                    className="rounded-full"
                />
                <View className="">
                    <Text className="font-jakarta-semibold text-dark dark:text-gray-100 text-[18px]">{parsePhoneNumberFromString(d.adress, country.code as any)?.formatNational()!}</Text>
                    <View className=" gap-x-2 ">
                        <Text className="font-jakarta-medium text-[12px] text-dark dark:text-gray-200">{t(capitalize(method?.methodTitle ?? ""))}</Text>
                        <Text className="font-jakarta-medium text-[12px] text-dark-300 dark:text-gray-200">{t(capitalize(d.name))}</Text>
                    </View>
                </View>
            </View>
            <View>
                {
                    right ?? <></>
                }
                {
                    isActive && (
                        <View className={clx("w-[15px] h-[15px] rounded-full ", isActive ? "bg-primary dark:bg-primary-500" : "bg-gray-300")}>
                            <Svg width="16" height="15" viewBox="0 0 16 15" fill="none">
                                <Path d="M3.625 8.75L5.35809 10.0498C5.78678 10.3713 6.39272 10.2978 6.73205 9.88305L11.75 3.75" stroke={isActive ? (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[200]) : (colorScheme == "light" ? theme.extend.colors.gray[100] : theme.extend.colors.dark[300])} strokeLinecap="round" />
                            </Svg>
                        </View>
                    )
                }

            </View>
        </View>
    )
}

