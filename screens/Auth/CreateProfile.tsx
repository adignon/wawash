import { createUserAccount } from "@/api/auth";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input, InputLabel } from "@/components/Input";
import { ProfileInput } from "@/components/ProfileImage";
import { SafeView } from "@/components/View";
import { capitalize } from "@/helpler";
import { useForm } from "@/hooks/useForm";
import { useStore } from "@/store/store";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { t } from "i18next";
import Joi from "joi";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

export function CreateProfile() {
    const imageRef = React.useRef<string | undefined>(undefined)
    const { phone, token } = useLocalSearchParams<{ phone: string, token: string }>()
    const { getValues, field, isFormValid } = useForm({
        firstname: {
            defaultValue: "",
            validator: Joi.string()
                .pattern(/^[a-z\-\s]+$/i)
                .min(3)
                .messages({
                    "string.base": "Le prénom doit être une chaîne de caractères.",
                    "string.empty": "Le prénom est requis.",
                    "string.pattern.base": "Le prénom ne doit contenir que des lettres, espaces ou tirets.",
                    "string.min": "Le prénom doit contenir au moins 3 caractères.",
                }),
        },
        lastname: {
            defaultValue: "",
            validator: Joi.string()
                .pattern(/^[a-z\-\s]+$/i)
                .min(3)
                .messages({
                    "string.base": "Le nom doit être une chaîne de caractères.",
                    "string.empty": "Le nom est requis.",
                    "string.pattern.base": "Le nom ne doit contenir que des lettres, espaces ou tirets.",
                    "string.min": "Le nom doit contenir au moins 3 caractères.",
                }),
        },
        email: {
            defaultValue: "",
            validator: Joi.string()
                .email()
                .messages({
                    "string.base": "L'adresse email doit être une chaîne de caractères.",
                    "string.empty": "L'adresse email est requise.",
                    "string.email": "L'adresse email n'est pas valide.",
                }),
        },
    });
    const setUser = useStore((s) => s.setUser);
    const setToken = useStore((s) => s.setToken);
    const mutation = useMutation({
        mutationFn: createUserAccount,
        mutationKey: ["create-profile"]
    })
    const handleCreateProfile = async () => {
        const { isValid } = isFormValid(true)
        if (!isValid) {
            return Toast.show({
                text2: t("Vous devez renseigner tous les champs requis pour continuer."),
                type: "error"
            })
        }
        const values: any = getValues()
        try {
            let profileImage = undefined
            if (imageRef.current) {
                const filename = imageRef.current.split("/").pop() || "image.jpg";
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                profileImage = {
                    uri: imageRef.current,
                    name: filename,
                    type,
                }
            }
            const result = await mutation.mutateAsync({
                email: values.email,
                firstname: values.firstname,
                lastname: values.lastname,
                phone,
                profileImage,
                token
            })
            const data = result.user
            setUser(data)
            setToken(result.acessToken.token)
            router.push({
                pathname: "/auth/welcome",
                params: {
                    firstname: capitalize(values.firstname),
                    isNewUser: "true"
                }
            })
        } catch (e: any) {
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
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-white dark:bg-dark-bg">
            <SafeView safeZone="bottom" className="bg-light   flex-1">
                <Header title={t("Créer votre profile")} />
                <ScrollView className="flex-1">
                    <View className="mx-auto mt-6">
                        <ProfileInput onImage={(file) => imageRef.current = file} />
                    </View>
                    <View className="px-4 gap-y-6 mt-6">
                        <View>
                            <Input
                                {...field("firstname")}
                                placeholder={t("Entrez votre nom de famille")}
                                label={<InputLabel title={t("Nom de famille")} />}
                            />
                        </View>
                        <View>
                            <Input
                                {...field("lastname")}
                                placeholder={t("Entrez votre prénom")}
                                label={<InputLabel title={t("Prénom")} />}
                            />
                        </View>
                        <View>
                            <Input
                                {...field("email")}
                                placeholder={t("Entrez votre email")}
                                label={<InputLabel title={t("Email")} />}
                            />
                        </View>
                    </View>
                </ScrollView>
                <View className="p-4">
                    <Button.Primary loading={mutation.isPending} onPress={handleCreateProfile} disabled={!isFormValid().isValid} label={t("Créer mon profile")} />
                </View>
            </SafeView>
        </KeyboardAvoidingView>
    )
}