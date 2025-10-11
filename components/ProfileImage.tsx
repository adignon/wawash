import { Logger } from "@/helpler"
import { theme } from "@/tailwind.config"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { t } from "i18next"
import { useColorScheme } from "nativewind"
import React, { useState } from "react"
import { Alert, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"
import Toast from "react-native-toast-message"


export function ProfileImage({ imageUrl, icon, width = 120, height = 120, borderColor = theme.extend.colors.gray.DEFAULT, borderWidth = 1 }: { imageUrl?: string | null, icon?: any, width?: number, height?: number, borderColor?: string, borderWidth?: number }) {
    const { colorScheme } = useColorScheme()
    return (
        <View className="border border-gray relative  rounded-full bg-white dark:bg-dark-lighter dark:border-dark-border items-center justify-center  " style={{ width, height, borderWidth: borderColor ? borderWidth : undefined }}>
            {
                (imageUrl) ?
                    <Image
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 100 }}
                        className="rounded-full"
                        source={{ uri: imageUrl }}
                    />
                    :
                    <Svg width="28" height="30" viewBox="0 0 20 22" fill="none">
                        <Path d="M10 11C12.7614 11 15 8.76142 15 6C15 3.23858 12.7614 1 10 1C7.23858 1 5 3.23858 5 6C5 8.76142 7.23858 11 10 11Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray.DEFAULT : theme.extend.colors.dark[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M18.5899 21C18.5899 17.13 14.7399 14 9.9999 14C5.25991 14 1.40991 17.13 1.40991 21" stroke={colorScheme == "dark" ? theme.extend.colors.gray.DEFAULT : theme.extend.colors.dark[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
            }
            {icon ?? (
                <View className="absolute bottom-1 right-1 p-1 py-1 bg-white dark:bg-dark-lighter   rounded-full">
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <Path d="M6.76005 22H17.24C20 22 21.1 20.31 21.23 18.25L21.75 9.99C21.89 7.83 20.17 6 18 6C17.39 6 16.83 5.65 16.55 5.11L15.83 3.66C15.37 2.75 14.17 2 13.15 2H10.86C9.83005 2 8.63005 2.75 8.17005 3.66L7.45005 5.11C7.17005 5.65 6.61005 6 6.00005 6C3.83005 6 2.11005 7.83 2.25005 9.99L2.77005 18.25C2.89005 20.31 4.00005 22 6.76005 22Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray.DEFAULT : theme.extend.colors.dark[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M10.5 8H13.5" stroke={colorScheme == "dark" ? theme.extend.colors.gray.DEFAULT : theme.extend.colors.dark[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M12 18C13.79 18 15.25 16.54 15.25 14.75C15.25 12.96 13.79 11.5 12 11.5C10.21 11.5 8.75 12.96 8.75 14.75C8.75 16.54 10.21 18 12 18Z" stroke={colorScheme == "dark" ? theme.extend.colors.gray.DEFAULT : theme.extend.colors.dark[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                </View>
            )}

        </View>
    )
}
interface IProfileImageInt {
    initialUrl?: string,
    onImage: (file: string) => void
}
export const ProfileInput = ({ initialUrl, onImage }: IProfileImageInt) => {
    const [image, setImage] = React.useState(initialUrl ?? '')
    return (
        <ImagePickerWrapper onImage={onImage} {...{ image, setImage }}>
            {
                (image, pickImage) => (
                    <TouchableOpacity onPress={() => {
                        pickImage()
                    }}>
                        <ProfileImage imageUrl={image} />
                    </TouchableOpacity>
                )
            }
        </ImagePickerWrapper>
    )
}


type ImagePickerProps = {
    onImage?: (uri: string) => void;
    children: (image: string | null, pickImage: () => void) => React.ReactNode;
    image: string | null, setImage: (x: string) => void
};

export default function ImagePickerWrapper({ onImage, children, image, setImage }: ImagePickerProps) {
    const [] = useState<string | null>(null);

    const pickImage = async () => {
        try {
            // Ask permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission required", "We need access to your gallery.");
                return;
            }

            // Open picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images",
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            if (!result.canceled && result.assets[0].uri) {
                const uri = result.assets[0].uri;
                setImage(uri);
                onImage?.(uri);
            } else {
                Toast.show({
                    type: "error",
                    text2: t('Echec lors de la sélection de l\'image')
                })
            }
        } catch (err) {
            if (typeof err === "string") {

                Toast.show({
                    type: "error",
                    text2: t('Echec lors de la sélection de l\'image')
                })

            } else {
                Toast.show({
                    text2: t("Une erreur innatendue est survenue"),
                    type: "error"
                })
            }
            Logger.error(err);
        }
    };

    return <>{children(image, pickImage)}</>;
}