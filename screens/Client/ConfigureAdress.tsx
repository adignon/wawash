import { saveAdress } from "@/api/subscription";
import { Button, SwitcherButton } from "@/components/Button";
import { BackButton, Header } from "@/components/Header";
import { Input, InputLabel, InputPhoneNumber, SearchableInput } from "@/components/Input";
import { Text } from "@/components/Themed";
import { useForm } from "@/hooks/useForm";
import { country } from "@/storage/config";
import { LOCATIONS } from "@/storage/countries/bj.locations";
import { useStore } from "@/store/store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useMutation } from "@tanstack/react-query";
import * as Location from "expo-location";
import { router } from "expo-router";
import { t } from "i18next";
import Joi from "joi";
import React, { useMemo } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";

export function ConfigureAdress() {
    const setAddress = useStore((s) => s.setAddress)
    const address = useStore(s => s.address)
    const formData = {
        quartier: {
            defaultValue: (address?.quartier) ?? '',
            validator: Joi.string().min(3).messages({
                "string.base": "Le quartier doit être une chaîne de caractères.",
                "string.empty": "Le quartier est obligatoire.",
                "string.min": "Le quartier doit contenir au moins {#limit} caractères.",
            })
        },
        arrondissement: {
            defaultValue: (address?.arrondissement) ?? '',
            validator: Joi.string().min(3).messages({
                "string.base": "La ville doit être une chaîne de caractères.",
                "string.empty": "La ville est obligatoire.",
                "string.min": "La ville doit contenir au moins {#limit} caractères.",
            })
        },
        commune: {
            defaultValue: (address?.commune) ?? '',
            validator: Joi.string().min(3).messages({
                "string.base": "La commune doit être une chaîne de caractères.",
                "string.empty": "La commune est obligatoire.",
                "string.min": "La commune doit contenir au moins {#limit} caractères.",
            })
        },
        department: {
            defaultValue: (address?.department) ?? '',
            validator: Joi.string().min(3).messages({
                "string.base": "Le département doit être une chaîne de caractères.",
                "string.empty": "Le département est obligatoire.",
                "string.min": "Le département doit contenir au moins {#limit} caractères.",
            })
        },
        description: {
            defaultValue: (address?.description) ?? '',
            validator: (value:any) => {
                return value ? Joi.string().messages({
                    "string.base": "La description doit être une chaîne de caractères.",
                }).validate(value).error?.message : null
            }
        },
        contactFullname: {
            defaultValue: (address?.contactFullname) ?? '',
            validator: Joi.string().min(3).messages({
                "string.base": "Le nom du contact doit être une chaîne de caractères.",
                "string.empty": "Le nom du contact est obligatoire.",
                "string.min": "Le nom du contact doit contenir au moins {#limit} caractères.",
            })
        },
        contactPhone: {
            defaultValue: (address?.contactPhone) ?? '',
            validator: Joi.string().regex(/^01[0-9]{8}/).messages({
                "string.base": "Le numéro de téléphone doit être une chaîne de caractères.",
                "string.empty": "Le numéro de téléphone est obligatoire.",
                "string.pattern.base": "Le numéro de téléphone doit commencer par 01 et contenir exactement 8 chiffres supplémentaires.",
            }),
        }
    }
    const { isFormValid, getValues, field, form, setForm } = useForm(formData)

    const mutation = useMutation({
        mutationFn: saveAdress,
        mutationKey: ["saveAdress"]
    })
    const { bottom } = useSafeAreaInsets()
    const [addLocation, setAddLocation] = React.useState((address?.addLocation) ?? false)
    const { quartiers, villes, communes, departments } = useMemo(() => {
        let quartiers = Object.values(LOCATIONS.Quartier);
        let villes = Object.values(LOCATIONS.Arrondissement);
        let communes = Object.values(LOCATIONS.Commune);
        let departments = Object.values(LOCATIONS.Departement);

        let selectedVille: any = null;
        let selectedCommune: any = null;
        let selectedDepartment: any = null;

        // Si un quartier est choisi → déduire ville, commune, département
        if (form.quartier.value) {
            const quartier = quartiers.find((q) => q.name === form.quartier.value);
            if (quartier) {
                selectedVille = LOCATIONS.Arrondissement[quartier.parent as never];
                if (selectedVille) {
                    selectedCommune = LOCATIONS.Commune[selectedVille.parent as never];
                    if (selectedCommune) {
                        selectedDepartment = LOCATIONS.Departement[selectedCommune.parent as never];
                    }
                }
                villes = selectedVille ? [selectedVille] : villes;
                communes = selectedCommune ? [selectedCommune] : communes;
                departments = selectedDepartment ? [selectedDepartment] : departments;
            }
        }

        // Sinon si une ville est choisie → déduire commune, département
        else if (form.arrondissement.value) {
            selectedVille = villes.find((v) => v.name === form.arrondissement.value);
            if (selectedVille) {
                selectedCommune = LOCATIONS.Commune[selectedVille.parent as never];
                selectedDepartment = LOCATIONS.Departement[selectedCommune.parent as never];
                communes = selectedCommune ? [selectedCommune] : communes;
                departments = selectedDepartment ? [selectedDepartment] : departments;
                quartiers = quartiers.filter((q) => q.parent === selectedVille?.key);
            }
        }

        // Sinon si une commune est choisie → déduire département
        else if (form.commune.value) {
            selectedCommune = communes.find((c) => c.name === form.commune.value);
            if (selectedCommune) {
                selectedDepartment = LOCATIONS.Departement[selectedCommune.parent as never];
                departments = selectedDepartment ? [selectedDepartment] : departments;
                villes = villes.filter((v) => v.parent === selectedCommune?.key);
                quartiers = quartiers.filter((q) => villes.some((v) => v.key === q.parent));
            }
        }

        return {
            quartiers,
            villes,
            communes,
            departments,
        };
    }, [form.quartier.value, form.arrondissement.value, form.commune.value]);

    const getUserLocation = async () => {

        // Ask for permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(t("Vous devez autoriser l'accès de à votre localisation pour continuer"));
        }

        // Get location
        let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        return {
            latitude: location.coords.latitude.toString(),
            longitude: location.coords.longitude.toString(),
        };
    }

    const requireLocation = React.useRef<boolean | null>(null)
    const handleSubmit = async () => {
        const { isValid } = isFormValid()
        let location: any = null
        if (!isValid) {
            Alert.alert(t("Vérifier que tous les champs sont bien remplis avant d'enrégistrer"))
        } else if (requireLocation.current == null && !addLocation) {
            return Alert.alert(t("Localisation non ajoutée"), t("Nous recommandons que vous ajoutiez vos données de localisation pour un meuilleur adressage de votre localisation."), [
                {
                    text: t("Pas maintenant"),
                    onPress() {
                        requireLocation.current = false
                        handleSubmit()
                    }
                },
                {
                    text: t("Ajouter"),
                    isPreferred: true,
                    onPress: () => {
                        setAddLocation(true)
                        requireLocation.current = true
                        handleSubmit()
                    }
                }
            ])
        } else if (requireLocation.current) {
            try {
                location = await getUserLocation()
            } catch (e) {
                Alert.alert(t("Ooups!", t("Une erreur innattendue est survenue lors de la récupération de votre localisation. Veillez rééssayer!")))
            }
        }
        const values = getValues()
        const requestData: any = {
            quartier: values.quartier,
            commune: values.commune,
            arrondissement: values.arrondissement,
            department: values.department,
            contactFullname: values.contactFullname,
            contactPhone: values.contactPhone,
            description: values.description,
            coord: location
        }
        
        try {
             await mutation.mutateAsync({
                ...requestData,
                contactPhone: country.prefix + values.contactPhone
            })

            setAddress({
                ...requestData,
                addLocation
            })
            Toast.show({
                text2: t("Adresse enrégistrée avec succès !"),
                type: "success"
            })
            router.back()
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
        <BottomSheetModalProvider>
            <KeyboardAvoidingView className="flex-1 bg-white dark:bg-dark-bg" behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <View className="bg-white dark:bg-dark-bg flex-1">
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
                            title={t("Configurer votre adresse")}
                        />
                        <View className="gap-y-4 mb-8 mt-4 mx-6">
                            <Text className="font-jakarta-semibold text-dark dark:text-gray-100 text-[18px]">{t("Adresse de collecte et de livraison")}</Text>
                            <Text className="font-jakarta text-[14px] text-dark-400">{t("Nos agents utiliseront cette adresse pour venir collecter votre linge, l'acheminer au lavage puis vous le livrer une fois prêt.")}</Text>
                        </View>
                    </View>
                    <ScrollView className="flex-1">
                        <View style={{ marginBottom: bottom + 20 }}>
                            <View className=" mx-4" >
                                <View className="mt-10 mb-8">
                                    <Text className="font-jakarta-semibold  text-dark dark:text-gray-100  text-[14px]">{t("Information de localisation")}</Text>
                                </View>
                                <View className="gap-y-4">
                                    <View>
                                        <SearchableInput
                                            listTitle={t("Quartiers")}
                                            listDescription={t("Saisir our selectionner votre quartier")}
                                            label={<InputLabel className="text-primary" title={t("Quartier")} />}
                                            data={quartiers as any}
                                            placeholder={t("Entrer le nom de votre quartier")}
                                            {...field("quartier")}
                                        />
                                    </View>
                                    <View>
                                        <SearchableInput
                                            listTitle={t("Villes")}
                                            listDescription={t("Saisir our selectionner votre ville")}
                                            label={<InputLabel className="text-primary" title={t("Ville")} />}
                                            data={villes as any}
                                            placeholder={t("Entrer le nom de votre ville")}
                                            {...field("arrondissement")}
                                        />
                                    </View>
                                    <View>
                                        <SearchableInput
                                            listTitle={t("Communes")}
                                            listDescription={t("Saisir our selectionner votre commune")}
                                            label={<InputLabel className="text-primary" title={t("Commune")} />}
                                            data={communes as any}
                                            placeholder={t("Entrer le nom de votre commune")}
                                            {...field("commune")}
                                        />
                                    </View>
                                    <View>
                                        <SearchableInput
                                            listTitle={t("Departements")}
                                            listDescription={t("Saisir our selectionner votre département")}
                                            label={<InputLabel className="text-primary" title={t("Departement")} />}
                                            data={departments as any}
                                            placeholder={t("Entrer le nom de votre department")}
                                            {...field("department")}
                                        />
                                    </View>
                                    <View>
                                        <Input
                                            label={<InputLabel className="text-primary" title={t("Description Supplémentaire")} />}
                                            multiline={true}
                                            numberOfLines={5}
                                            className="min-h-[100px] align-top"
                                            placeholder={t("Décrivez vous plus précisément votre  zone d'habitation pour mieux orienter nos collecteurs de linge")}
                                            {...field('description')}
                                        />
                                    </View>
                                    <View className="mt-4">
                                        <SwitcherButton
                                            onShow={setAddLocation}
                                            show={addLocation}
                                            label={<InputLabel className=" text-[14px] text-dark-400" title={t("Ajouter mes données de localisation actuelles")} />}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View className=" mx-4 ">
                                <View className="mt-10 mb-8">
                                    <Text className="font-jakarta-semibold  text-dark dark:text-gray-100  text-[14px]">{t("Autre personne à  contacter en cas d'indisponibilité")}</Text>
                                </View>
                                <View className="gap-y-4">
                                    <View>
                                        <Input
                                            label={<InputLabel className="text-primary" title={t("Nom & Prénoms")} />}
                                            multiline={true}
                                            numberOfLines={3}
                                            placeholder={t("Entrez votre nom et prénoms ")}
                                            {...field('contactFullname')}
                                        />
                                    </View>
                                    <View>
                                        <InputPhoneNumber
                                            label={<InputLabel className="text-primary" title={t("Nom & Prénoms")} />}
                                            placeholder={t("01 91 91 91 91")}
                                            {...field('contactPhone')}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View className=" mx-4 mt-8">
                                <Button.Primary
                                    onPress={handleSubmit}
                                    loading={mutation.isPending}
                                    disabled={!isFormValid().isValid}
                                    label={t("Enrégister")}
                                />
                            </View>
                        </View>
                    </ScrollView>

                </View>
            </KeyboardAvoidingView>

        </BottomSheetModalProvider>

    )
}