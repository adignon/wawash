import { orderEval } from "@/api/merchants";
import { Button } from "@/components/Button";
import { BackButton, Header } from "@/components/Header";
import { Input, InputLabel } from "@/components/Input";
import { Text } from "@/components/Themed";
import { useForm } from "@/hooks/useForm";
import { useMutation } from "@tanstack/react-query";
import { t } from "i18next";
import Joi from "joi";
import { Alert, KeyboardAvoidingView, ScrollView, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";

export function AddOrder() {
    const { field, isFormValid, form, getValues } = useForm({
        commandId: {
            defaultValue: "",
            validator: Joi.string().min(6).messages({
                "string.base": "L'ID commande doit être une chaîne de caractères.",
                "string.empty": "L'ID commande est obligatoire.",
                "string.min": "L'ID commande doit contenir au moins {#limit} caractères.",
            })
        },
        kg: {
            defaultValue: "",
            validator: Joi.number().min(1).messages({
                "number.base": "L'ID commande doit être une chaîne de caractères.",
                "number.empty": "L'ID commande est obligatoire.",
                "number.min": "L'ID commande doit contenir au moins {#limit} caractères.",
            })
        }
    })
    const mutation = useMutation({
        mutationKey: ["eval" + form.commandId.value],
        mutationFn: orderEval
    })
    const handleSearch = async () => {
        if (!isFormValid().isValid) {
            return Alert.alert(t("Vérifier que tous les champs sont bien remplis avant de pouvoir continuer."))
        }
        const values = getValues()
        try {
            const data = await mutation.mutateAsync(values)
            console.log(data) 
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
    return (
        <KeyboardAvoidingView className="bg-white dark:bg-dark-bg flex-1">
            <View className="bg-primary-400/20">
                <Header
                    backButton={
                        <BackButton
                            renderIcon={({ color }) => (
                                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" >
                                    <Path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <Path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            )}
                        />
                    }
                    title={t("Démarrer une commande")}
                />
                <View className="gap-y-4 mb-8 mt-4 mx-6">
                    <Text className="font-jakarta-semibold text-dark dark:text-gray-100 text-[18px]">{t("Nouvelle commande")}</Text>
                    <Text className="font-jakarta text-[14px] text-dark-400">{t("Pour démarrer une nouvelle commande veuillez rechercher le numéro ID de la commande fournie et  accepter la commande")}</Text>
                </View>
            </View>
            <ScrollView className="flex-1" contentContainerClassName="flex-1">
                <View className="mx-4 flex-1">
                    <View className="flex-1">
                        <View className="mt-10 mb-8">
                            <Text className="font-jakarta-semibold  text-dark dark:text-gray-100  text-[14px]">{t("Information de localisation")}</Text>
                        </View>
                        <View className="gap-y-4">
                            <View>
                                <Input
                                    label={<InputLabel className="text-primary" title={t("ID Commande")} />}
                                    keyboardType="numeric"
                                    className="min-h-[100px]"
                                    placeholder={t("EX:#ID34356")}
                                    {...field('commandId')}
                                />
                            </View>
                            <View>
                                <Input
                                    label={<InputLabel className="text-primary" title={t("Poids du colis")} />}
                                    keyboardType="numeric"
                                    className="min-h-[100px]"
                                    placeholder={t("5")}
                                    right={
                                        <View className="px-2 py-1 rounded-[5px] bg-white shadow dark:bg-dark-lighter"><Text className="font-jakarta-medium text-[12px] text-dark-300 dark:text-gray-200">{t("kg")}</Text></View>
                                    }
                                    {...field('kg')}
                                />
                            </View>
                        </View>
                    </View>
                    <View>
                        <Button.Primary
                            loading={mutation.isPending}
                            onPress={handleSearch}
                            disabled={isFormValid().isValid}

                            label={<Text className="font-jakarta-semibold text-[18px] text-white dark:text-gray-100 text-center">{t("Rechercher")}</Text>}
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}